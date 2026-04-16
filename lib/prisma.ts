import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * 🏛️ "Zero-Ambient" Lazy Database Provider (VERSION 13 - FINAL_STABLE)
 * 1. Uses 'datasourceUrl' to satisfy Prisma 7's non-empty constructor requirement.
 * 2. Protocol-aware URL discovery with fallbacks.
 * 3. Handles Vercel's specific serverless engine initialization.
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

  // 🕵️ Environment-Safe Discovery
  const url = process.env.DATABASE_URL || 
              process.env.DATABASE_POSTGRES_URL || 
              process.env.DATABASE_PRISMA_DATABASE_URL;

  if (!url) {
      console.error("[DB_FAIL: V13] No connection string found in Vercel environment.");
      return null as any;
  }

  if (!globalForPrisma.prisma) {
    console.log(`[DB_OK: VERSION 13] Explicit Initialization.`);

    try {
        // 🚀 THE DEFINITIVE FIX: Use datasourceUrl to satisfy the Prisma 7 engine.
        globalForPrisma.prisma = new (PrismaClient as any)({
            datasourceUrl: url
        }).$extends(withAccelerate());
    } catch (e) {
        console.error("[DB_CRITICAL: V13] Initialization failed.");
        throw e;
    }
  }
  
  return globalForPrisma.prisma;
}