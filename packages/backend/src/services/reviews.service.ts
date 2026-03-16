// Business logic for product reviews.
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";

export async function getReviewsForProduct(productSlug: string) {
  const product = await prisma.product.findUnique({ where: { slug: productSlug } });
  if (!product) throw new AppError("Product not found", 404);

  const reviews = await prisma.review.findMany({
    where: { productId: product.id },
    select: {
      id: true,
      rating: true,
      body: true,
      createdAt: true,
      customer: { select: { firstName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : null;

  return { reviews, averageRating, totalReviews };
}

export async function createReview(
  customerId: string,
  productSlug: string,
  rating: number,
  body?: string
) {
  const product = await prisma.product.findUnique({ where: { slug: productSlug } });
  if (!product) throw new AppError("Product not found", 404);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError("rating must be an integer between 1 and 5", 400);
  }

  return prisma.review.upsert({
    where: { productId_customerId: { productId: product.id, customerId } },
    update: { rating, body: body ?? null },
    create: { productId: product.id, customerId, rating, body: body ?? null },
    select: {
      id: true,
      rating: true,
      body: true,
      createdAt: true,
      updatedAt: true,
      customer: { select: { firstName: true } },
    },
  });
}
