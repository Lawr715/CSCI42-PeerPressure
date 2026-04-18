import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * 🏛️ Prisma 7 Central Configuration (VERSION 3 - UNIVERSAL_BYPASS)
 * We use a dynamic getter to prevent Prisma from validating env vars 
 * during the 'npm install' or 'prisma generate' phases.
 */

const getUrl = () => {
  // 🛡️ Fallback chain: DIRECT_URL -> DATABASE_URL -> Dummy (for build)
  return process.env.DIRECT_URL || process.env.DATABASE_URL || "postgres://localhost/dummy";
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: getUrl(),
  },
});
