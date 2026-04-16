import { PrismaClient } from "../prisma/generated/client";

/**
 * Standard Prisma Singleton for Next.js
 * This ensures we only have one instance of PrismaClient running, 
 * which is critical for Prisma Postgres and Vercel.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;