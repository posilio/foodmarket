// Business logic for Mollie payment integration.
// createPayment — creates a Mollie payment and persists a Payment record.
// handleWebhook — idempotently processes status updates pushed by Mollie.
// getPaymentStatus — returns the current Payment record for an order.
import { createMollieClient, PaymentStatus as MolliePaymentStatus } from "@mollie/api-client";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";
import { MOLLIE_API_KEY, MOLLIE_REDIRECT_BASE } from "../config/env";
import { sendOrderConfirmation } from "../lib/email";
import logger from "../lib/logger";

// "test_dummy" prevents the SDK from throwing on construction when key is absent
const mollie = createMollieClient({ apiKey: MOLLIE_API_KEY || "test_dummy" });

const WEBHOOK_BASE = process.env.WEBHOOK_BASE_URL ?? "http://localhost:4000";

// ─── Create payment ───────────────────────────────────────────────────────────

export async function createPayment(
  orderId: string,
  customerId: string
): Promise<{ checkoutUrl: string }> {
  if (!MOLLIE_API_KEY) {
    throw new AppError("Payment provider not configured", 503);
  }

  // 1. Fetch and verify order ownership
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order || order.customerId !== customerId) {
    throw new AppError("Order not found", 404);
  }

  // 2. Order must be PENDING to be payable
  if (order.status !== OrderStatus.PENDING) {
    throw new AppError("Order is not in a payable state", 400);
  }

  // 3. Block if a non-failed payment already exists
  if (order.payment && order.payment.status !== PaymentStatus.FAILED) {
    throw new AppError("Payment already exists for this order", 400);
  }

  // 4. Create payment at Mollie
  const molliePayment = await mollie.payments.create({
    amount: {
      currency: "EUR",
      value: (order.totalEuroCents / 100).toFixed(2),
    },
    description: `FoodWebshop order #${orderId.slice(0, 8)}`,
    redirectUrl: `${MOLLIE_REDIRECT_BASE}/orders/${orderId}?payment=done`,
    webhookUrl: `${WEBHOOK_BASE}/api/v1/payments/webhook`,
    metadata: { orderId },
  });

  // 5. Persist Payment record (upsert handles the retry-after-failure case)
  await prisma.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      providerReference: molliePayment.id,
      status: PaymentStatus.PENDING,
      amountEuroCents: order.totalEuroCents,
    },
    update: {
      providerReference: molliePayment.id,
      status: PaymentStatus.PENDING,
    },
  });

  const checkoutUrl = molliePayment.getCheckoutUrl();
  if (!checkoutUrl) {
    throw new AppError("Mollie did not return a checkout URL", 500);
  }

  logger.info({ orderId, mollieId: molliePayment.id }, "Mollie payment created");
  return { checkoutUrl };
}

// ─── Handle webhook ───────────────────────────────────────────────────────────

export async function handleWebhook(molliePaymentId: string): Promise<void> {
  // 1. Fetch fresh payment status from Mollie
  const molliePayment = await mollie.payments.get(molliePaymentId);

  // 2. Read orderId from metadata we stored at creation
  const meta = molliePayment.metadata as Record<string, string> | null;
  const orderId = meta?.orderId;
  if (!orderId) {
    logger.warn({ molliePaymentId }, "Webhook: missing orderId in metadata");
    return;
  }

  // 3. Find our Payment record
  const payment = await prisma.payment.findFirst({
    where: { providerReference: molliePaymentId },
  });
  if (!payment) {
    logger.warn({ molliePaymentId, orderId }, "Webhook: payment record not found");
    return;
  }

  // 4. Map Mollie status → our PaymentStatus
  let newPaymentStatus: PaymentStatus;
  switch (molliePayment.status) {
    case MolliePaymentStatus.paid:
      newPaymentStatus = PaymentStatus.PAID;
      break;
    case MolliePaymentStatus.failed:
    case MolliePaymentStatus.canceled:
    case MolliePaymentStatus.expired:
      newPaymentStatus = PaymentStatus.FAILED;
      break;
    default:
      newPaymentStatus = PaymentStatus.PENDING;
  }

  // 5. Handle paid payment: decrement stock + update order + payment in one transaction
  if (molliePayment.status === MolliePaymentStatus.paid) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        lines: true,
        customer: { select: { email: true } },
      },
    });

    if (order && order.status === OrderStatus.PENDING) {
      await prisma.$transaction(async (tx) => {
        // Decrement stock for each line; throw if stock would go negative
        for (const line of order.lines) {
          const variant = await tx.productVariant.findUniqueOrThrow({
            where: { id: line.variantId },
            select: { stockQuantity: true },
          });
          if (variant.stockQuantity < line.quantity) {
            throw new AppError(
              `Insufficient stock for variant ${line.variantId}`,
              400
            );
          }
          await tx.productVariant.update({
            where: { id: line.variantId },
            data: { stockQuantity: { decrement: line.quantity } },
          });
        }

        // Mark order PAID
        await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.PAID },
        });

        // Mark payment PAID
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.PAID, paidAt: new Date() },
        });

        // Audit event
        await tx.orderEvent.create({
          data: {
            orderId,
            eventType: "PAYMENT_RECEIVED",
            fromStatus: order.status,
            toStatus: OrderStatus.PAID,
            note: `Payment confirmed via Mollie: ${molliePaymentId}`,
          },
        });
      });

      // Send confirmation email outside the transaction (failure doesn't roll back)
      if (order.customer) {
        const orderWithLines = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            lines: { include: { variant: { include: { product: true } } } },
          },
        });
        if (orderWithLines) {
          await sendOrderConfirmation(orderWithLines, order.customer.email);
        }
      }
    }
  } else {
    // Non-paid: just update the payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: newPaymentStatus },
    });
  }

  logger.info(
    { molliePaymentId, orderId, status: newPaymentStatus },
    "Webhook processed"
  );
}

// ─── Create refund ────────────────────────────────────────────────────────────

export async function createRefund(
  molliePaymentId: string,
  amountEuroCents: number
): Promise<void> {
  if (!MOLLIE_API_KEY) {
    throw new Error("Mollie API key not configured");
  }
  await mollie.paymentRefunds.create({
    paymentId: molliePaymentId,
    amount: {
      value: (amountEuroCents / 100).toFixed(2),
      currency: "EUR",
    },
  });
  logger.info({ molliePaymentId }, "Mollie refund created");
}

// ─── Get payment status ───────────────────────────────────────────────────────

export async function getPaymentStatus(orderId: string, customerId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order || order.customerId !== customerId) {
    throw new AppError("Order not found", 404);
  }
  return order.payment;
}
