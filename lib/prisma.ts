import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * 🏛️ "Zero-Ambient" Lazy Database Provider (VERSION 5 - NATIVE_ENV)
 * We have officially exhausted property overrides (datasourceUrl, accelerateUrl, datasources).
 * This version uses the NATIVE initialization. We pass NO options to the constructor,
 * forcing the engine to read directly from process.env.DATABASE_URL.
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
      console.error("[DB_FAIL: V5] DATABASE_URL is missing.");
      return null as any;
  }

  if (!globalForPrisma.prisma) {
    console.log(`[DB_OK: VERSION 5] Protocol detected: ${url.split(':')[0]}. Letting engine handle environment.`);
    
    // 🚀 THE FINAL BREAK: Passing NO options. 
    // This removes all 'Unknown property' and 'Validation' errors from the constructor.
    globalForPrisma.prisma = new (PrismaClient as any)().$extends(withAccelerate());
  }
  
  return globalForPrisma.prisma;
}