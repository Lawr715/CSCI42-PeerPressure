import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * 🏛️ CLEAN SLATE - Standard Prisma 7 Provider
 * This is the ultimate, non-hacked version for a fresh deployment.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const getDB = () => {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return {
      user: {}, account: {}, session: {},
      $extends: () => ({}),
    } as any;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient().$extends(withAccelerate()) as any;
  }
  
  return globalForPrisma.prisma;
};