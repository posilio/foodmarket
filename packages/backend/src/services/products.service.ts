// Business logic for products and categories.
// All database access goes through the Prisma singleton — never directly from controllers.
import prisma from "../lib/prisma";

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
}) {
  const activeOnly = options?.activeOnly ?? true;

  return prisma.product.findMany({
    where: {
      ...(activeOnly ? { isActive: true } : {}),
      ...(options?.categorySlug
        ? { category: { slug: options.categorySlug } }
        : {}),
    },
    include: productInclude,
    orderBy: { name: "asc" },
  });
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
