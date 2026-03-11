// Request handlers for payment routes.
// Validates input, calls the payments service, and formats the HTTP response.
import { Request, Response, NextFunction } from "express";
import {
  createPayment,
  handleWebhook,
  getPaymentStatus,
} from "../services/payments.service";
import { AppError } from "../lib/errors";
import logger from "../lib/logger";

// POST /payments/create — requires login.
export async function createPaymentHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
}

// POST /payments/webhook — unauthenticated, called by Mollie.
// Must always return 200 — Mollie retries on any other status code.
export async function webhookHandler(req: Request, res: Response) {
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
}

// GET /payments/status/:orderId — requires login.
export async function getPaymentStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payment = await getPaymentStatus(
      String(req.params["orderId"]),
      req.customerId!
    );
    res.json({ data: payment });
  } catch (err) {
    next(err);
  }
}
