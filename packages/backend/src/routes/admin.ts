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
  updateVariantStock,
} from "../services/admin.service";
import {
  getAllCustomers,
  getCustomerByIdAdmin,
} from "../services/customers.service";
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
    const orders = await getAllOrders(status);
    res.json({ data: orders });
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

router.get("/admin/products", async (_req, res, next) => {
  try {
    const products = await getAllProductsAdmin();
    res.json({ data: products });
  } catch (err) {
    next(err);
  }
});

router.post("/admin/products", async (req, res, next) => {
  try {
    const { name, categoryId, countryOfOrigin, description, variants } =
      req.body as {
        name?: string;
        categoryId?: string;
        countryOfOrigin?: string;
        description?: string;
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
      variants: variants as Parameters<typeof createProduct>[0]["variants"],
    });
    res.status(201).json({ data: product });
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

// ─── Customers ────────────────────────────────────────────────────────────────

router.get("/admin/customers", async (_req, res, next) => {
  try {
    const customers = await getAllCustomers();
    res.json({ data: customers });
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
