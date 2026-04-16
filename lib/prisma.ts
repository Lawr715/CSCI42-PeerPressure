import { PrismaClient } from "../prisma/generated/client";

/**
 * 🏗️ Build-Phase Aware Prisma Initialization
 * This is the "Gold Standard" for Next.js deployments.
 * It prevents the database engine from starting during the build phase (where no DB exists),
 * but ensures it works perfectly at runtime on Vercel.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  // Special check: Are we in the Next.js Build Phase?
  (process.env.NEXT_PHASE === 'phase-production-build'
    ? ({} as PrismaClient) // Export a safe placeholder during build
    : new PrismaClient());    // Export the real engine at runtime

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;