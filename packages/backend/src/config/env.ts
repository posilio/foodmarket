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
export const JWT_SECRET: string = jwtSecret;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h";

// Email — optional; if missing, email sending is skipped with a warning
export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
export const RESEND_FROM = process.env.RESEND_FROM ?? "onboarding@resend.dev";

// Payments — optional; if missing, payment creation is skipped with a warning
export const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY ?? "";
export const MOLLIE_REDIRECT_BASE =
  process.env.MOLLIE_REDIRECT_BASE ?? "http://localhost:3000";
