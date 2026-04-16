import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * 🚀 High-Performance "Long Term Vibe" Architecture
 * 1. Build-Safe: Lazy initializes so it never crashes during Vercel deployment.
 * 2. Accelerate: Extended to support your db.prisma.io (sk_...) connection string.
 * 3. Context-Aware: Uses Reflect.get to ensure Prisma 7 private fields work perfectly.
 */

let _prisma: any = null;
const globalForPrisma = global as unknown as { prisma: any };

const getPrisma = () => {
  if (!_prisma) {
    if (globalForPrisma.prisma) {
      _prisma = globalForPrisma.prisma;
    } else {
      // We initialize the client and EXTEND it with Accelerate
      const client = new PrismaClient().$extends(withAccelerate());
      _prisma = client;

      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = _prisma;
      }
    }
  }
  return _prisma;
};

// The Proxy provides the "Lazy" build-time safety
export const prisma = new Proxy({} as any, {
  get(target, prop, receiver) {
    if (
      prop === "toJSON" ||
      prop === "then" ||
      prop === "$$typeof" ||
      typeof prop === "symbol"
    ) {
      return undefined;
    }

    const client = getPrisma();
    
    // Use Reflect to maintain the correct internal context for the extended client
    const value = Reflect.get(client, prop, client);
    
    if (typeof value === "function") {
      return value.bind(client);
    }
    
    return value;
  },
});

export default prisma;