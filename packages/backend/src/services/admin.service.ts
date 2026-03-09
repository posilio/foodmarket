// Business logic for admin operations — order management, product management, stock updates.
import { OrderStatus } from "@prisma/client";
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";
import { sendShippingNotification } from "../lib/email";

// ─── Shared includes ──────────────────────────────────────────────────────────

const adminOrderInclude = {
  customer: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  shippingAddress: true,
  lines: {
    include: {
      variant: { include: { product: true } },
    },
  },
  payment: true,
  events: { orderBy: { createdAt: "asc" as const } },
} as const;

const adminProductInclude = {
  category: true,
  variants: { orderBy: { createdAt: "asc" as const } },
  allergens: true,
  dietaryLabels: true,
} as const;

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getAllOrders(statusFilter?: string) {
  const where =
    statusFilter && statusFilter in OrderStatus
      ? { status: statusFilter as OrderStatus }
      : {};

  return prisma.order.findMany({
    where,
    include: adminOrderInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderByIdAdmin(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: adminOrderInclude,
  });
  if (!order) throw new AppError("Order not found", 404);
  return order;
}

export async function updateOrderStatus(id: string, newStatus: OrderStatus) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new AppError("Order not found", 404);

  const updatedOrder = await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: { status: newStatus },
    });

    await tx.orderEvent.create({
      data: {
        orderId: id,
        eventType: "STATUS_UPDATED",
        fromStatus: order.status,
        toStatus: newStatus,
        note: `Status changed from ${order.status} to ${newStatus}`,
      },
    });

    // Re-fetch after both writes so the response includes the new event
    return tx.order.findUniqueOrThrow({
      where: { id },
      include: adminOrderInclude,
    });
  });

  // Send shipping notification outside the transaction — failures don't affect the update
  if (newStatus === OrderStatus.SHIPPED) {
    const customer = await prisma.customer.findUnique({
      where: { id: updatedOrder.customerId },
      select: { email: true },
    });
    if (customer) {
      await sendShippingNotification(updatedOrder, customer.email);
    }
  }

  return updatedOrder;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getAllProductsAdmin() {
  return prisma.product.findMany({
    include: adminProductInclude,
    orderBy: { createdAt: "desc" },
  });
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export interface CreateProductInput {
  name: string;
  categoryId: string;
  countryOfOrigin: string;
  description?: string;
  variants: Array<{
    label: string;
    sku: string;
    priceEuroCents: number;
    stockQuantity?: number;
    weightGrams?: number;
  }>;
}

export async function createProduct(input: CreateProductInput) {
  if (!input.variants || input.variants.length === 0) {
    throw new AppError("At least one variant is required", 400);
  }

  const slug = generateSlug(input.name);

  // Check for slug collision — append a short suffix if needed
  const existing = await prisma.product.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  return prisma.product.create({
    data: {
      name: input.name,
      slug: finalSlug,
      categoryId: input.categoryId,
      countryOfOrigin: input.countryOfOrigin,
      description: input.description,
      variants: {
        create: input.variants.map((v) => ({
          label: v.label,
          sku: v.sku,
          priceEuroCents: v.priceEuroCents,
          stockQuantity: v.stockQuantity ?? 0,
          weightGrams: v.weightGrams,
        })),
      },
    },
    include: adminProductInclude,
  });
}

export async function updateVariantStock(
  productId: string,
  variantId: string,
  stockQuantity: number
) {
  // Verify the variant belongs to the product
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
  });
  if (!variant) throw new AppError("Variant not found for this product", 404);

  return prisma.productVariant.update({
    where: { id: variantId },
    data: { stockQuantity },
  });
}
