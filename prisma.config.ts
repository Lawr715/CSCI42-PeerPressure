import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * 🛠️ Prisma 7 Central Configuration (RESILIENT VERSION)
 * We use a fallback logic: If DIRECT_URL is missing, we use DATABASE_URL.
 * This prevents the 'PrismaConfigEnvError' from crashing the Vercel build.
 */

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // 🛡️ THE FAILSAFE: Try DIRECT_URL first (for migrations), 
    // fall back to DATABASE_URL if Vercel variable is missing.
    url: env("DIRECT_URL") || env("DATABASE_URL"),
  },
});
