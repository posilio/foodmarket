// Background job: daily low-stock email digest at 08:00 Amsterdam time.
// Queries all active variants below the threshold, fetches all admin customers,
// and sends one digest email per admin.
import cron from "node-cron";
import prisma from "../lib/prisma";
import logger from "../lib/logger";
import { sendLowStockAlert } from "../lib/email";
import { LOW_STOCK_THRESHOLD } from "../config/env";

export async function runLowStockAlert(): Promise<void> {
  try {
    const lowVariants = await prisma.productVariant.findMany({
      where: {
        stockQuantity: { lte: LOW_STOCK_THRESHOLD },
        isActive: true,
        product: { isActive: true },
      },
      include: { product: { select: { name: true } } },
      orderBy: { stockQuantity: "asc" },
    });

    logger.info(
      { count: lowVariants.length, threshold: LOW_STOCK_THRESHOLD },
      "Low stock check"
    );

    if (lowVariants.length === 0) return;

    const variants = lowVariants.map((v) => ({
      name: v.product.name,
      label: v.label,
      sku: v.sku,
      stockQty: v.stockQuantity,
    }));

    const admins = await prisma.customer.findMany({
      where: { isAdmin: true, isActive: true },
      select: { email: true },
    });

    if (admins.length === 0) {
      logger.warn("Low stock alert: no admin customers found, skipping email");
      return;
    }

    for (const admin of admins) {
      await sendLowStockAlert(variants, admin.email);
    }

    logger.info(
      { variantCount: lowVariants.length, adminCount: admins.length },
      "Low stock alert dispatched"
    );
  } catch (err) {
    logger.error({ err }, "Low stock alert job failed");
  }
}

export function startLowStockAlertJob(): void {
  cron.schedule(
    "0 8 * * *",
    () => {
      void runLowStockAlert();
    },
    { timezone: "Europe/Amsterdam" }
  );
  logger.info("Low stock alert job scheduled (daily at 08:00 Amsterdam)");
}
