// Express router for address endpoints — requires authentication.
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { createAddress, getAddressesByCustomer } from "../services/addresses.service";
import { AppError } from "../lib/errors";

const router = Router();

router.get("/addresses", requireAuth, async (req, res, next) => {
  try {
    const addresses = await getAddressesByCustomer(req.customerId!);
    res.json({ data: addresses });
  } catch (err) {
    next(err);
  }
});

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
