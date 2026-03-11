// Request handlers for customer routes.
// Validates input, calls the customers service, and formats the HTTP response.
import { Request, Response, NextFunction } from "express";
import { getCustomerProfile } from "../services/customers.service";

// GET /customers/me — returns the authenticated customer's own profile.
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await getCustomerProfile(req.customerId!);
    res.json({ data: customer });
  } catch (err) {
    next(err);
  }
}
