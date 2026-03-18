// Admin middleware — verifies JWT then checks the isAdmin flag on the customer.
// Must be used after (or instead of) requireAuth on admin routes.
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";

interface JwtPayload {
  sub: string;
  email: string;
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }

  const token = authHeader.slice(7);

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as JwtPayload;
  } catch {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }

  const customer = await prisma.customer.findUnique({
    where: { id: payload.sub },
    select: { id: true, isAdmin: true, isActive: true },
  });

  if (!customer || !customer.isActive) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }

  if (!customer.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  req.customerId = customer.id;
  next();
}
