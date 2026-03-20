// Express router for order endpoints — all routes require authentication.
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  createOrderHandler,
  listOrders,
  getOrder,
} from "../controllers/orders.controller";
import { generateInvoicePdf } from "../services/invoice.service";
import { validateDiscountCode } from "../services/discount.service";
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";

const router = Router();

router.post("/orders", requireAuth, createOrderHandler);
router.get("/orders", requireAuth, listOrders);
router.get("/orders/:id", requireAuth, getOrder);

// POST /orders/validate-discount — validate a discount code and return the saving
router.post("/orders/validate-discount", requireAuth, async (req, res, next) => {
  try {
    const { code } = req.body as { code?: string };
    if (!code || typeof code !== "string") {
      throw new AppError("code is required", 400);
    }
    // lineTotalCents is not known here — use 0 to get a preview for FLAT codes;
    // for PERCENTAGE codes the client must pass the line total.
    const lineTotalCents =
      typeof (req.body as { lineTotalCents?: unknown }).lineTotalCents === "number"
        ? (req.body as { lineTotalCents: number }).lineTotalCents
        : 0;
    const result = await validateDiscountCode(code, lineTotalCents);
    res.json({
      data: {
        discountEuroCents: result.discountEuroCents,
        type: result.type,
        description: result.description,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/orders/:id/invoice", requireAuth, async (req, res, next) => {
  try {
    const orderId = String(req.params["id"]);
    // Verify the order belongs to the authenticated customer
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { customerId: true },
    });
    if (!order || order.customerId !== req.customerId) {
      throw new AppError("Order not found", 404);
    }
    const { pdfBuffer, invoiceNumber } = await generateInvoicePdf(orderId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${invoiceNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

export default router;
