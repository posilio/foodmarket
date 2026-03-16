// Business logic for products and categories.
// All database access goes through the Prisma singleton — never directly from controllers.
import prisma from "../lib/prisma";
import { PaginationParams, PagedResult } from "./admin.service";

const productInclude = {
  category: true,
  variants: {
    where: { isActive: true },
    orderBy: { priceEuroCents: "asc" as const },
  },
  allergens: true,
  dietaryLabels: true,
} as const;

export async function getAllProducts(options?: {
  categorySlug?: string;
  activeOnly?: boolean;
  pagination?: PaginationParams;
  q?: string;
}): Promise<PagedResult<Awaited<ReturnType<typeof prisma.product.findMany>>[number]>> {
  const activeOnly = options?.activeOnly ?? true;
  const pagination = options?.pagination ?? {};
  const q = options?.q?.trim();

  const where = {
    ...(activeOnly ? { isActive: true } : {}),
    ...(options?.categorySlug
      ? { category: { slug: options.categorySlug } }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const take = Math.min(Number(pagination.limit) || 100, 200);
  const cursor = pagination.cursor ? { id: pagination.cursor } : undefined;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor,
      orderBy: { name: "asc" },
    }),
    prisma.product.count({ where }),
  ]);

  let nextCursor: string | null = null;
  if (items.length > take) {
    const next = items.pop()!;
    nextCursor = next.id;
  }

  return { data: items, nextCursor, total };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: { where: { isActive: true } } },
      },
    },
  });
}
