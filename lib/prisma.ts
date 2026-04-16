import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * 🏛️ Final Architectural Stabilization: The Phase-Aware No-Proxy Pattern
 * This is the ultimate fix for Prisma 7 + Vercel + Better-Auth.
 * 
 * 1. Build Phase: If Next.js is building, we export a dummy to satisfy the build.
 * 2. Runtime Phase: We export the REAL, UNWRAPPED Prisma Client.
 */

const globalForPrisma = global as unknown as { prisma: any };

export const prisma = (() => {
  // We explicitly detect the Next.js build phase
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

  if (!isBuildPhase && process.env.DATABASE_URL) {
    // RUNTIME
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient().$extends(withAccelerate());
    }
    return globalForPrisma.prisma;
  }

  // BUILD PHASE (or missing URL)
  // We export a safe dummy so Better-Auth and other libraries don't crash on import
  return {
    user: {},
    account: {},
    session: {},
    verification: {},
    $extends: () => ({}),
  } as any;
})();

export default prisma;