// Express router for customer endpoints.
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getMe, deleteMe } from "../controllers/customers.controller";

const router = Router();

router.get("/customers/me", requireAuth, getMe);
router.delete("/customers/me", requireAuth, deleteMe);

export default router;
