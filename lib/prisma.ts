import { PrismaClient } from "@prisma/client";

/**
 * 🏛️ PURE DIRECT PROVIDER
 * This is the ultimate stabilization for your manual Prisma Postgres setup.
 * No extensions, no hacks—just a clean, reliable connection.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const getDB = () => {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return {
      user: {}, account: {}, session: {},
    } as any;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  
  return globalForPrisma.prisma;
};