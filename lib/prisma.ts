import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * 🏛️ "Zero-Ambient" Lazy Database Provider (VERSION 7 - NAME_AWARE)
 * Prisma-Vercel integration often uses 'DATABASE_POSTGRES_URL' instead of 'DATABASE_URL'.
 * This version scans all possible names and explicitly passes the URL to the constructor
 * to satisfy the 'non-empty options' requirement.
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

  // 🕵️ SCAN FOR ANY VALID PRISMA URL
  const url = process.env.DATABASE_URL || 
              process.env.DATABASE_POSTGRES_URL || 
              process.env.DATABASE_PRISMA_DATABASE_URL;

  if (!url) {
      console.error("[DB_FAIL: V7] No database connection string found in environment variables.");
      return null as any;
  }

  if (!globalForPrisma.prisma) {
    console.log(`[DB_OK: VERSION 7] Found URL via: ${process.env.DATABASE_URL ? 'STANDARD' : 'VERCEL_INTEGRATION'}.`);

    const options: any = {};
    
    // 🚀 EXPLICIT INJECTION: This kills the 'non-empty constructor' error.
    if (url.startsWith('prisma')) {
        options.accelerateUrl = url;
    } else {
        options.datasources = {
            db: { url: url }
        };
    }

    globalForPrisma.prisma = new (PrismaClient as any)(options).$extends(withAccelerate());
  }
  
  return globalForPrisma.prisma;
}