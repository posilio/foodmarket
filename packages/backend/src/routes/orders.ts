// Express router for order endpoints — all routes require authentication.
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  createOrderHandler,
  listOrders,
  getOrder,
} from "../controllers/orders.controller";

const router = Router();

router.post("/orders", requireAuth, createOrderHandler);
router.get("/orders", requireAuth, listOrders);
router.get("/orders/:id", requireAuth, getOrder);

export default router;
