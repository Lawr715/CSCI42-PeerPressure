import { PrismaClient } from "../prisma/generated/client";
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg';

const pool = process.env.DATABASE_URL 
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL })
  : null;

const adapter = pool ? new PrismaPg(pool) : null;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  (adapter 
    ? new PrismaClient({ adapter })
    : ({} as PrismaClient)); // Fallback during build phase

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;