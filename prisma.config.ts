import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * 🛠️ Prisma 7 Central Configuration
 * url: Pointed to DIRECT_URL for CLI operations (db push, migrate)
 * schema: Path to your current schema file
 */

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // ⚔️ The Shield: Use DIRECT_URL for CLI commands to bypass pooling restrictions
    url: env("DIRECT_URL"),
  },
});
