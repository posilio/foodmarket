// Business logic for orders.
// All order creation happens in a single Prisma transaction — nothing is partially written.
import { OrderStatus } from "@prisma/client";
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";
import { sendOrderConfirmation } from "../lib/email";

export interface OrderLineInput {
  variantId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerId: string;
  shippingAddressId: string;
  lines: OrderLineInput[];
  notes?: string;
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
  const { customerId, shippingAddressId, lines, notes } = input;

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

  // ── 6. Calculate total server-side ────────────────────────────────────────
  const totalEuroCents = lines.reduce((sum, line) => {
    const variant = variantMap.get(line.variantId)!;
    return sum + variant.priceEuroCents * line.quantity;
  }, 0);

  // ── 7. Validate the shipping address belongs to this customer ─────────────
  const address = await prisma.address.findFirst({
    where: { id: shippingAddressId, customerId },
  });
  if (!address) {
    throw new AppError("Invalid shipping address", 400);
  }

  // ── 8. Single transaction: create order + lines + decrement stock + event ──
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        customerId,
        shippingAddressId,
        totalEuroCents,
        notes,
        status: OrderStatus.PENDING,
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

    // Decrement stock for each variant
    await Promise.all(
      lines.map((line) =>
        tx.productVariant.update({
          where: { id: line.variantId },
          data: { stockQuantity: { decrement: line.quantity } },
        })
      )
    );

    return newOrder;
  });

  // Send confirmation email outside the transaction — failures don't affect the order
  const customer = await prisma.customer.findUnique({
    where: { id: input.customerId },
    select: { email: true },
  });
  if (customer) {
    await sendOrderConfirmation(order, customer.email);
  }

  return order;
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
