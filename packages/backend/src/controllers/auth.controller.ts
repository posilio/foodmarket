// Request handlers for authentication routes.
// Validates input, calls the auth service, and formats HTTP responses.
import { Request, Response, NextFunction } from "express";
import {
  registerCustomer,
  loginCustomer,
  getCustomerById,
} from "../services/auth.service";

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

    const customer = await registerCustomer({
      email: email.trim().toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: typeof phone === "string" ? phone.trim() : undefined,
    });

    res.status(201).json({ data: customer });
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
