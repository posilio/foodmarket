// Express router for authentication endpoints.
import { Router } from "express";
import { register, login, me, refresh, logout, forgotPasswordHandler, resetPasswordHandler } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { authRateLimit } from "../middleware/rateLimit.middleware";

const router = Router();

router.post("/auth/register", authRateLimit, register);
router.post("/auth/login", authRateLimit, login);
router.get("/auth/me", requireAuth, me);
router.post("/auth/refresh", authRateLimit, refresh);
router.post("/auth/logout", requireAuth, logout);
router.post("/auth/forgot-password", authRateLimit, forgotPasswordHandler);
router.post("/auth/reset-password", authRateLimit, resetPasswordHandler);

export default router;
