// Routes for product reviews.
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getReviewsForProduct, createReview } from "../services/reviews.service";
import { AppError } from "../lib/errors";

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

    const review = await createReview(
      req.customerId!,
      String(req.params["slug"]),
      Number(rating),
      typeof body === "string" ? body : undefined
    );
    res.status(201).json({ data: review });
  } catch (err) {
    next(err);
  }
});

export default router;
