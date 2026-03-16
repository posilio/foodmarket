// Bootstrap route — promotes the first customer to admin without direct DB access.
// Only active when ADMIN_BOOTSTRAP_SECRET is set in the environment.
// Returns 404 when the secret is not configured (safe for production).
import { Router, Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { ADMIN_BOOTSTRAP_SECRET } from "../config/env";
import { AppError } from "../lib/errors";
import logger from "../lib/logger";

const router = Router();

router.post(
  "/bootstrap/admin",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Endpoint is disabled if no secret is configured
      if (!ADMIN_BOOTSTRAP_SECRET) {
        throw new AppError("Not found", 404);
      }

      const { email, secret } = req.body as { email?: string; secret?: string };

      if (!secret || secret !== ADMIN_BOOTSTRAP_SECRET) {
        throw new AppError("Forbidden", 403);
      }

      if (!email) {
        throw new AppError("email is required", 400);
      }

      // Only works when zero admins exist (first-run guard)
      const adminCount = await prisma.customer.count({ where: { isAdmin: true } });
      if (adminCount > 0) {
        throw new AppError("Forbidden — an admin already exists", 403);
      }

      const customer = await prisma.customer.findUnique({ where: { email } });
      if (!customer) {
        throw new AppError("Customer not found", 404);
      }

      if (customer.isAdmin) {
        res.json({ message: "Already an admin" });
        return;
      }

      const updated = await prisma.customer.update({
        where: { email },
        data: { isAdmin: true },
        select: { id: true, email: true, firstName: true, lastName: true, isAdmin: true },
      });

      logger.info({ customerId: updated.id, email }, "Bootstrap: customer promoted to admin");

      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
