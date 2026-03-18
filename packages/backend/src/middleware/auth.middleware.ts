// Authentication middleware.
// Verifies the JWT on incoming requests and attaches the customer id to req.
// Reads the token from the httpOnly access_token cookie first;
// falls back to the Authorization: Bearer header for backwards compatibility.
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

interface JwtPayload {
  sub: string;
  email: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token =
    (req.cookies as Record<string, string | undefined>).access_token ??
    req.headers.authorization?.slice(7); // strip "Bearer "

  if (!token) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as JwtPayload;
    req.customerId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorised" });
  }
}
