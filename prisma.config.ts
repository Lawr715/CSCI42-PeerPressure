import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * 🏛️ Prisma 7 Central Configuration (RESILIENT VERSION 2)
 * We use process.env directly instead of the strict env() helper.
 * This ensures that if DIRECT_URL is missing in GitHub Actions, 
 * the build doesn't crash and correctly falls back to DATABASE_URL.
 */

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // 🛡️ THE FAILSAFE: Use process.env to avoid strict 'Cannot resolve' errors
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
