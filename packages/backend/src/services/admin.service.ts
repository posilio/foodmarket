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

// ─── Pagination helper ────────────────────────────────────────────────────────

export interface PaginationParams {
  limit?: number;
  cursor?: string;
}

export interface PagedResult<T> {
  data: T[];
  nextCursor: string | null;
  total: number;
}

function parsePagination(params: PaginationParams) {
  const take = Math.min(Number(params.limit) || 20, 100);
  const cursor = params.cursor ? { id: params.cursor } : undefined;
  return { take, cursor };
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getAllOrders(
  statusFilter?: string,
  pagination: PaginationParams = {}
): Promise<PagedResult<Awaited<ReturnType<typeof prisma.order.findMany>>[number]>> {
  const where =
    statusFilter && statusFilter in OrderStatus
      ? { status: statusFilter as OrderStatus }
      : {};

  const { take, cursor } = parsePagination(pagination);

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: adminOrderInclude,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  let nextCursor: string | null = null;
  if (items.length > take) {
    const next = items.pop()!;
    nextCursor = next.id;
  }

  return { data: items, nextCursor, total };
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

export async function getAllProductsAdmin(
  pagination: PaginationParams = {}
): Promise<PagedResult<Awaited<ReturnType<typeof prisma.product.findMany>>[number]>> {
  const { take, cursor } = parsePagination(pagination);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      include: adminProductInclude,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count(),
  ]);

  let nextCursor: string | null = null;
  if (items.length > take) {
    const next = items.pop()!;
    nextCursor = next.id;
  }

  return { data: items, nextCursor, total };
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
  imageUrl?: string;
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
      imageUrl: input.imageUrl,
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

export interface UpdateProductInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  countryOfOrigin?: string;
  categoryId?: string;
  isActive?: boolean;
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError("Product not found", 404);

  // Regenerate slug if name changed
  let slug: string | undefined;
  if (input.name && input.name !== product.name) {
    const base = generateSlug(input.name);
    const existing = await prisma.product.findFirst({
      where: { slug: base, NOT: { id } },
    });
    slug = existing ? `${base}-${Date.now()}` : base;
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(slug !== undefined && { slug }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      ...(input.countryOfOrigin !== undefined && { countryOfOrigin: input.countryOfOrigin }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
    include: adminProductInclude,
  });
}

export interface AddVariantInput {
  sku: string;
  label: string;
  priceEuroCents: number;
  stockQuantity?: number;
  weightGrams?: number;
}

export async function addVariant(productId: string, input: AddVariantInput) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError("Product not found", 404);

  return prisma.productVariant.create({
    data: {
      productId,
      sku: input.sku,
      label: input.label,
      priceEuroCents: input.priceEuroCents,
      stockQuantity: input.stockQuantity ?? 0,
      weightGrams: input.weightGrams,
    },
  });
}

export interface UpdateVariantInput {
  label?: string;
  priceEuroCents?: number;
  isActive?: boolean;
  ean?: string | null;
}

export async function updateVariant(
  productId: string,
  variantId: string,
  input: UpdateVariantInput
) {
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
  });
  if (!variant) throw new AppError("Variant not found for this product", 404);

  return prisma.productVariant.update({
    where: { id: variantId },
    data: {
      ...(input.label !== undefined && { label: input.label }),
      ...(input.priceEuroCents !== undefined && { priceEuroCents: input.priceEuroCents }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      // Convert empty string to null so the unique constraint works correctly
      ...(input.ean !== undefined && { ean: input.ean === "" ? null : input.ean }),
    },
  });
}

// ─── Low stock alerts ─────────────────────────────────────────────────────────

export interface LowStockVariant {
  id: string;
  sku: string;
  label: string;
  stockQuantity: number;
  product: { name: string; slug: string };
}

export async function getLowStockVariants(threshold = 5): Promise<LowStockVariant[]> {
  return prisma.productVariant.findMany({
    where: { stockQuantity: { lte: threshold }, isActive: true },
    select: {
      id: true,
      sku: true,
      label: true,
      stockQuantity: true,
      product: { select: { name: true, slug: true } },
    },
    orderBy: { stockQuantity: 'asc' },
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
