// Rate limiting middleware — protects auth endpoints from brute-force attacks.
import rateLimit from "express-rate-limit";

const rateLimitResponse = {
  message: "Too many requests, please try again later.",
};

// Strict limiter for auth endpoints — 10 requests per 15 minutes per IP
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
});

// Stricter limiter for password-reset endpoints — 5 requests per hour per IP
// Prevents brute-force enumeration of email addresses and token exhaustion attacks.
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
});

// Global limiter — 200 requests per minute per IP (safety net for all routes)
export const globalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
});
