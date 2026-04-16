import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getDB } from "./prisma";

/**
 * 🏛️ "Zero-Ambient" Lazy Auth Provider (VERSION 3 - DYNAMIC_ORIGIN)
 * 1. Removed invalid 'trustHost' property.
 * 2. Implemented dynamic baseURL detection for Vercel Preview environments.
 */

let _auth: any = null;

export function getAuth() {
    if (!_auth) {
        // 🚀 DYNAMIC BASE URL:
        // Priority: Explicit ENV -> Vercel Deployment URL -> undefined (infer)
        const baseURL = process.env.BETTER_AUTH_URL || 
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

        _auth = betterAuth({
            database: prismaAdapter(getDB(), {
                provider: "postgresql",
            }),
            trustedOrigins: [
                "https://csci-42-peer-pressure-phi.vercel.app",
            ],
            secret: process.env.BETTER_AUTH_SECRET,
            baseURL: baseURL,
            emailAndPassword: { 
                enabled: true 
            },
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
    }
    return _auth;
}