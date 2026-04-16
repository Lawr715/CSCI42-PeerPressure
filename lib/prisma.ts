import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * 🏛️ "Zero-Ambient" Lazy Database Provider (VERSION 2 - FORCE_SYNC)
 * This version uses an 'any' cast to bypass Prisma's restrictive internal types
 * and includes a version marker to ensure Vercel isn't using a cached file.
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
    console.error("[DB_FAIL: V2] DATABASE_URL is missing.");
  } else {
    if (!globalForPrisma.prisma) {
        // Logging the version to ensure we are seeing the LATEST code in Vercel
        console.log(`[DB_OK: VERSION 2] URL detected. Length: ${url.length}`);
    }
  }

  if (!globalForPrisma.prisma) {
    // 🚀 Using 'as any' to bypass the 'datasourceUrl' vs 'accelerateUrl' type conflict
    // and passing BOTH just in case the engine is picky.
    const options: any = {
        datasourceUrl: url,
        accelerateUrl: url
    };

    globalForPrisma.prisma = new (PrismaClient as any)(options).$extends(withAccelerate());
  }
  
  return globalForPrisma.prisma;
}