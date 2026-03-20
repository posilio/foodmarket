// Business logic for orders.
// All order creation happens in a single Prisma transaction — nothing is partially written.
import { OrderStatus } from "@prisma/client";
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";
import { sendOrderConfirmation } from "../lib/email";
import { SHIPPING_FLAT_RATE_CENTS } from "../config/env";
import { validateDiscountCode } from "./discount.service";
import { getBalance, redeemPoints } from "./loyalty.service";

// Design constants
const CENTS_PER_POINT = 1; // 1 loyalty point = €0.01

export interface OrderLineInput {
  variantId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerId: string;
  shippingAddressId: string;
  lines: OrderLineInput[];
  notes?: string;
  discountCode?: string;
  redeemPoints?: number;
}

const orderInclude = {
  lines: {
    include: {
      variant: {
        include: { product: true },
      },
    },
  },
  payment: true,
  events: { orderBy: { createdAt: "asc" as const } },
} as const;

export async function createOrder(input: CreateOrderInput) {
  const { customerId, shippingAddressId, lines, notes, discountCode, redeemPoints: redeemPointsCount } = input;

  // ── 1. Basic input validation ──────────────────────────────────────────────
  if (!lines.length) {
    throw new AppError("Order must contain at least one item", 400);
  }
  for (const line of lines) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      throw new AppError("Each line quantity must be a positive integer", 400);
    }
  }

  // ── 2. Fetch all requested variants in one query ───────────────────────────
  const variantIds = lines.map((l) => l.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  // ── 3. Every requested variant must exist ─────────────────────────────────
  if (variants.length !== variantIds.length) {
    throw new AppError("One or more products not found", 404);
  }

  // ── 4. Every variant must be active ───────────────────────────────────────
  const inactive = variants.find((v) => !v.isActive || !v.product.isActive);
  if (inactive) {
    throw new AppError("One or more products are unavailable", 400);
  }

  // ── 5. Stock check ────────────────────────────────────────────────────────
  const variantMap = new Map(variants.map((v) => [v.id, v]));
  for (const line of lines) {
    const variant = variantMap.get(line.variantId)!;
    if (variant.stockQuantity < line.quantity) {
      throw new AppError(`Insufficient stock for: ${variant.sku}`, 400);
    }
  }

  // ── 6. Calculate total server-side (lines + flat-rate shipping) ───────────
  const lineTotal = lines.reduce((sum, line) => {
    const variant = variantMap.get(line.variantId)!;
    return sum + variant.priceEuroCents * line.quantity;
  }, 0);
  const shippingCents = SHIPPING_FLAT_RATE_CENTS;

  // ── 6a. Apply discount code (against line total only) ─────────────────────
  let discountEuroCents = 0;
  let discountCodeId: string | undefined;

  if (discountCode) {
    const result = await validateDiscountCode(discountCode, lineTotal);
    discountEuroCents = result.discountEuroCents;
    discountCodeId = result.codeId;
  }

  // ── 6b. Apply loyalty points redemption (against reduced line total) ──────
  let pointsDiscountCents = 0;
  let pointsRedeemed = 0;

  if (redeemPointsCount && redeemPointsCount > 0) {
    if (!Number.isInteger(redeemPointsCount) || redeemPointsCount < 1) {
      throw new AppError("redeemPoints must be a positive integer", 400);
    }
    const balance = await getBalance(customerId);
    if (balance < redeemPointsCount) {
      throw new AppError(
        `Insufficient loyalty points — balance: ${balance}, requested: ${redeemPointsCount}`,
        400
      );
    }
    // Points apply to lines only (not shipping), after discount code is applied
    const lineAfterDiscount = lineTotal - discountEuroCents;
    pointsDiscountCents = Math.min(redeemPointsCount * CENTS_PER_POINT, lineAfterDiscount);
    pointsRedeemed = redeemPointsCount;
  }

  const totalEuroCents = lineTotal + shippingCents - discountEuroCents - pointsDiscountCents;

  // ── 7. Validate the shipping address belongs to this customer ─────────────
  const address = await prisma.address.findFirst({
    where: { id: shippingAddressId, customerId },
  });
  if (!address) {
    throw new AppError("Invalid shipping address", 400);
  }

  // ── 8. Single transaction: create order + lines + event + discount/loyalty ──
  // Stock is decremented in the payment webhook after Mollie confirms payment.
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        customerId,
        shippingAddressId,
        totalEuroCents,
        shippingCents,
        discountCodeId: discountCodeId ?? null,
        discountEuroCents,
        loyaltyPointsRedeemed: pointsRedeemed,
        loyaltyPointsDiscountCents: pointsDiscountCents,
        notes,
        status: OrderStatus.PENDING,
        stockReservedUntil: new Date(Date.now() + 30 * 60 * 1000),
        lines: {
          create: lines.map((line) => ({
            variantId: line.variantId,
            quantity: line.quantity,
            unitPriceEuroCents: variantMap.get(line.variantId)!.priceEuroCents,
          })),
        },
        events: {
          create: {
            eventType: "ORDER_CREATED",
            toStatus: OrderStatus.PENDING,
            note: "Order placed by customer",
          },
        },
      },
      include: orderInclude,
    });

    // Atomically increment usedCount on the discount code
    if (discountCodeId) {
      await tx.discountCode.update({
        where: { id: discountCodeId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Create the loyalty points debit row
    if (pointsRedeemed > 0) {
      await redeemPoints(
        customerId,
        pointsRedeemed,
        `Redeemed at order ${newOrder.id}`,
        tx
      );
    }

    return newOrder;
  });

  // Re-fetch with full includes so TypeScript knows the relations are present.
  // ($transaction inference loses the `include` shape; re-fetch is the cleanest fix.)
  const fullOrder = await prisma.order.findUniqueOrThrow({
    where: { id: order.id },
    include: orderInclude,
  });

  // Send confirmation email outside the transaction — failures don't affect the order
  const customer = await prisma.customer.findUnique({
    where: { id: input.customerId },
    select: { email: true },
  });
  if (customer) {
    await sendOrderConfirmation(fullOrder, customer.email);
  }

  return fullOrder;
}

export async function getOrdersByCustomer(customerId: string) {
  return prisma.order.findMany({
    where: { customerId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: string, customerId: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });

  // Return 404 for both "not found" and "belongs to another customer"
  // to avoid leaking order existence to other customers.
  if (!order || order.customerId !== customerId) {
    throw new AppError("Order not found", 404);
  }

  return order;
}
