import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const dynamic = "force-dynamic";

export const GET = async (req: Request) => {
    // 🚀 Lazy Handler Initialization
    // Moving this inside the function ensures zero database calls during the Vercel Build.
    const authHandler = toNextJsHandler(auth);

    const betterAuthUrl = process.env.BETTER_AUTH_URL;
    if (betterAuthUrl) {
        const targetUrl = new URL(betterAuthUrl);
        const headers = new Headers(req.headers);
        headers.set("x-forwarded-host", targetUrl.host);
        headers.set("x-forwarded-proto", targetUrl.protocol.replace(":", ""));
        
        const patchedReq = new Request(req, { headers });
        return await authHandler.GET(patchedReq);
    }
    return await authHandler.GET(req);
};

export const POST = async (req: Request) => {
    // 🚀 Lazy Handler Initialization
    const authHandler = toNextJsHandler(auth);

    const betterAuthUrl = process.env.BETTER_AUTH_URL;
    if (betterAuthUrl) {
        const targetUrl = new URL(betterAuthUrl);
        const headers = new Headers(req.headers);
        headers.set("x-forwarded-host", targetUrl.host);
        headers.set("x-forwarded-proto", targetUrl.protocol.replace(":", ""));
        
        const patchedReq = new Request(req, { headers });
        return await authHandler.POST(patchedReq);
    }
    return await authHandler.POST(req);
};