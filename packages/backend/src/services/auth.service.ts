// Business logic for customer authentication.
// Issues and validates JWTs, hashes passwords, and manages customer registration.
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env";

const BCRYPT_ROUNDS = 12;

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

  return customer;
}

export async function loginCustomer(input: LoginInput) {
  // Look up by email — use the same error for both "not found" and "wrong password"
  // to avoid leaking whether an email address exists.
  const customer = await prisma.customer.findUnique({
    where: { email: input.email },
  });

  const invalidCredentials = new AppError("Invalid credentials", 401);

  if (!customer) {
    // Still run bcrypt to prevent timing attacks that reveal email existence.
    await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    throw invalidCredentials;
  }

  const passwordValid = await bcrypt.compare(input.password, customer.passwordHash);
  if (!passwordValid) {
    throw invalidCredentials;
  }

  if (!customer.isActive) {
    throw new AppError("Account disabled", 403);
  }

  const token = jwt.sign(
    { sub: customer.id, email: customer.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );

  const { passwordHash: _, ...safeCustomer } = customer;
  return { token, customer: safeCustomer };
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    select: safeCustomerSelect,
  });
}
