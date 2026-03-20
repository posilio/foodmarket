// Business logic for customer loyalty points.
// Points are stored as a ledger — positive rows = earned, negative rows = redeemed.
// Balance is derived by summing non-expired rows.
import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";

const POINTS_EXPIRY_DAYS = 365;

function expiryDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + POINTS_EXPIRY_DAYS);
  return d;
}

/** Returns the current non-expired point balance for a customer. */
export async function getBalance(customerId: string): Promise<number> {
  const result = await prisma.loyaltyPoint.aggregate({
    where: {
      customerId,
      expiresAt: { gt: new Date() },
    },
    _sum: { points: true },
  });
  return result._sum.points ?? 0;
}

/** Awards points to a customer (creates a positive ledger row). */
export async function awardPoints(
  customerId: string,
  points: number,
  reason: string
): Promise<void> {
  await prisma.loyaltyPoint.create({
    data: { customerId, points, reason, expiresAt: expiryDate() },
  });
}

/**
 * Redeems points inside a transaction (creates a negative ledger row).
 * Throws 400 AppError if non-expired balance is insufficient.
 */
export async function redeemPoints(
  customerId: string,
  points: number,
  reason: string,
  tx: Prisma.TransactionClient
): Promise<void> {
  const result = await tx.loyaltyPoint.aggregate({
    where: {
      customerId,
      expiresAt: { gt: new Date() },
    },
    _sum: { points: true },
  });
  const balance = result._sum.points ?? 0;
  if (balance < points) {
    throw new AppError(
      `Insufficient loyalty points — balance: ${balance}, requested: ${points}`,
      400
    );
  }
  await tx.loyaltyPoint.create({
    data: { customerId, points: -points, reason, expiresAt: expiryDate() },
  });
}

/** Admin manual adjustment (positive or negative). */
export async function adjustPoints(
  customerId: string,
  points: number,
  reason: string
): Promise<void> {
  await prisma.loyaltyPoint.create({
    data: { customerId, points, reason, expiresAt: expiryDate() },
  });
}
