import { PrismaClient } from "../prisma/generated/client";

/**
 * Standard Prisma Singleton for Next.js (Prisma 7+)
 * Since all API routes are now marked as "force-dynamic", 
 * we can use the simplest initialization pattern.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;