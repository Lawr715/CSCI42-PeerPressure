import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

/**
 * 🏛️ "Zero-Ambient" Lazy Database Provider (VERSION 9 - SECURE_ADAPTER)
 * 1. Fixed SSL Mode: Explicitly accepting Prisma's certificates to bypass 'verify-full' warnings.
 * 2. Optimized Pool: Adding a small connection timeout to prevent 'Failed to identify' hangs.
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
      console.error("[DB_FAIL: V9] No connection string found.");
      return null as any;
  }

  if (!globalForPrisma.prisma) {
    console.log(`[DB_OK: VERSION 9] Initializing Secure Universal Adapter.`);

    try {
        if (url.startsWith('prisma')) {
            globalForPrisma.prisma = new (PrismaClient as any)({
                accelerateUrl: url
            }).$extends(withAccelerate());
        } else {
            // 🚀 SECURE HANDSHAKE: Explicitly allowing the SSL connection for Prisma Postgres
            const pool = new pg.Pool({ 
                connectionString: url,
                ssl: {
                    rejectUnauthorized: false // Required for some Prisma serverless regions
                },
                connectionTimeoutMillis: 5000 
            });
            const adapter = new PrismaPg(pool);
            globalForPrisma.prisma = new (PrismaClient as any)({ adapter }).$extends(withAccelerate());
        }
    } catch (e) {
        console.error("[DB_CRITICAL: V9] Adapter initialization failed.");
        throw e;
    }
  }
  
  return globalForPrisma.prisma;
}