import { PrismaClient } from "../prisma/generated/client";

/**
 * 🌊 The "Long Term Vibe" Fix: Environment-Level Safety
 * We ensure DATABASE_URL is never empty during the build phase.
 * If it's missing (Vercel Build Phase), we inject a ghost URL to satisfy Prisma's strict construction.
 * At runtime, the real Vercel URL will naturally override this.
 */

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  process.env.DATABASE_URL = "postgresql://dummy:dummy@localhost:5432/dummy";
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;