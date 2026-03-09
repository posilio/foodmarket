// Express router for payment endpoints.
// POST /payments/create  — authenticated, creates a Mollie payment for an order
// POST /payments/webhook — unauthenticated, Mollie posts payment status updates here
// GET  /payments/status/:orderId — authenticated, returns current payment record
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  createPayment,
  handleWebhook,
  getPaymentStatus,
} from "../services/payments.service";
import { AppError } from "../lib/errors";
import logger from "../lib/logger";

const router = Router();

// POST /payments/create — requires login
router.post("/payments/create", requireAuth, async (req, res, next) => {
  try {
    const { orderId } = req.body as { orderId?: string };
    if (!orderId || typeof orderId !== "string") {
      throw new AppError("orderId is required", 400);
    }
    const result = await createPayment(orderId, req.customerId!);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
});

// POST /payments/webhook — NO auth (called by Mollie's servers)
// Mollie sends: Content-Type: application/x-www-form-urlencoded, body: id=tr_xxxxx
// Must always return 200 — Mollie retries on any other status code
router.post("/payments/webhook", async (req, res) => {
  const id = (req.body as Record<string, string>)["id"];
  if (!id) {
    logger.warn("Webhook received without payment id");
    res.sendStatus(200);
    return;
  }
  try {
    await handleWebhook(id);
  } catch (err) {
    logger.error({ err }, "Webhook handler threw — returning 200 anyway");
  }
  res.sendStatus(200);
});

// GET /payments/status/:orderId — requires login
router.get("/payments/status/:orderId", requireAuth, async (req, res, next) => {
  try {
    const payment = await getPaymentStatus(
      String(req.params["orderId"]),
      req.customerId!
    );
    res.json({ data: payment });
  } catch (err) {
    next(err);
  }
});

export default router;
