// Routes for customer loyalty points.
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getBalance } from "../services/loyalty.service";

const router = Router();

// GET /loyalty/balance — returns the authenticated customer's current point balance.
router.get("/loyalty/balance", requireAuth, async (req, res, next) => {
  try {
    const balance = await getBalance(req.customerId!);
    res.json({ data: { balance } });
  } catch (err) {
    next(err);
  }
});

export default router;
