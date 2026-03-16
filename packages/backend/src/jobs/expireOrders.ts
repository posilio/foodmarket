// Background job that cancels abandoned PENDING orders and restores reserved stock.
// Runs every 5 minutes via setInterval, started from index.ts.
import { OrderStatus } from "@prisma/client";
import prisma from "../lib/prisma";
import logger from "../lib/logger";

async function expireAbandonedOrders(): Promise<void> {
  const now = new Date();

  const expiredOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.PENDING,
      stockReservedUntil: { lt: now },
    },
    include: { lines: true },
  });

  if (expiredOrders.length === 0) return;

  logger.info({ count: expiredOrders.length }, "Expiring abandoned orders");

  for (const order of expiredOrders) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELLED },
        });

        for (const line of order.lines) {
          await tx.productVariant.update({
            where: { id: line.variantId },
            data: { stockQuantity: { increment: line.quantity } },
          });
        }

        await tx.orderEvent.create({
          data: {
            orderId: order.id,
            eventType: "ORDER_EXPIRED",
            fromStatus: OrderStatus.PENDING,
            toStatus: OrderStatus.CANCELLED,
            note: "Expired: payment not completed",
          },
        });
      });

      logger.info({ orderId: order.id }, "Order expired and stock restored");
    } catch (err) {
      logger.error({ err, orderId: order.id }, "Failed to expire order");
    }
  }
}

export function startExpireOrdersJob(): void {
  setInterval(() => {
    void expireAbandonedOrders();
  }, 5 * 60 * 1000);
  logger.info("Expire orders job scheduled (every 5 minutes)");
}
