import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Do NOT pass any objects (no datasources, no datasourceUrl)
// Prisma 7 will read from prisma.config.ts automatically
const prisma = new PrismaClient({
  accelerateUrl: process.env.PRISMA_DATABASE_URL, 
}).$extends(withAccelerate());
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
        }
    }

});