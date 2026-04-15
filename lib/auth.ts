import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../prisma/generated/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";

// Do NOT pass any objects (no datasources, no datasourceUrl)
// Prisma 7 will read from prisma.config.ts automatically
// Build-safe initialization: Only create the pool/adapter if DATABASE_URL is present
const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

const adapter = pool ? new PrismaPg(pool) : null;

let prisma: any;

if (adapter) {
    // Standard connection (works for both local and Neon/Production)
    prisma = new PrismaClient({ adapter });
} else {
    // Fallback: This allows the build to finish even without a DB connection string
    prisma = {} as any;
}
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [
        "https://csci-42-peer-pressure-atm4.vercel.app"
    ],
    emailAndPassword: { 
        enabled: true 
    },
    // --- ADDED GOOGLE PROVIDER BELOW ---
    /*
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            scope: [
                "openid",
                "profile",
                "email",
                "https://www.googleapis.com/auth/calendar.readonly" 
            ],
            accessType: "offline", 
            prompt: "consent",
        }
    },
    */

});