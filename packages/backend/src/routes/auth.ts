// Express router for authentication endpoints.
import { Router } from "express";
import { register, login, me, refresh, logout, forgotPasswordHandler, resetPasswordHandler } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { authRateLimit, passwordResetRateLimit } from "../middleware/rateLimit.middleware";

const router = Router();

router.post("/auth/register", authRateLimit, register);
router.post("/auth/login", authRateLimit, login);
router.get("/auth/me", requireAuth, me);
router.post("/auth/refresh", authRateLimit, refresh);
router.post("/auth/logout", requireAuth, logout);
// Stricter limit: 5/hour to prevent email enumeration and reset-token exhaustion
router.post("/auth/forgot-password", passwordResetRateLimit, forgotPasswordHandler);
router.post("/auth/reset-password", passwordResetRateLimit, resetPasswordHandler);

export default router;
