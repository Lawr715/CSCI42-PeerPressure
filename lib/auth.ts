import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../prisma/generated/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";

// Do NOT pass any objects (no datasources, no datasourceUrl)
// Prisma 7 will read from prisma.config.ts automatically
let prisma;

if (process.env.NODE_ENV === "development") {
    // Local Development: Use Postgres adapter directly.
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
} else {
    // Production/Deployed: Use Prisma Accelerate
    prisma = new PrismaClient({
        accelerateUrl: process.env.PRISMA_DATABASE_URL
    }).$extends(withAccelerate());
}
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: { 
        enabled: true 
    },
    // --- ADDED GOOGLE PROVIDER BELOW ---
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
    }

});