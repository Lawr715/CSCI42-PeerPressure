import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * 🏛️ "Zero-Ambient" Lazy Database Provider (VERSION 3 - PRECISION_SYNC)
 * Diagnostics confirmed that VERSION 2 reached the server.
 * Diagnostics confirmed that DATABASE_URL is present.
 * Diagnostics confirmed that 'datasourceUrl' is NOT accepted by this engine version.
 * 
 * This version uses ONLY 'accelerateUrl' as verified by the runtime error.
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

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[DB_FAIL: V3] DATABASE_URL is missing.");
  } else {
    if (!globalForPrisma.prisma) {
        console.log(`[DB_OK: VERSION 3] URL detected. Length: ${url.length}`);
    }
  }

  if (!globalForPrisma.prisma) {
    // 🎯 SURGICAL STRIKE:
    // The engine rejected 'datasourceUrl' but accepts 'accelerateUrl'.
    const options: any = {
        accelerateUrl: url
    };

    globalForPrisma.prisma = new (PrismaClient as any)(options).$extends(withAccelerate());
  }
  
  return globalForPrisma.prisma;
}