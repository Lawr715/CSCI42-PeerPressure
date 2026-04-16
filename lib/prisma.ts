import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

/**
 * 🏛️ "Zero-Ambient" Lazy Database Provider (VERSION 8 - UNIVERSAL_ADAPTER)
 * We have officially hit the limit of Prisma's Protocol Engine.
 * This version uses the DRIVER ADAPTER pattern to bypass engine validation.
 * It uses the 'pg' library to handle the connection, which Prisma cannot reject.
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
      console.error("[DB_FAIL: V8] No connection string found.");
      return null as any;
  }

  if (!globalForPrisma.prisma) {
    console.log(`[DB_OK: VERSION 8] Using Universal Driver Adapter.`);

    try {
        if (url.startsWith('prisma')) {
            // If it's a pooled URL, we use the Accelerate property
            globalForPrisma.prisma = new (PrismaClient as any)({
                accelerateUrl: url
            }).$extends(withAccelerate());
        } else {
            // 🚀 THE MAGIC PLUG: Use a native PG pool. 
            // This ignores all 'Unknown property datasources' errors.
            const pool = new pg.Pool({ connectionString: url });
            const adapter = new PrismaPg(pool);
            globalForPrisma.prisma = new (PrismaClient as any)({ adapter }).$extends(withAccelerate());
        }
    } catch (e) {
        console.error("[DB_CRITICAL: V8] Adapter initialization failed.");
        throw e;
    }
  }
  
  return globalForPrisma.prisma;
}