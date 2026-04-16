import { PrismaClient } from "../prisma/generated/client";

/**
 * Robust Prisma Singleton for Next.js (Prisma Postgres Support)
 * We only initialize the client with the datasource URL if it is present.
 * This prevents build-time errors when DATABASE_URL is not available.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || 
  new PrismaClient(
    process.env.DATABASE_URL 
      ? { datasourceUrl: process.env.DATABASE_URL } 
      : undefined
  );

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;