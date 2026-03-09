// Request handlers for order routes.
// All routes are protected — req.customerId is guaranteed set by requireAuth.
import { Request, Response, NextFunction } from "express";
import {
  createOrder,
  getOrdersByCustomer,
  getOrderById,
} from "../services/orders.service";

export async function createOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const customerId = req.customerId!;
    const { shippingAddressId, lines, notes } = req.body;

    if (!shippingAddressId || typeof shippingAddressId !== "string") {
      res.status(400).json({ error: "shippingAddressId is required" });
      return;
    }

    if (!Array.isArray(lines) || lines.length === 0) {
      res.status(400).json({ error: "lines must be a non-empty array" });
      return;
    }

    for (const line of lines) {
      if (!line.variantId || typeof line.variantId !== "string") {
        res.status(400).json({ error: "Each line must have a variantId string" });
        return;
      }
      if (!Number.isInteger(line.quantity) || line.quantity < 1) {
        res.status(400).json({ error: "Each line quantity must be a positive integer" });
        return;
      }
    }

    const order = await createOrder({
      customerId,
      shippingAddressId,
      lines,
      notes: typeof notes === "string" ? notes : undefined,
    });

    res.status(201).json({ data: order });
  } catch (err) {
    next(err);
  }
}

export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await getOrdersByCustomer(req.customerId!);
    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    const order = await getOrderById(id, req.customerId!);
    res.json({ data: order });
  } catch (err) {
    next(err);
  }
}
