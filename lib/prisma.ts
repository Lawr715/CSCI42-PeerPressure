import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * 🏛️ RESEARCH-BACKED STABILIZATION (VERSION 14 - DRIVER_ADAPTER)
 * Prisma 7 requires a driver adapter to connect to standard PostgreSQL 
 * in serverless environments like Vercel.
 * 
 * 1. Satisfies the "Needs non-empty constructor" requirement.
 * 2. Handles SSL certificates explicitly.
 * 3. Bypasses the Prisma binary engine to avoid P1001 errors.
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
      console.error("[DB_FAIL: V14] No connection string found.");
      return null as any;
  }

  if (!globalForPrisma.prisma) {
    console.log(`[DB_OK: VERSION 14] Initializing with Driver Adapter.`);

    try {
        // 🚀 THE CORE FIX: Create a native pg Pool with explicit SSL handling
        const pool = new Pool({ 
            connectionString: url,
            ssl: {
                rejectUnauthorized: false // This allows the connection to Prisma Postgres
            }
        });

        // 🛡️ THE ARCHITECTURE FIX: Wrap the pool in the Prisma Driver Adapter
        const adapter = new PrismaPg(pool);

        // ✅ THE CONSTRUCTOR FIX: Provide the adapter to satisfy Prisma 7
        globalForPrisma.prisma = new (PrismaClient as any)({ adapter });
    } catch (e) {
        console.error("[DB_CRITICAL: V14] Initialization failed.");
        throw e;
    }
  }
  
  return globalForPrisma.prisma;
}