// Request handlers for product and category routes.
// Validates input, calls the products service, and formats HTTP responses.
import { Request, Response, NextFunction } from "express";
import {
  getAllProducts,
  getProductBySlug,
  getAllCategories,
  getCategoryTree,
} from "../services/products.service";

export async function listProducts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const region = typeof req.query.region === "string" ? req.query.region : undefined;
    const country = typeof req.query.country === "string" ? req.query.country : undefined;
    const type = typeof req.query.type === "string" ? req.query.type : undefined;
    const limit = req.query["limit"] ? Number(req.query["limit"]) : undefined;
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const result = await getAllProducts({
      originRegionSlug: region,
      originCountrySlug: country,
      typeCategorySlug: type,
      q,
      pagination: { limit, cursor },
    });
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

export async function getCategoryTreeHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tree = await getCategoryTree();
    res.json(tree);
  } catch (err) {
    next(err);
  }
}
