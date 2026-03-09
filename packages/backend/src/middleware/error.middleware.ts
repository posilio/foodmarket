// Global error-handling middleware for Express.
// Must be registered after all routes. Handles AppErrors with their status codes,
// and returns a safe generic message for all unexpected errors.
import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors";
import logger from "../lib/logger";

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // next is required in the signature for Express to recognise this as an error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (err instanceof AppError) {
    // Known, intentional errors — safe to surface the message to the client
    logger.warn({ statusCode: err.statusCode, path: req.path }, err.message);
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Unknown errors — log in full, return a generic message
  if (process.env.NODE_ENV !== "production") {
    logger.error({ err, path: req.path, method: req.method }, err.message);
  } else {
    logger.error({ message: err.message, path: req.path }, "Unhandled error");
  }

  res.status(500).json({ error: "Something went wrong" });
}
