// Express application setup.
// Registers global middleware, mounts versioned API routes, and attaches the error handler.
import path from "path";
import express from "express";
import cors from "cors";
import productsRouter from "./routes/products";
import authRouter from "./routes/auth";
import ordersRouter from "./routes/orders";
import addressesRouter from "./routes/addresses";
import customersRouter from "./routes/customers";
import adminRouter from "./routes/admin";
import paymentsRouter from "./routes/payments";
import bootstrapRouter from "./routes/bootstrap";
import uploadRouter from "./routes/upload.routes";
import importRouter from "./routes/import.routes";
import reviewsRouter from "./routes/reviews";
import { errorMiddleware } from "./middleware/error.middleware";
import { globalRateLimit } from "./middleware/rateLimit.middleware";
import { ALLOWED_ORIGINS } from "./config/env";

const app = express();

// Trust Railway's reverse proxy so rate limiter reads the correct client IP
app.set('trust proxy', 1);

// CORS — must be first so pre-flight OPTIONS requests are handled before rate limiting.
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
// Needed for Mollie webhook (sends application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: false }));

// Serve uploaded images as static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Global rate limit — applied before all routes
app.use(globalRateLimit);

// Health check — unauthenticated, no version prefix
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "foodwebshop-backend" });
});

// Versioned API routes
app.use("/api/v1", productsRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", ordersRouter);
app.use("/api/v1", addressesRouter);
app.use("/api/v1", customersRouter);
app.use("/api/v1", adminRouter);
app.use("/api/v1", paymentsRouter);
app.use("/api/v1", bootstrapRouter);
app.use("/api/v1", uploadRouter);
app.use("/api/v1", importRouter);
app.use("/api/v1", reviewsRouter);

// Global error handler — must be last
app.use(errorMiddleware);

export default app;
