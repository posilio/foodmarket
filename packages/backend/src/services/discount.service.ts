// Business logic for discount code validation.
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";

export interface DiscountValidationResult {
  discountEuroCents: number;
  codeId: string;
  type: string;
  description: string;
}

/**
 * Validates a discount code against the current line total.
 * Throws 400 AppError if the code is invalid, expired, or exhausted.
 * Returns the computed discount amount and code metadata.
 */
export async function validateDiscountCode(
  code: string,
  lineTotalCents: number
): Promise<DiscountValidationResult> {
  const dc = await prisma.discountCode.findUnique({ where: { code } });

  if (!dc || !dc.isActive) {
    throw new AppError("Invalid or inactive discount code", 400);
  }
  if (dc.expiresAt && dc.expiresAt < new Date()) {
    throw new AppError("Discount code has expired", 400);
  }
  if (dc.maxUses !== null && dc.usedCount >= dc.maxUses) {
    throw new AppError("Discount code has been fully used", 400);
  }

  let discountEuroCents: number;
  let description: string;

  if (dc.type === "FLAT") {
    discountEuroCents = dc.amountCents ?? 0;
    description = `€${((dc.amountCents ?? 0) / 100).toFixed(2)} off`;
  } else {
    discountEuroCents = Math.floor((lineTotalCents * (dc.percent ?? 0)) / 100);
    description = `${dc.percent ?? 0}% off`;
  }

  // Clamp: discount cannot exceed the line total
  discountEuroCents = Math.min(discountEuroCents, lineTotalCents);

  return { discountEuroCents, codeId: dc.id, type: dc.type, description };
}
