import { PrismaClient } from "../prisma/generated/client";

/**
 * 🛰️ The "Long Term Vibe" Final Fix: Reflect-Aware Lazy Proxy
 * 1. Build-Safe: Never calls new PrismaClient() during the Vercel build phase.
 * 2. Runtime-Safe: Uses Reflect.get with the real instance to avoid Private Field (#state) errors.
 * 3. Performant: Lazy initializes exacty once on the first access.
 */

let _prisma: PrismaClient | null = null;
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getPrisma = (): PrismaClient => {
  if (!_prisma) {
    if (globalForPrisma.prisma) {
      _prisma = globalForPrisma.prisma;
    } else {
      _prisma = new PrismaClient();
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = _prisma;
      }
    }
  }
  return _prisma;
};

// We create the Lazy Proxy
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    // ⚔️ Guard against premature triggers from framework/dev-tools
    if (
      prop === "toJSON" ||
      prop === "then" ||
      prop === "$$typeof" ||
      typeof prop === "symbol"
    ) {
      return undefined;
    }

    const client = getPrisma();
    
    // 🛡️ Critical Fix for Prisma 7 Private Members (#state)
    // We get the property from the real client, and we tell JS that the 
    // 'this' context (receiver) is the REAL CLIENT, not the Proxy.
    const value = Reflect.get(client, prop, client);
    
    if (typeof value === "function") {
      return value.bind(client);
    }
    
    return value;
  },
});

export default prisma;