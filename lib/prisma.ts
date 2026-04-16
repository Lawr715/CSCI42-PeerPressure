import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * 🏛️ "Zero-Ambient" Lazy Database Provider (VERSION 6 - THE_VERDICT)
 * This version is designed to be the final word. 
 * ERROR: "PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions"
 * means your generated client EXCLUSIVELY requires an accelerateUrl property.
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
      console.error("[DB_FAIL: V6] DATABASE_URL is completely missing from runtime.");
      return null as any;
  }

  if (!globalForPrisma.prisma) {
    console.log(`[DB_OK: VERSION 6] Protocol: ${url.split(':')[0]}.`);

    const options: any = {};
    
    // 🕵️ THE FINAL LOGIC: 
    // If we have any URL at all, we MUST pass it to the constructor to move past the "non-empty" error.
    // If it's postgres://, we use datasources. If it's prisma://, we use accelerateUrl.
    if (url.startsWith('prisma')) {
        options.accelerateUrl = url;
    } else {
        // We force it into datasources - if this fails, the user MUST use Path B (remove Data Proxy flag).
        options.datasources = {
            db: { url: url }
        };
    }

    try {
        globalForPrisma.prisma = new (PrismaClient as any)(options).$extends(withAccelerate());
    } catch (e) {
        console.error("[DB_CRITICAL] Failed to initialize Prisma with provided options. This usually means a mismatch between your DATABASE_URL and your generated client type.");
        throw e;
    }
  }
  
  return globalForPrisma.prisma;
}