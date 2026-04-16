import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";

/**
 * 🏛️ THE COMPLETE "WEB-PUSH" INITIALIZER
 * Visit this route one last time to create ALL application tables.
 */

export async function GET() {
  const db = getDB();
  
  try {
    console.log("[SETUP] Starting full table initialization...");

    // 1. Auth Tables
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "user" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT, "email" TEXT NOT NULL UNIQUE, "emailVerified" BOOLEAN NOT NULL, "image" TEXT, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL);`);
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "session" ("id" TEXT NOT NULL PRIMARY KEY, "expiresAt" TIMESTAMP NOT NULL, "token" TEXT NOT NULL UNIQUE, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, "ipAddress" TEXT, "userAgent" TEXT, "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE);`);
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "account" ("id" TEXT NOT NULL PRIMARY KEY, "accountId" TEXT NOT NULL, "providerId" TEXT NOT NULL, "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE, "accessToken" TEXT, "refreshToken" TEXT, "idToken" TEXT, "accessTokenExpiresAt" TIMESTAMP, "refreshTokenExpiresAt" TIMESTAMP, "scope" TEXT, "password" TEXT, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL);`);
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "verification" ("id" TEXT NOT NULL PRIMARY KEY, "identifier" TEXT NOT NULL, "value" TEXT NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP, "updatedAt" TIMESTAMP);`);
    
    // 2. Pomodoro Tables
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "PomodoroInteraction" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "duration" INTEGER NOT NULL, "taskName" TEXT);`);
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "PomodoroSettings" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE, "focusTime" INTEGER NOT NULL DEFAULT 25, "shortBreak" INTEGER NOT NULL DEFAULT 5, "longBreak" INTEGER NOT NULL DEFAULT 15, "rounds" INTEGER NOT NULL DEFAULT 4, "autoStart" BOOLEAN NOT NULL DEFAULT false);`);
    
    // 3. App Feature Tables
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Task" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT, "priority" TEXT NOT NULL DEFAULT 'medium', "category" TEXT NOT NULL DEFAULT 'work', "status" TEXT NOT NULL DEFAULT 'todo', "dueDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL);`);
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Category" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "name" TEXT NOT NULL, "color" TEXT NOT NULL DEFAULT '#3B82F6');`);
    
    // 4. Meeting Tables
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Meeting" ("id" TEXT NOT NULL PRIMARY KEY, "title" TEXT NOT NULL, "date" TIMESTAMP NOT NULL, "startTime" TEXT NOT NULL, "endTime" TEXT NOT NULL, "organizerId" TEXT NOT NULL);`);
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Participant" ("id" TEXT NOT NULL PRIMARY KEY, "meetingId" TEXT NOT NULL REFERENCES "Meeting"("id") ON DELETE CASCADE, "email" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING');`);
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Availability" ("id" TEXT NOT NULL PRIMARY KEY, "meetingId" TEXT NOT NULL REFERENCES "Meeting"("id") ON DELETE CASCADE, "email" TEXT NOT NULL, "slots" TEXT NOT NULL);`);

    return NextResponse.json({ 
      success: true, 
      message: "FULL application database initialized. You are officially ready to go!" 
    });
  } catch (error: any) {
    console.error("[SETUP_FAIL]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
