import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

export const GET = async (req: NextRequest) => {
    return await handleAuth(req);
};

export const POST = async (req: NextRequest) => {
    return await handleAuth(req);
};

async function handleAuth(req: NextRequest) {
    // 🛡️ High-Precision Origin Fix
    // We clone the request and ensure headers match the BETTER_AUTH_URL
    // This solves the "Invalid origin" issue by aligning the proxy headers.
    const url = new URL(req.url);
    const betterAuthUrl = process.env.BETTER_AUTH_URL;

    if (betterAuthUrl) {
        const targetUrl = new URL(betterAuthUrl);
        // Force the headers to match the public URL
        req.headers.set("x-forwarded-host", targetUrl.host);
        req.headers.set("x-forwarded-proto", targetUrl.protocol.replace(":", ""));
    }

    return await handler(req);
}