// Express router for payment endpoints.
// POST /payments/create  — authenticated, creates a Mollie payment for an order
// POST /payments/webhook — unauthenticated, Mollie posts payment status updates here
// GET  /payments/status/:orderId — authenticated, returns current payment record
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  createPaymentHandler,
  webhookHandler,
  getPaymentStatusHandler,
} from "../controllers/payments.controller";

const router = Router();

router.post("/payments/create", requireAuth, createPaymentHandler);
router.post("/payments/webhook", webhookHandler);
router.get("/payments/status/:orderId", requireAuth, getPaymentStatusHandler);

export default router;
