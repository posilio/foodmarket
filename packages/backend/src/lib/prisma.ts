// Shared Prisma Client singleton.
// A single instance is reused across the app to avoid exhausting the database
// connection pool — PrismaClient opens a connection pool on instantiation.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
