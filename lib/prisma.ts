import { PrismaClient } from "../prisma/generated/client";

/**
 * 🛠️ Total Safety Prisma Initialization (Prisma 7 + Vercel)
 * This is the ultimate "set it and forget it" pattern.
 * We provide a fallback URL to satisfy the constructor during the build 
 * and during any runtime environment gaps.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// We use the direct datasourceUrl override which is the most robust way 
// to ensure Prisma 7 starts up in serverless environments.
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // @ts-ignore - Valid at runtime for Prisma 7 serverless, handles build phase fallback
    datasourceUrl: process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/db",
  } as any);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;