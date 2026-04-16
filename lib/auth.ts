import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

/**
 * Better-Auth Configuration - Prisma Postgres Edition
 * We use the shared prisma instance which is already configured for the 
 * native prisma+postgres:// protocol.
 */
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: { 
        enabled: true 
    },
    // --- SOCIAL PROVIDERS ---
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

});