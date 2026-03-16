// Request handlers for product and category routes.
// Validates input, calls the products service, and formats HTTP responses.
import { Request, Response, NextFunction } from "express";
import {
  getAllProducts,
  getProductBySlug,
  getAllCategories,
} from "../services/products.service";

export async function listProducts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categorySlug =
      typeof req.query.category === "string" ? req.query.category : undefined;
    const limit = req.query["limit"] ? Number(req.query["limit"]) : undefined;
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    const result = await getAllProducts({ categorySlug, pagination: { limit, cursor } });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const slug = String(req.params.slug);
    const product = await getProductBySlug(slug);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
}

export async function listCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categories = await getAllCategories();
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
}
