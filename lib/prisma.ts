import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * 🏛️ Final Architectural Stabilization: The No-Proxy Pattern
 * This is the ultimate fix for Prisma 7 + Vercel + Better-Auth.
 * 
 * 1. Build Phase: If DATABASE_URL is missing, we export a dummy to satisfy the build.
 * 2. Runtime Phase: We export the REAL, UNWRAPPED Prisma Client to avoid #state errors.
 */

const globalForPrisma = global as unknown as { prisma: any };

export const prisma = (() => {
  // If we have a DATABASE_URL, we are at Runtime (or a local dev session)
  if (process.env.DATABASE_URL) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient().$extends(withAccelerate());
    }
    return globalForPrisma.prisma;
  }

  // If we don't have a URL (Vercel Build Phase), we export a safe dummy
  // We include common keys so libraries like Better-Auth don't crash on import
  return {
    user: {},
    account: {},
    session: {},
    verification: {},
    $extends: () => ({}),
  } as any;
})();

export default prisma;