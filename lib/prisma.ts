import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * 🏛️ "Zero-Ambient" Lazy Database Provider
 * This file has NO top-level execution triggers. 
 * Initialization ONLY happens when getDB() is called at runtime.
 */

const globalForPrisma = global as unknown as { prisma: any };

export function getDB() {
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

  if (isBuildPhase) {
    // During build, we return a completely inert dummy
    return {
      user: {}, account: {}, session: {}, verification: {},
      $extends: () => ({}),
    } as any;
  }

  // 🕵️ Runtime Diagnostics (The "Black Box")
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[DB_FAIL] DATABASE_URL is missing in the current runtime environment.");
  } else if (url.length < 20) {
    console.error(`[DB_FAIL] DATABASE_URL is suspiciously short (${url.length} chars). Check Vercel Settings.`);
  } else {
    // Only log once during initialization to avoid log spam
    if (!globalForPrisma.prisma) {
        console.log(`[DB_OK] URL detected. Protocol: ${url.split(':')[0]}. Length: ${url.length}`);
    }
  }

  // Runtime Singleton
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient().$extends(withAccelerate());
  }
  
  return globalForPrisma.prisma;
}