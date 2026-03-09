// Business logic for customer delivery addresses.
import prisma from "../lib/prisma";

export interface CreateAddressInput {
  street: string;
  houseNumber: string;
  houseNumberAddition?: string;
  postalCode: string;
  city: string;
  country?: string;
}

export async function createAddress(
  customerId: string,
  input: CreateAddressInput
) {
  return prisma.address.create({
    data: {
      customerId,
      street: input.street,
      houseNumber: input.houseNumber,
      houseNumberAddition: input.houseNumberAddition,
      postalCode: input.postalCode,
      city: input.city,
      country: input.country ?? "NL",
    },
  });
}
