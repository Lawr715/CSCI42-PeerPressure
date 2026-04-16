import { PrismaClient } from "../prisma/generated/client";

/**
 * 🏛️ Architectural Stability Fix (Prisma 7 + Vercel)
 * Instead of a Proxy (which breaks private fields), we use a fallback URL.
 * This satisfies the constructor check during build, but allows the real 
 * DATABASE_URL to take over at runtime.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// We use a dummy URL only if the real one is missing (during the build phase)
const buildTimeUrl = "postgresql://dummy:dummy@localhost:5432/dummy";

export const prisma =
  globalForPrisma.prisma || 
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || buildTimeUrl
      }
    }
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;