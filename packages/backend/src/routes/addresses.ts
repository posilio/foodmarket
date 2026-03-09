// Express router for address endpoints — requires authentication.
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { createAddress } from "../services/addresses.service";
import { AppError } from "../lib/errors";

const router = Router();

router.post("/addresses", requireAuth, async (req, res, next) => {
  try {
    const { street, houseNumber, houseNumberAddition, postalCode, city, country } =
      req.body as {
        street?: string;
        houseNumber?: string;
        houseNumberAddition?: string;
        postalCode?: string;
        city?: string;
        country?: string;
      };

    if (!street || !houseNumber || !postalCode || !city) {
      throw new AppError(
        "street, houseNumber, postalCode, and city are required",
        400
      );
    }

    const address = await createAddress(req.customerId!, {
      street,
      houseNumber,
      houseNumberAddition,
      postalCode,
      city,
      country,
    });

    res.status(201).json({ data: address });
  } catch (err) {
    next(err);
  }
});

export default router;
