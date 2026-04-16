import { PrismaClient } from "../prisma/generated/client";

/**
 * 🛰️ Definitive Loop-Breaker: Lazy Prisma Proxy
 * This implementation prevents Prisma from initializing during the build phase.
 * It only calls `new PrismaClient()` at runtime, when a property (like .user) is first accessed.
 */

let _prisma: PrismaClient | null = null;

const getPrisma = () => {
  if (!_prisma) {
    _prisma = new PrismaClient();
  }
  return _prisma;
};

// We export a Proxy that behaves exactly like PrismaClient
// but doesn't exist until it's actually used.
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    if (prop === "undefined" || prop === "$$typeof") return undefined;
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;