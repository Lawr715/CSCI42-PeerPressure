import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * 🏛️ "Zero-Ambient" Lazy Database Provider (VERSION 4 - UNIVERSAL_ROUTER)
 * This version is protocol-aware. It detects if you are using:
 * 1. Direct Connection (postgres://) -> Uses standard datasources
 * 2. Accelerate Connection (prisma://) -> Uses accelerateUrl
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
    console.error("[DB_FAIL: V4] DATABASE_URL is missing.");
    return null as any;
  }

  if (!globalForPrisma.prisma) {
    console.log(`[DB_OK: VERSION 4] Protocol: ${url.split(':')[0]}. Length: ${url.length}`);

    // 🎯 UNIVERSAL ROUTING LOGIC
    const options: any = {};
    
    if (url.startsWith('prisma://') || url.startsWith('prisma+postgres://')) {
        // Accelerate Logic
        options.accelerateUrl = url;
    } else {
        // Direct Connection Logic
        options.datasources = {
            db: { url: url }
        };
    }

    globalForPrisma.prisma = new (PrismaClient as any)(options).$extends(withAccelerate());
  }
  
  return globalForPrisma.prisma;
}