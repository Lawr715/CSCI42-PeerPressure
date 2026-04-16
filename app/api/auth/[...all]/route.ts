import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const authHandler = toNextJsHandler(auth);

export const GET = async (req: Request) => {
    // 🛡️ Header Repair logic
    const betterAuthUrl = process.env.BETTER_AUTH_URL;
    if (betterAuthUrl) {
        const targetUrl = new URL(betterAuthUrl);
        // We Use the Headers constructor to create a mutable copy
        const headers = new Headers(req.headers);
        headers.set("x-forwarded-host", targetUrl.host);
        headers.set("x-forwarded-proto", targetUrl.protocol.replace(":", ""));
        
        // Clone the request with the new headers
        const patchedReq = new Request(req, { headers });
        return await authHandler.GET(patchedReq);
    }
    return await authHandler.GET(req);
};

export const POST = async (req: Request) => {
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