// Extends Express Request to carry the authenticated customer id after JWT verification.
declare namespace Express {
  interface Request {
    customerId?: string;
  }
}
