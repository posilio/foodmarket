// Cleanup job — cancels PENDING orders abandoned before payment.
// Stock is only decremented at payment time (webhook), so no stock restoration is needed here.
import { OrderStatus } from "@prisma/client";
import prisma from "./prisma";
import logger from "./logger";

export async function releaseAbandonedOrders(): Promise<void> {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

  const abandoned = await prisma.order.findMany({
    where: {
      status: OrderStatus.PENDING,
      createdAt: { lt: cutoff },
    },
    select: { id: true },
  });

  if (!abandoned.length) return;

  let released = 0;
  for (const { id: orderId } of abandoned) {
    try {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.CANCELLED },
        }),
        prisma.orderEvent.create({
          data: {
            orderId,
            eventType: "ORDER_CANCELLED",
            fromStatus: OrderStatus.PENDING,
            toStatus: OrderStatus.CANCELLED,
            note: "Cancelled by cleanup job (abandoned checkout)",
          },
        }),
      ]);
      released++;
    } catch (err) {
      logger.error({ err, orderId }, "Cleanup: failed to cancel abandoned order");
    }
  }

  logger.info(
    { released, total: abandoned.length },
    "Cleanup: abandoned orders processed"
  );
}
