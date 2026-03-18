// Request handlers for customer routes.
// Validates input, calls the customers service, and formats the HTTP response.
import { Request, Response, NextFunction } from "express";
import { getCustomerProfile } from "../services/customers.service";
import { deleteMyAccount } from "../services/auth.service";

// GET /customers/me — returns the authenticated customer's own profile.
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await getCustomerProfile(req.customerId!);
    res.json({ data: customer });
  } catch (err) {
    next(err);
  }
}

// DELETE /customers/me — GDPR right-to-erasure: anonymises the customer record.
// Orders are retained for 7-year Dutch tax law compliance.
export async function deleteMe(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteMyAccount(req.customerId!);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
