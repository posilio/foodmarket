// Express router for order endpoints — all routes require authentication.
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  createOrderHandler,
  listOrders,
  getOrder,
} from "../controllers/orders.controller";
import { generateInvoicePdf } from "../services/invoice.service";
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";

const router = Router();

router.post("/orders", requireAuth, createOrderHandler);
router.get("/orders", requireAuth, listOrders);
router.get("/orders/:id", requireAuth, getOrder);

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
