// Business logic for customers.
// Manages customer profiles and provides admin-level customer browsing.
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";
import { PaginationParams, PagedResult } from "./admin.service";

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

type CustomerSummary = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: Date;
  orderCount: number;
  totalSpentEuroCents: number;
};

// Returns all customers with order count and total spend aggregated.
export async function getAllCustomers(
  pagination: PaginationParams = {}
): Promise<PagedResult<CustomerSummary>> {
  const take = Math.min(Number(pagination.limit) || 20, 100);
  const cursor = pagination.cursor ? { id: pagination.cursor } : undefined;

  const [raw, total] = await Promise.all([
    prisma.customer.findMany({
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
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor,
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.count(),
  ]);

  let nextCursor: string | null = null;
  if (raw.length > take) {
    const next = raw.pop()!;
    nextCursor = next.id;
  }

  const data: CustomerSummary[] = raw.map((c) => ({
    id: c.id,
    email: c.email,
    firstName: c.firstName,
    lastName: c.lastName,
    isActive: c.isActive,
    createdAt: c.createdAt,
    orderCount: c._count.orders,
    totalSpentEuroCents: c.orders.reduce((sum, o) => sum + o.totalEuroCents, 0),
  }));

  return { data, nextCursor, total };
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
