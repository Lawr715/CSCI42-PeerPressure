import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getDB } from "./prisma";

/**
 * 🏛️ "Zero-Ambient" Lazy Auth Provider (VERSION 2 - ORIGIN_BRIDGE)
 * Added advanced.trustHost: true to support dynamic Vercel preview origins.
 */

let _auth: any = null;

export function getAuth() {
    if (!_auth) {
        _auth = betterAuth({
            database: prismaAdapter(getDB(), {
                provider: "postgresql",
            }),
            secret: process.env.BETTER_AUTH_SECRET,
            baseURL: process.env.BETTER_AUTH_URL,
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
            },
            // 🚀 The Origin Bridge: Trust headers from Vercel's proxy
            advanced: {
                trustHost: true
            }
        });
    }
    return _auth;
}