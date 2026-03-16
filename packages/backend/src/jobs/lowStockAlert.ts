// Background job that sends a daily low-stock email alert to the admin at 8am Amsterdam time.
// Runs every 24 hours via setInterval; skips silently if it's not 8am or nothing is low.
import prisma from "../lib/prisma";
import logger from "../lib/logger";
import { sendLowStockAlert } from "../lib/email";
import { LOW_STOCK_THRESHOLD } from "../config/env";

const AMSTERDAM_TZ = "Europe/Amsterdam";

function currentHourInAmsterdam(): number {
  return parseInt(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: AMSTERDAM_TZ,
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
    10
  );
}

async function runLowStockAlert(): Promise<void> {
  if (currentHourInAmsterdam() !== 8) return;

  const lowVariants = await prisma.productVariant.findMany({
    where: {
      stockQuantity: { lte: LOW_STOCK_THRESHOLD },
      isActive: true,
      product: { isActive: true },
    },
    include: { product: { select: { name: true } } },
    orderBy: { stockQuantity: "asc" },
  });

  logger.info({ count: lowVariants.length, threshold: LOW_STOCK_THRESHOLD }, "Low stock check");

  if (lowVariants.length === 0) return;

  await sendLowStockAlert(
    lowVariants.map((v) => ({
      name: v.product.name,
      label: v.label,
      sku: v.sku,
      stockQty: v.stockQuantity,
    }))
  );

  logger.info({ count: lowVariants.length }, "Low stock alert email dispatched");
}

export function startLowStockAlertJob(): void {
  void runLowStockAlert();
  setInterval(() => {
    void runLowStockAlert();
  }, 24 * 60 * 60 * 1000);
  logger.info("Low stock alert job scheduled (every 24 hours, sends at 8am Amsterdam)");
}
