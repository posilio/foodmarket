// Admin stock import routes — PDF parsing via Anthropic, preview, and confirm.
// All routes require admin authentication.
import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";
import { AppError } from "../lib/errors";
import logger from "../lib/logger";
import prisma from "../lib/prisma";
import { ANTHROPIC_API_KEY } from "../config/env";

const router = Router();

// ── PDF upload middleware (memory storage, PDF only, 20 MB) ───────────────────

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new AppError("Only PDF files are allowed", 415));
    }
  },
}).single("image");

// ── Shared type ───────────────────────────────────────────────────────────────

interface ImportLine {
  ean: string;
  description: string;
  quantity: number;
  unitPriceEuroCents: number;
}

// ── POST /admin/import/parse-pdf ──────────────────────────────────────────────

// Rate limiter for parse-pdf only — each call hits the Anthropic API.
// 100 requests/hour per IP prevents runaway loops, frontend bugs, or compromised
// admin accounts from generating unexpected Anthropic API costs.
const parsePdfRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

router.post(
  "/admin/import/parse-pdf",
  requireAuth,
  requireAdmin,
  parsePdfRateLimit,
  pdfUpload,
  async (req, res, next) => {
    try {
      if (!req.file) throw new AppError("No PDF file provided", 400);

      if (!ANTHROPIC_API_KEY) {
        throw new AppError(
          "PDF parsing failed: ANTHROPIC_API_KEY is not configured on the server",
          502
        );
      }

      const base64Data = req.file.buffer.toString("base64");

      const prompt =
        'Extract all product line items from this supplier invoice. Return ONLY a JSON array, no markdown, no backticks, no explanation. Each element must have exactly:\n{ "ean": "string (barcode digits only, empty string if not found)", "description": "string (product name as on invoice)", "quantity": number (total units - multiply colli × aantal if needed), "unitPriceEuroCents": number (unit price in euro cents as integer, e.g. 5.45 → 545) }\nOnly include product lines. Skip totals, shipping, VAT rows, pallets, and packaging bags.';

      let anthropicRes: Response;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);
      try {
        anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "document",
                    source: {
                      type: "base64",
                      media_type: "application/pdf",
                      data: base64Data,
                    },
                  },
                  { type: "text", text: prompt },
                ],
              },
            ],
          }),
          signal: controller.signal,
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          throw new AppError("PDF parsing timed out after 30 seconds", 504);
        }
        throw new AppError(
          `PDF parsing failed: ${err instanceof Error ? err.message : String(err)}`,
          502
        );
      } finally {
        clearTimeout(timeout);
      }

      if (!anthropicRes.ok) {
        const errBody = (await anthropicRes.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new AppError(
          `PDF parsing failed: ${errBody.error?.message ?? anthropicRes.statusText}`,
          502
        );
      }

      const body = (await anthropicRes.json()) as {
        content: Array<{ type: string; text?: string }>;
      };

      const text =
        body.content.find((b) => b.type === "text")?.text?.trim() ?? "";

      let lines: ImportLine[];
      try {
        const parsed: unknown = JSON.parse(text);
        if (!Array.isArray(parsed))
          throw new Error("Response is not a JSON array");
        lines = parsed as ImportLine[];
      } catch {
        throw new AppError(
          "PDF parsing failed: model returned invalid JSON",
          502
        );
      }

      res.json({ data: { lines } });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /admin/import/preview ────────────────────────────────────────────────

router.post(
  "/admin/import/preview",
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { lines } = req.body as { lines?: ImportLine[] };
      if (!Array.isArray(lines))
        throw new AppError("lines must be an array", 400);

      const matched: Array<{
        ean: string;
        description: string;
        productName: string;
        variantLabel: string;
        variantId: string;
        currentStock: number;
        incomingQuantity: number;
        newStock: number;
        unitPriceEuroCents: number;
      }> = [];

      const unmatched: ImportLine[] = [];

      for (const line of lines) {
        if (!line.ean) {
          unmatched.push(line);
          continue;
        }

        const variant = await prisma.productVariant.findUnique({
          where: { ean: line.ean },
          include: { product: { select: { name: true } } },
        });

        if (!variant) {
          unmatched.push(line);
          continue;
        }

        matched.push({
          ean: line.ean,
          description: line.description,
          productName: variant.product.name,
          variantLabel: variant.label,
          variantId: variant.id,
          currentStock: variant.stockQuantity,
          incomingQuantity: line.quantity,
          newStock: variant.stockQuantity + line.quantity,
          unitPriceEuroCents: line.unitPriceEuroCents,
        });
      }

      res.json({ data: { matched, unmatched } });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /admin/import/confirm ────────────────────────────────────────────────

router.post(
  "/admin/import/confirm",
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { lines } = req.body as {
        lines?: Array<{ variantId: string; quantity: number }>;
      };
      if (!Array.isArray(lines) || lines.length === 0)
        throw new AppError("lines must be a non-empty array", 400);

      const updated = await prisma.$transaction(async (tx) => {
        let count = 0;
        for (const line of lines) {
          const variant = await tx.productVariant.update({
            where: { id: line.variantId },
            data: { stockQuantity: { increment: line.quantity } },
          });
          logger.info(
            {
              variantId: line.variantId,
              addedQty: line.quantity,
              newStock: variant.stockQuantity,
            },
            "Stock import: variant updated"
          );
          count++;
        }
        return count;
      });

      res.json({ data: { updated } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
