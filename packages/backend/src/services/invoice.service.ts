// Invoice generation service — produces PDF invoices for paid orders.
// FOOD-032: Dutch law requires a proper invoice for every B2C sale.
import PDFDocument from 'pdfkit';
import prisma from '../lib/prisma';
import { AppError } from '../lib/errors';

// PLACEHOLDER — replace with real values after KVK registration
const COMPANY_KVK = 'PLACEHOLDER_KVK';
const COMPANY_BTW = 'PLACEHOLDER_BTW';
const COMPANY_NAME = 'FoodMarket';
const COMPANY_ADDRESS = 'Placeholder Street 1, 0000 AA, Netherlands';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvoiceOrder {
  id: string;
  totalEuroCents: number;
  shippingCents: number;
  createdAt: Date;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  shippingAddress: {
    street: string;
    houseNumber: string;
    houseNumberAddition: string | null;
    postalCode: string;
    city: string;
    country: string;
  };
  lines: Array<{
    quantity: number;
    unitPriceEuroCents: number;
    variant: {
      label: string;
      product: { name: string };
    };
  }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatEuro(cents: number): string {
  return `\u20AC${(cents / 100).toFixed(2).replace('.', ',')}`;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '\u2026' : str;
}

// ─── Invoice number ───────────────────────────────────────────────────────────

function formatInvoiceNumber(year: number, sequence: number): string {
  return `FM-${year}-${String(sequence).padStart(4, '0')}`;
}

export async function getOrCreateInvoiceNumber(orderId: string): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.invoiceNumber.findUnique({ where: { orderId } });
    if (existing) return formatInvoiceNumber(existing.year, existing.sequence);

    const year = new Date().getFullYear();
    const maxRow = await tx.invoiceNumber.findFirst({
      where: { year },
      orderBy: { sequence: 'desc' },
    });
    const sequence = (maxRow?.sequence ?? 0) + 1;
    await tx.invoiceNumber.create({ data: { year, sequence, orderId } });
    return formatInvoiceNumber(year, sequence);
  });
}

// ─── PDF layout ───────────────────────────────────────────────────────────────

// A4: 595 x 842 pt. Margin 50. Content: x 50–545, width 495.
const L = 50;       // left edge
const R_EDGE = 545; // right edge
const CONTENT_W = R_EDGE - L; // 495

// Line-items table column x positions
const COL_PRODUCT    = L;        // width ~150
const COL_VARIANT    = 205;      // width ~100
const COL_QTY        = 310;      // width 45,  right-aligned
const COL_UNIT_PRICE = 360;      // width 85,  right-aligned
const COL_TOTAL      = 450;      // width 95,  right-aligned

async function buildPdf(order: InvoiceOrder, invoiceNumber: string): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: L, autoFirstPage: true });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const pdfDone = new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  const invoiceDate = order.createdAt.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // ── Header: company (left) ─────────────────────────────────────────────────
  let y = 50;
  doc.fontSize(18).font('Helvetica-Bold').text(COMPANY_NAME, L, y);
  y = doc.y + 4;
  doc.fontSize(9).font('Helvetica').text(COMPANY_ADDRESS, L, y);
  y = doc.y;
  doc.text(`KVK: ${COMPANY_KVK}`, L, y);
  y = doc.y;
  doc.text(`BTW: ${COMPANY_BTW}`, L, y);
  const leftColBottom = doc.y;

  // ── Header: invoice details (right, right-aligned) ─────────────────────────
  doc.fontSize(20).font('Helvetica-Bold').text('FACTUUR', L, 50, {
    width: CONTENT_W,
    align: 'right',
    lineBreak: false,
  });
  doc.fontSize(10).font('Helvetica').text(invoiceNumber, L, 76, {
    width: CONTENT_W,
    align: 'right',
    lineBreak: false,
  });
  doc.text(`Datum: ${invoiceDate}`, L, 90, {
    width: CONTENT_W,
    align: 'right',
    lineBreak: false,
  });

  // ── Separator below header ─────────────────────────────────────────────────
  y = Math.max(leftColBottom, 105) + 12;
  doc.strokeColor('#cccccc').moveTo(L, y).lineTo(R_EDGE, y).stroke();

  // ── Billing / delivery address ─────────────────────────────────────────────
  y += 14;
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#888888').text('FACTUURADRES', L, y);
  y = doc.y + 4;
  const { customer, shippingAddress: addr } = order;
  const streetLine = addr.houseNumberAddition
    ? `${addr.street} ${addr.houseNumber} ${addr.houseNumberAddition}`
    : `${addr.street} ${addr.houseNumber}`;
  doc.fontSize(9).font('Helvetica').fillColor('#111111');
  doc.text(`${customer.firstName} ${customer.lastName}`, L, y);
  y = doc.y;
  doc.text(streetLine, L, y);
  y = doc.y;
  doc.text(`${addr.postalCode}  ${addr.city}`, L, y);
  y = doc.y;
  doc.text(addr.country === 'NL' ? 'Nederland' : addr.country, L, y);

  // ── Separator below address ────────────────────────────────────────────────
  y = doc.y + 14;
  doc.strokeColor('#cccccc').moveTo(L, y).lineTo(R_EDGE, y).stroke();

  // ── Line items table header ────────────────────────────────────────────────
  y += 10;
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#555555');
  doc.text('PRODUCT', COL_PRODUCT, y, { width: COL_VARIANT - COL_PRODUCT - 5, lineBreak: false });
  doc.text('VARIANT', COL_VARIANT, y, { width: COL_QTY - COL_VARIANT - 5, lineBreak: false });
  doc.text('AANTAL', COL_QTY, y, { width: 45, align: 'right', lineBreak: false });
  doc.text('PRIJS/STUK', COL_UNIT_PRICE, y, { width: 85, align: 'right', lineBreak: false });
  doc.text('TOTAAL', COL_TOTAL, y, { width: R_EDGE - COL_TOTAL, align: 'right', lineBreak: false });

  y += 14;
  doc.strokeColor('#aaaaaa').moveTo(L, y).lineTo(R_EDGE, y).stroke();

  // ── Line items rows ────────────────────────────────────────────────────────
  doc.fontSize(9).font('Helvetica').fillColor('#111111');
  for (const line of order.lines) {
    y += 8;
    const lineTotal = line.quantity * line.unitPriceEuroCents;
    const name = truncate(line.variant.product.name, 28);
    const variant = truncate(line.variant.label, 18);
    doc.text(name, COL_PRODUCT, y, { width: COL_VARIANT - COL_PRODUCT - 5, lineBreak: false });
    doc.text(variant, COL_VARIANT, y, { width: COL_QTY - COL_VARIANT - 5, lineBreak: false });
    doc.text(String(line.quantity), COL_QTY, y, { width: 45, align: 'right', lineBreak: false });
    doc.text(formatEuro(line.unitPriceEuroCents), COL_UNIT_PRICE, y, { width: 85, align: 'right', lineBreak: false });
    doc.text(formatEuro(lineTotal), COL_TOTAL, y, { width: R_EDGE - COL_TOTAL, align: 'right', lineBreak: false });
    y += 14;
  }

  // ── Shipping row ───────────────────────────────────────────────────────────
  doc.strokeColor('#cccccc').moveTo(L, y).lineTo(R_EDGE, y).stroke();
  y += 8;
  doc.fontSize(9).font('Helvetica').fillColor('#555555');
  doc.text('Verzendkosten', COL_PRODUCT, y, { lineBreak: false });
  doc.text(formatEuro(order.shippingCents), COL_TOTAL, y, { width: R_EDGE - COL_TOTAL, align: 'right', lineBreak: false });
  y += 14;

  // ── Total row ──────────────────────────────────────────────────────────────
  doc.strokeColor('#aaaaaa').moveTo(L, y).lineTo(R_EDGE, y).stroke();
  y += 8;
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111');
  doc.text('Totaal', COL_PRODUCT, y, { lineBreak: false });
  doc.text(formatEuro(order.totalEuroCents), COL_TOTAL, y, { width: R_EDGE - COL_TOTAL, align: 'right', lineBreak: false });

  // ── Footer ─────────────────────────────────────────────────────────────────
  y += 30;
  doc.strokeColor('#cccccc').moveTo(L, y).lineTo(R_EDGE, y).stroke();
  y += 10;
  doc.fontSize(8).font('Helvetica').fillColor('#888888')
    .text('Prijzen zijn inclusief BTW', L, y);

  doc.end();
  return pdfDone;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateInvoicePdf(
  orderId: string
): Promise<{ pdfBuffer: Buffer; invoiceNumber: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      shippingAddress: true,
      lines: {
        include: {
          variant: { include: { product: true } },
        },
      },
    },
  });

  if (!order) throw new AppError('Order not found', 404);
  if (!order.customer) throw new AppError('Order has no customer', 500);
  if (!order.shippingAddress) throw new AppError('Order has no shipping address', 500);

  const invoiceNumber = await getOrCreateInvoiceNumber(orderId);
  const pdfBuffer = await buildPdf(order as InvoiceOrder, invoiceNumber);

  return { pdfBuffer, invoiceNumber };
}
