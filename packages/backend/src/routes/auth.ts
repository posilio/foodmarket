// Express router for authentication endpoints.
import { Router } from "express";
import { register, login, me, refresh, logout } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { authRateLimit } from "../middleware/rateLimit.middleware";

const router = Router();

router.post("/auth/register", authRateLimit, register);
router.post("/auth/login", authRateLimit, login);
router.get("/auth/me", requireAuth, me);
router.post("/auth/refresh", authRateLimit, refresh);
router.post("/auth/logout", requireAuth, logout);

export default router;
