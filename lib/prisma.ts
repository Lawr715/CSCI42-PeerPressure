import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * 🏛️ "Zero-Ambient" Lazy Database Provider (VERSION 12 - ZERO_CONFIG)
 * This is the purest possible Prisma 7 implementation.
 * 1. No manual constructor options (datasources/accelerateUrl).
 * 2. Prisma 7 automatically reads configuration from DATABASE_URL and prisma.config.ts.
 * 3. This resolves the 'Unknown property datasources' error for good.
 */

const globalForPrisma = global as unknown as { prisma: any };

export function getDB() {
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

  if (isBuildPhase) {
    return {
      user: {}, account: {}, session: {}, verification: {},
      $extends: () => ({}),
    } as any;
  }

  if (!globalForPrisma.prisma) {
    console.log(`[DB_OK: VERSION 12] Zero-Config Initialized.`);

    try {
        // 🚀 THE FINAL FIX: No options at all. 
        // Prisma 7 is smart enough to find your URL in the environment.
        globalForPrisma.prisma = new (PrismaClient as any)().$extends(withAccelerate());
    } catch (e) {
        console.error("[DB_CRITICAL: V12] Initialization failed.");
        throw e;
    }
  }
  
  return globalForPrisma.prisma;
}