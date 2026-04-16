import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * 🏛️ "Zero-Ambient" Lazy Database Provider (VERSION 11 - PROTOCOL_AWARE)
 * 1. Automatically detects the protocol (postgres vs prisma).
 * 2. Injects 'datasources' for direct links (Forced integration).
 * 3. Injects 'accelerateUrl' for pooled links.
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

  const url = process.env.DATABASE_URL || 
              process.env.DATABASE_POSTGRES_URL || 
              process.env.DATABASE_PRISMA_DATABASE_URL;

  if (!url) {
      console.error("[DB_FAIL: V11] No connection string found.");
      return null as any;
  }

  if (!globalForPrisma.prisma) {
    console.log(`[DB_OK: VERSION 11] Protocol: ${url.startsWith('prisma') ? 'POOLED' : 'DIRECT'}.`);

    const options: any = {};
    
    // 🕵️ PROTOCOL ROUTING
    if (url.startsWith('prisma')) {
        options.accelerateUrl = url;
    } else {
        // Use the standard datasources property for the "Forced" postgres:// link
        options.datasources = {
            db: { url: url }
        };
    }

    try {
        globalForPrisma.prisma = new (PrismaClient as any)(options).$extends(withAccelerate());
    } catch (e) {
        console.error("[DB_CRITICAL: V11] Initialization failed. Check if PRISMA_GENERATE_DATAPROXY=false is set in Vercel.");
        throw e;
    }
  }
  
  return globalForPrisma.prisma;
}