// Authentication middleware.
// Verifies the JWT on incoming requests and attaches the customer id to req.
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

interface JwtPayload {
  sub: string;
  email: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as JwtPayload;
    req.customerId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorised" });
  }
}
