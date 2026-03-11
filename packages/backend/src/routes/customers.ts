// Express router for customer endpoints.
// GET /customers/me — returns the authenticated customer's own profile.
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getMe } from "../controllers/customers.controller";

const router = Router();

router.get("/customers/me", requireAuth, getMe);

export default router;
