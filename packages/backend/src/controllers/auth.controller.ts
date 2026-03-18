// Request handlers for authentication routes.
// Validates input, calls the auth service, and formats HTTP responses.
import { Request, Response, NextFunction, CookieOptions } from "express";
import {
  registerCustomer,
  loginCustomer,
  getCustomerById,
  refreshAccessToken,
  revokeRefreshToken,
  forgotPassword,
  resetPassword,
} from "../services/auth.service";

// httpOnly cookie settings shared by login, register, and refresh.
function accessCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60 * 1000, // 15 minutes
  };
}

function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie("access_token", accessToken, accessCookieOptions());
  res.cookie("refresh_token", refreshToken, refreshCookieOptions());
}

function clearAuthCookies(res: Response) {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (
      !email || typeof email !== "string" ||
      !password || typeof password !== "string" ||
      !firstName || typeof firstName !== "string" ||
      !lastName || typeof lastName !== "string"
    ) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const result = await registerCustomer({
      email: email.trim().toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: typeof phone === "string" ? phone.trim() : undefined,
    });

    setAuthCookies(res, result.token, result.refreshToken);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const result = await loginCustomer({
      email: email.trim().toLowerCase(),
      password,
    });

    setAuthCookies(res, result.token, result.refreshToken);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await getCustomerById(req.customerId!);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.json({ data: customer });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    // Read refresh token from httpOnly cookie first, fall back to request body
    // (body fallback retained for backwards compatibility during migration).
    const refreshToken =
      (req.cookies as Record<string, string | undefined>).refresh_token ??
      (req.body as { refreshToken?: string }).refreshToken;

    if (!refreshToken || typeof refreshToken !== "string") {
      res.status(400).json({ error: "refreshToken is required" });
      return;
    }

    const result = await refreshAccessToken(refreshToken);
    setAuthCookies(res, result.token, result.refreshToken);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    // Revoke refresh token — read from cookie first, fall back to body
    const refreshToken =
      (req.cookies as Record<string, string | undefined>).refresh_token ??
      (req.body as { refreshToken?: string }).refreshToken;

    if (refreshToken && typeof refreshToken === "string") {
      await revokeRefreshToken(refreshToken);
    }

    clearAuthCookies(res);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function forgotPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body as { email?: string };
    if (email && typeof email === "string") {
      await forgotPassword(email.trim().toLowerCase());
    }
    // Always 200 — never reveal whether the email exists.
    res.json({ message: "If that email exists you will receive a reset link" });
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body as { token?: string; password?: string };
    if (!token || typeof token !== "string" || !password || typeof password !== "string") {
      res.status(400).json({ error: "token and password are required" });
      return;
    }
    await resetPassword(token, password);
    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
}
