import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * 🏛️ Radical Architectural Shift: Lazy Database Provider
 * We no longer export a 'prisma' constant. We export a function 'getDB()'.
 * This ensures zero database initialization occurs during the Vercel build phase.
 */

const globalForPrisma = global as unknown as { prisma: any };

export function getDB() {
  // If we are in the Next.js build phase, we return a safe dummy object
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return {
      user: {},
      account: {},
      session: {},
      verification: {},
      $extends: () => ({}),
    } as any;
  }

  // At runtime, we use a singleton pattern to maintain performance
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient().$extends(withAccelerate());
  }
  
  return globalForPrisma.prisma;
}

// Keep a default export for backward compatibility during the refactor
const prisma = getDB();
export default prisma;