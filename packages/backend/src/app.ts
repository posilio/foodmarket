// Express application setup.
// Registers global middleware, mounts versioned API routes, and attaches the error handler.
import express from "express";
import productsRouter from "./routes/products";
import authRouter from "./routes/auth";
import ordersRouter from "./routes/orders";
import addressesRouter from "./routes/addresses";
import customersRouter from "./routes/customers";
import adminRouter from "./routes/admin";
import paymentsRouter from "./routes/payments";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(express.json());
// Needed for Mollie webhook (sends application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: false }));

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

// Global error handler — must be last
app.use(errorMiddleware);

export default app;
