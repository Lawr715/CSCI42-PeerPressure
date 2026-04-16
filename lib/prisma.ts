import { PrismaClient } from "../prisma/generated/client";

/**
 * Prisma Postgres (Serverless) Initialization
 * We no longer need manual pooling (pg) or adapters because Prisma Postgres
 * handles the connection natively through the prisma+postgres:// URL.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  (process.env.DATABASE_URL 
    ? new PrismaClient() 
    : ({} as PrismaClient)); // Fallback for build phase

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;