// Business logic for customer authentication.
// Issues and validates JWTs, hashes passwords, and manages customer registration/refresh tokens.
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";
import { JWT_SECRET, JWT_ACCESS_EXPIRES_IN } from "../config/env";
import { sendPasswordResetEmail } from "../lib/email";

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_TTL_DAYS = 30;

// Fields safe to return to the client — never include passwordHash.
const safeCustomerSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  isActive: true,
  isAdmin: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

function generateAccessToken(customerId: string, email: string): string {
  return jwt.sign(
    { sub: customerId, email },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions
  );
}

async function createRefreshToken(customerId: string): Promise<string> {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token, customerId, expiresAt } });
  return token;
}

export async function registerCustomer(input: RegisterInput) {
  const existing = await prisma.customer.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const customer = await prisma.customer.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    },
    select: safeCustomerSelect,
  });

  const token = generateAccessToken(customer.id, customer.email);
  const refreshToken = await createRefreshToken(customer.id);

  return { token, refreshToken, customer };
}

export async function loginCustomer(input: LoginInput) {
  // Look up by email — use the same error for both "not found" and "wrong password"
  // to avoid leaking whether an email address exists.
  const customer = await prisma.customer.findUnique({
    where: { email: input.email },
  });

  const invalidCredentials = new AppError("Invalid credentials", 401);

  if (!customer) {
    // Still run bcrypt.compare to prevent timing attacks that reveal email existence.
    // Using a fixed dummy hash that will always fail comparison.
    const DUMMY_HASH = "$2b$12$invalidhashpaddingtomatchbcryptlengthXXXXXXXXXXXXXXXXXX";
    await bcrypt.compare(input.password, DUMMY_HASH).catch(() => {});
    throw invalidCredentials;
  }

  const passwordValid = await bcrypt.compare(input.password, customer.passwordHash);
  if (!passwordValid) {
    throw invalidCredentials;
  }

  if (!customer.isActive) {
    throw new AppError("Account disabled", 403);
  }

  const token = generateAccessToken(customer.id, customer.email);
  const refreshToken = await createRefreshToken(customer.id);

  const { passwordHash: _, ...safeCustomer } = customer;
  return { token, refreshToken, customer: safeCustomer };
}

export async function refreshAccessToken(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { customer: { select: safeCustomerSelect } },
  });

  if (!stored || stored.expiresAt < new Date()) {
    // Delete expired token if found
    if (stored) {
      await prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => {});
    }
    throw new AppError("Invalid or expired refresh token", 401);
  }

  if (!stored.customer.isActive) {
    throw new AppError("Account disabled", 403);
  }

  // Rotate: delete old, create new
  await prisma.refreshToken.delete({ where: { id: stored.id } });
  const newToken = generateAccessToken(stored.customer.id, stored.customer.email);
  const newRefreshToken = await createRefreshToken(stored.customer.id);

  return { token: newToken, refreshToken: newRefreshToken, customer: stored.customer };
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    select: safeCustomerSelect,
  });
}

const RESET_TOKEN_TTL_MINUTES = 15;

export async function forgotPassword(email: string): Promise<void> {
  const customer = await prisma.customer.findUnique({ where: { email } });

  // Always resolve — never reveal whether the email exists.
  if (!customer || !customer.isActive) return;

  // Clean up any existing tokens for this customer first.
  await prisma.passwordResetToken.deleteMany({ where: { customerId: customer.id } });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { tokenHash, customerId: customer.id, expiresAt },
  });

  await sendPasswordResetEmail(customer.email, rawToken);
}

export async function deleteMyAccount(customerId: string): Promise<void> {
  const anonymisedEmail = `deleted_${customerId}@deleted.invalid`;
  await prisma.$transaction([
    prisma.refreshToken.deleteMany({ where: { customerId } }),
    prisma.address.deleteMany({ where: { customerId } }),
    prisma.customer.update({
      where: { id: customerId },
      data: {
        email: anonymisedEmail,
        firstName: "Deleted",
        lastName: "User",
        phone: null,
        passwordHash: "",
        isActive: false,
      },
    }),
  ]);
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  if (newPassword.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const stored = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.customer.update({
      where: { id: stored.customerId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.delete({ where: { tokenHash } }),
    prisma.refreshToken.deleteMany({ where: { customerId: stored.customerId } }),
  ]);
}
