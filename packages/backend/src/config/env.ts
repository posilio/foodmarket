// Reads and validates all environment variables at startup.
// The app fails fast if required variables are missing or malformed.

export const PORT = parseInt(process.env.PORT ?? "4000", 10);
export const NODE_ENV = process.env.NODE_ENV ?? "development";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.trim() === "") {
  throw new Error(
    "JWT_SECRET environment variable is required but not set. " +
      "Add it to packages/backend/.env before starting the server."
  );
}
if (jwtSecret.length < 32) {
  throw new Error(
    "JWT_SECRET must be at least 32 characters long. " +
      "Use a cryptographically random string (e.g. openssl rand -hex 32)."
  );
}
export const JWT_SECRET: string = jwtSecret;
// Access tokens are short-lived (15m). Clients use the refresh token to get a new one.
export const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
// Keep legacy var for backward compat (used by tests that don't need refresh flow).
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "15m";

// Shipping — flat rate in euro cents (default €4.99).
export const SHIPPING_FLAT_RATE_CENTS = parseInt(
  process.env.SHIPPING_FLAT_RATE_CENTS ?? "499",
  10
);

// Email — optional; if missing, email sending is skipped with a warning
export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
export const RESEND_FROM = process.env.RESEND_FROM ?? "onboarding@resend.dev";

// Payments — optional; if missing, payment creation is skipped with a warning
export const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY ?? "";
export const MOLLIE_REDIRECT_BASE =
  process.env.MOLLIE_REDIRECT_BASE ?? "http://localhost:3000";

// Bootstrap — optional; enables POST /api/v1/bootstrap/admin (first-run only).
// Leave empty to disable the endpoint entirely (safe default for production).
export const ADMIN_BOOTSTRAP_SECRET = process.env.ADMIN_BOOTSTRAP_SECRET ?? "";

// Anthropic — required for the AI-powered PDF invoice parser (FOOD stock import).
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";

// Frontend URL — used to build links in transactional emails.
export const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

// Low stock alert job — email destination and threshold.
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
export const LOW_STOCK_THRESHOLD = parseInt(process.env.LOW_STOCK_THRESHOLD ?? "10", 10);

// CORS — comma-separated list of allowed origins.
// In production set to your actual frontend domains.
export const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ?? "http://localhost:3000,http://localhost:3001"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
