// Admin middleware — verifies JWT then checks the isAdmin flag on the customer.
// Reads the token from the httpOnly access_token cookie first;
// falls back to the Authorization: Bearer header for backwards compatibility.
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
  const token =
    (req.cookies as Record<string, string | undefined>).access_token ??
    req.headers.authorization?.slice(7); // strip "Bearer "

  if (!token) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }

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
    throw new AppError("Forbidden", 403);
  }

  req.customerId = customer.id;
  next();
}
