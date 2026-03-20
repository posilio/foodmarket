// Routes for product reviews.
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getReviewsForProduct, createReview } from "../services/reviews.service";
import { awardPoints } from "../services/loyalty.service";
import { AppError } from "../lib/errors";
import { assertMaxLength } from "../lib/validate";
import prisma from "../lib/prisma";
import logger from "../lib/logger";

const router = Router();

// GET /products/:slug/reviews — public
router.get("/products/:slug/reviews", async (req, res, next) => {
  try {
    const result = await getReviewsForProduct(String(req.params["slug"]));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /products/:slug/reviews — authenticated customers only
router.post("/products/:slug/reviews", requireAuth, async (req, res, next) => {
  try {
    const { rating, body } = req.body as { rating?: unknown; body?: unknown };

    if (rating === undefined || rating === null) {
      throw new AppError("rating is required", 400);
    }

    if (typeof body === "string") {
      assertMaxLength(body, 1000, "body");
    }

    const slug = String(req.params["slug"]);
    const customerId = req.customerId!;

    const review = await createReview(
      customerId,
      slug,
      Number(rating),
      typeof body === "string" ? body : undefined
    );
    res.status(201).json({ data: review });

    // Award loyalty points if this customer has a DELIVERED order containing the product.
    // Fire-and-forget — failure must not affect the review response.
    (async () => {
      try {
        const product = await prisma.product.findUnique({
          where: { slug },
          select: { id: true, name: true },
        });
        if (!product) return;

        const deliveredOrder = await prisma.order.findFirst({
          where: {
            customerId,
            status: "DELIVERED",
            lines: {
              some: { variant: { productId: product.id } },
            },
          },
          select: { id: true },
        });

        if (deliveredOrder) {
          await awardPoints(customerId, 500, `Review for product: ${slug}`);
        }
      } catch (err) {
        logger.error({ err, customerId, slug }, "Failed to award loyalty points for review");
      }
    })();
  } catch (err) {
    next(err);
  }
});

export default router;
