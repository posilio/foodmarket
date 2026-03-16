// Express router for admin-only endpoints.
// Every route here is protected by requireAdmin (JWT + isAdmin flag check).
import { Router } from "express";
import { OrderStatus } from "@prisma/client";
import { requireAdmin } from "../middleware/admin.middleware";
import {
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  addVariant,
  updateVariant,
  updateVariantStock,
  getLowStockVariants,
} from "../services/admin.service";
import {
  getAllCustomers,
  getCustomerByIdAdmin,
} from "../services/customers.service";
import { getAllCategories } from "../services/products.service";
import { AppError } from "../lib/errors";

const router = Router();

// All admin routes require the admin flag.
// Scoped to /admin/* so this middleware doesn't intercept unrelated routes
// (e.g. /payments/webhook) that share the same /api/v1 mount point.
router.use("/admin", requireAdmin);

// ─── Orders ───────────────────────────────────────────────────────────────────

router.get("/admin/orders", async (req, res, next) => {
  try {
    const status = req.query["status"] as string | undefined;
    const limit = req.query["limit"] ? Number(req.query["limit"]) : undefined;
    const cursor = req.query["cursor"] as string | undefined;
    const result = await getAllOrders(status, { limit, cursor });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/admin/orders/:id", async (req, res, next) => {
  try {
    const order = await getOrderByIdAdmin(String(req.params["id"]));
    res.json({ data: order });
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/orders/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body as { status?: string };

    if (!status || !(status in OrderStatus)) {
      throw new AppError(
        `status must be one of: ${Object.keys(OrderStatus).join(", ")}`,
        400
      );
    }

    const order = await updateOrderStatus(
      String(req.params["id"]),
      status as OrderStatus
    );
    res.json({ data: order });
  } catch (err) {
    next(err);
  }
});

// ─── Products ─────────────────────────────────────────────────────────────────

// IMPORTANT: /admin/products/low-stock must be registered BEFORE /admin/products/:id
// to prevent Express from matching "low-stock" as the :id param.
router.get("/admin/products/low-stock", async (req, res, next) => {
  try {
    const threshold = req.query["threshold"] ? Number(req.query["threshold"]) : 5;
    const variants = await getLowStockVariants(threshold);
    res.json({ data: variants, count: variants.length });
  } catch (err) {
    next(err);
  }
});

router.get("/admin/products", async (req, res, next) => {
  try {
    const limit = req.query["limit"] ? Number(req.query["limit"]) : undefined;
    const cursor = req.query["cursor"] as string | undefined;
    const result = await getAllProductsAdmin({ limit, cursor });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/admin/products", async (req, res, next) => {
  try {
    const { name, categoryId, countryOfOrigin, description, imageUrl, variants } =
      req.body as {
        name?: string;
        categoryId?: string;
        countryOfOrigin?: string;
        description?: string;
        imageUrl?: string;
        variants?: unknown[];
      };

    if (!name || !categoryId || !countryOfOrigin) {
      throw new AppError("name, categoryId, and countryOfOrigin are required", 400);
    }
    if (!Array.isArray(variants) || variants.length === 0) {
      throw new AppError("At least one variant is required", 400);
    }

    const product = await createProduct({
      name,
      categoryId,
      countryOfOrigin,
      description,
      imageUrl,
      variants: variants as Parameters<typeof createProduct>[0]["variants"],
    });
    res.status(201).json({ data: product });
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/products/:id", async (req, res, next) => {
  try {
    const { name, description, imageUrl, countryOfOrigin, categoryId, isActive } =
      req.body as {
        name?: string;
        description?: string;
        imageUrl?: string;
        countryOfOrigin?: string;
        categoryId?: string;
        isActive?: boolean;
      };

    const product = await updateProduct(String(req.params["id"]), {
      name,
      description,
      imageUrl,
      countryOfOrigin,
      categoryId,
      isActive,
    });
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/products/:id/stock", async (req, res, next) => {
  try {
    const { variantId, stockQuantity } = req.body as {
      variantId?: string;
      stockQuantity?: number;
    };

    if (!variantId || stockQuantity === undefined) {
      throw new AppError("variantId and stockQuantity are required", 400);
    }
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      throw new AppError("stockQuantity must be a non-negative integer", 400);
    }

    const variant = await updateVariantStock(
      String(req.params["id"]),
      variantId,
      stockQuantity
    );
    res.json({ data: variant });
  } catch (err) {
    next(err);
  }
});

router.post("/admin/products/:id/variants", async (req, res, next) => {
  try {
    const { sku, label, priceEuroCents, stockQuantity, weightGrams } =
      req.body as {
        sku?: string;
        label?: string;
        priceEuroCents?: number;
        stockQuantity?: number;
        weightGrams?: number;
      };

    if (!sku || !label || priceEuroCents === undefined) {
      throw new AppError("sku, label, and priceEuroCents are required", 400);
    }
    if (!Number.isInteger(priceEuroCents) || priceEuroCents < 0) {
      throw new AppError("priceEuroCents must be a non-negative integer", 400);
    }

    const variant = await addVariant(String(req.params["id"]), {
      sku,
      label,
      priceEuroCents,
      stockQuantity,
      weightGrams,
    });
    res.status(201).json({ data: variant });
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/products/:id/variants/:variantId", async (req, res, next) => {
  try {
    const { label, priceEuroCents, isActive, ean } = req.body as {
      label?: string;
      priceEuroCents?: number;
      isActive?: boolean;
      ean?: string | null;
    };

    const variant = await updateVariant(
      String(req.params["id"]),
      String(req.params["variantId"]),
      { label, priceEuroCents, isActive, ean }
    );
    res.json({ data: variant });
  } catch (err) {
    next(err);
  }
});

// ─── Categories ───────────────────────────────────────────────────────────────

router.get("/admin/categories", async (_req, res, next) => {
  try {
    const categories = await getAllCategories();
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
});

// ─── Customers ────────────────────────────────────────────────────────────────

router.get("/admin/customers", async (req, res, next) => {
  try {
    const limit = req.query["limit"] ? Number(req.query["limit"]) : undefined;
    const cursor = req.query["cursor"] as string | undefined;
    const result = await getAllCustomers({ limit, cursor });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/admin/customers/:id", async (req, res, next) => {
  try {
    const customer = await getCustomerByIdAdmin(String(req.params["id"]));
    res.json({ data: customer });
  } catch (err) {
    next(err);
  }
});

export default router;
