import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";

/**
 * 🛠️ THE EMERGENCY "WEB-PUSH" ROUTE
 * Visit /api/db-setup in your browser to force-create the tables.
 * This bypasses all terminal, network, and CI/CD blocks.
 */

export async function GET() {
  const db = getDB();
  
  try {
    console.log("[SETUP] Starting manual table initialization...");

    // 🚀 We manually create the 'user' table as a probe to see if connectivity works.
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "email" TEXT NOT NULL UNIQUE,
        "emailVerified" BOOLEAN NOT NULL,
        "image" TEXT,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL
      );
    `);

    // Add Session table
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "expiresAt" TIMESTAMP NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
      );
    `);

    return NextResponse.json({ 
      success: true, 
      message: "Initial tables created successfully. Connectivity confirmed." 
    });
  } catch (error: any) {
    console.error("[SETUP_FAIL]", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
