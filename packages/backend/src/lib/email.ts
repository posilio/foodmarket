// Email service — sends transactional emails via Resend.
// All send functions degrade gracefully: if the API key is missing or the
// Resend call fails the error is logged but never re-thrown.
import { Resend } from "resend";
import { RESEND_API_KEY, RESEND_FROM, FRONTEND_URL } from "../config/env";
import logger from "./logger";

// "dummy" prevents the SDK from throwing on construction when key is absent
const resend = new Resend(RESEND_API_KEY || "dummy");

function canSendEmail(): boolean {
  return RESEND_API_KEY.length > 0;
}

// ─── Price formatting ─────────────────────────────────────────────────────────

function formatPrice(euroCents: number): string {
  return `€${(euroCents / 100).toFixed(2).replace(".", ",")}`;
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────

function lineItemsTable(
  lines: Array<{
    quantity: number;
    unitPriceEuroCents: number;
    variant: { label: string; product: { name: string } };
  }>
): string {
  const rows = lines
    .map(
      (l) => `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #eee">${l.variant.product.name}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee">${l.variant.label}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${l.quantity}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">${formatPrice(l.unitPriceEuroCents)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">${formatPrice(l.unitPriceEuroCents * l.quantity)}</td>
      </tr>`
    )
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
      <thead>
        <tr style="background:#f9fafb">
          <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb">Product</th>
          <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb">Size</th>
          <th style="padding:8px 12px;text-align:center;border-bottom:2px solid #e5e7eb">Qty</th>
          <th style="padding:8px 12px;text-align:right;border-bottom:2px solid #e5e7eb">Unit price</th>
          <th style="padding:8px 12px;text-align:right;border-bottom:2px solid #e5e7eb">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function emailWrapper(body: string): string {
  return `
    <!DOCTYPE html>
    <html lang="nl">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="font-family:sans-serif;color:#111;max-width:600px;margin:0 auto;padding:24px">
      <p style="font-size:20px;font-weight:bold;color:#16a34a;margin-bottom:24px">🛒 FoodWebshop</p>
      ${body}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
      <p style="font-size:12px;color:#9ca3af">FoodWebshop — Netherlands<br>You received this email because you placed an order with us.</p>
    </body>
    </html>`;
}

// ─── Order type shared by both send functions ─────────────────────────────────

interface EmailOrder {
  id: string;
  totalEuroCents: number;
  lines: Array<{
    quantity: number;
    unitPriceEuroCents: number;
    variant: { label: string; product: { name: string } };
  }>;
}

// ─── Public send functions ────────────────────────────────────────────────────

export async function sendOrderConfirmation(
  order: EmailOrder,
  customerEmail: string
): Promise<void> {
  if (!canSendEmail()) {
    logger.warn("Email skipped: RESEND_API_KEY not set");
    return;
  }

  const shortId = order.id.slice(0, 8);
  const html = emailWrapper(`
    <h1 style="font-size:22px;margin-bottom:8px">Thank you for your order!</h1>
    <p style="color:#6b7280;margin-bottom:24px">Order reference: <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px">${shortId}</code></p>

    ${lineItemsTable(order.lines)}

    <p style="font-size:16px;font-weight:bold;text-align:right;margin-top:8px">
      Grand total: ${formatPrice(order.totalEuroCents)}
    </p>

    <p style="margin-top:24px;color:#374151">We will notify you when your order ships.</p>
    <p style="color:#374151">FoodWebshop Team</p>
  `);

  try {
    const result = await resend.emails.send({
      from: RESEND_FROM,
      to: customerEmail,
      subject: `Order confirmed — FoodWebshop #${shortId}`,
      html,
    });
    logger.info({ emailId: result.data?.id }, "Order confirmation email sent");
  } catch (err) {
    logger.error({ err }, "Failed to send order confirmation email");
  }
}

export async function sendLowStockAlert(
  variants: Array<{ name: string; label: string; sku: string; stockQty: number }>,
  to: string
): Promise<void> {
  if (!canSendEmail()) {
    logger.warn("Low stock alert skipped: RESEND_API_KEY not set");
    return;
  }

  const rows = variants
    .map(
      (v) => `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #eee">${v.name}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee">${v.label}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;font-family:monospace">${v.sku}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center;color:${v.stockQty === 0 ? "#dc2626" : "#d97706"};font-weight:bold">${v.stockQty}</td>
      </tr>`
    )
    .join("");

  const table = `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
      <thead>
        <tr style="background:#f9fafb">
          <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb">Product</th>
          <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb">Variant</th>
          <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb">SKU</th>
          <th style="padding:8px 12px;text-align:center;border-bottom:2px solid #e5e7eb">Stock</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  const html = emailWrapper(`
    <h1 style="font-size:22px;margin-bottom:8px">Low stock alert ⚠️</h1>
    <p style="color:#374151;margin-bottom:24px">
      The following ${variants.length} variant${variants.length === 1 ? "" : "s"}
      are at or below the low-stock threshold and may need restocking.
    </p>
    ${table}
    <p style="margin-top:24px;color:#6b7280;font-size:13px">
      Review stock levels in the admin panel and reorder as needed.
    </p>
  `);

  try {
    const result = await resend.emails.send({
      from: RESEND_FROM,
      to,
      subject: `FoodMarket — Low stock alert (${variants.length} variant${variants.length === 1 ? "" : "s"})`,
      html,
    });
    logger.info({ emailId: result.data?.id }, "Low stock alert email sent");
  } catch (err) {
    logger.error({ err }, "Failed to send low stock alert email");
  }
}

export async function sendPasswordResetEmail(
  customerEmail: string,
  rawToken: string
): Promise<void> {
  if (!canSendEmail()) {
    logger.warn("Email skipped: RESEND_API_KEY not set");
    return;
  }

  const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;

  const html = emailWrapper(`
    <h1 style="font-size:22px;margin-bottom:8px">Reset your password</h1>
    <p style="color:#374151;margin-bottom:24px">
      We received a request to reset the password for your FoodMarket account.
      Click the button below to choose a new password. This link expires in 15 minutes.
    </p>
    <a href="${resetUrl}"
       style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;font-size:15px">
      Reset password
    </a>
    <p style="margin-top:24px;color:#6b7280;font-size:13px">
      If you did not request a password reset, you can safely ignore this email.
      Your password will not change.
    </p>
    <p style="margin-top:8px;color:#9ca3af;font-size:12px;word-break:break-all">
      Or copy this link: ${resetUrl}
    </p>
  `);

  try {
    const result = await resend.emails.send({
      from: RESEND_FROM,
      to: customerEmail,
      subject: "Reset your FoodMarket password",
      html,
    });
    logger.info({ emailId: result.data?.id }, "Password reset email sent");
  } catch (err) {
    logger.error({ err }, "Failed to send password reset email");
  }
}

export async function sendShippingNotification(
  order: EmailOrder,
  customerEmail: string
): Promise<void> {
  if (!canSendEmail()) {
    logger.warn("Email skipped: RESEND_API_KEY not set");
    return;
  }

  const shortId = order.id.slice(0, 8);
  const html = emailWrapper(`
    <h1 style="font-size:22px;margin-bottom:8px">Your order has shipped! 🚚</h1>
    <p style="color:#6b7280;margin-bottom:24px">Order reference: <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px">${shortId}</code></p>

    <p style="color:#374151">Great news — your order is on its way!</p>

    ${lineItemsTable(order.lines)}

    <p style="font-size:16px;font-weight:bold;text-align:right;margin-top:8px">
      Grand total: ${formatPrice(order.totalEuroCents)}
    </p>

    <p style="margin-top:24px;color:#374151">You will receive your order within 1–3 business days.</p>
    <p style="color:#374151">FoodWebshop Team</p>
  `);

  try {
    const result = await resend.emails.send({
      from: RESEND_FROM,
      to: customerEmail,
      subject: `Your order has shipped — FoodWebshop #${shortId}`,
      html,
    });
    logger.info({ emailId: result.data?.id }, "Shipping notification email sent");
  } catch (err) {
    logger.error({ err }, "Failed to send shipping notification email");
  }
}
