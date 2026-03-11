// Business logic for customers.
// Manages customer profiles and provides admin-level customer browsing.
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";

// ─── Customer-facing ──────────────────────────────────────────────────────────

// Returns the authenticated customer's own profile (no passwordHash).
export async function getCustomerProfile(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
    },
  });
  if (!customer) throw new AppError("Customer not found", 404);
  return customer;
}

// ─── Admin-facing ─────────────────────────────────────────────────────────────

// Returns all customers with order count and total spend aggregated.
export async function getAllCustomers() {
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
      createdAt: true,
      _count: { select: { orders: true } },
      orders: { select: { totalEuroCents: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return customers.map((c) => ({
    id: c.id,
    email: c.email,
    firstName: c.firstName,
    lastName: c.lastName,
    isActive: c.isActive,
    createdAt: c.createdAt,
    orderCount: c._count.orders,
    totalSpentEuroCents: c.orders.reduce((sum, o) => sum + o.totalEuroCents, 0),
  }));
}

// Returns a single customer's full profile including order history and addresses.
export async function getCustomerByIdAdmin(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      isActive: true,
      isAdmin: true,
      createdAt: true,
      orders: {
        select: {
          id: true,
          status: true,
          totalEuroCents: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      addresses: {
        select: {
          id: true,
          street: true,
          houseNumber: true,
          houseNumberAddition: true,
          postalCode: true,
          city: true,
          country: true,
          isDefault: true,
        },
      },
    },
  });
  if (!customer) throw new AppError("Customer not found", 404);
  return customer;
}
