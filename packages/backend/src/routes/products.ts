// Express router for product and category endpoints.
import { Router } from "express";
import {
  listProducts,
  getProduct,
  listCategories,
} from "../controllers/products.controller";

const router = Router();

router.get("/products", listProducts);
router.get("/products/:slug", getProduct);
router.get("/categories", listCategories);

export default router;
