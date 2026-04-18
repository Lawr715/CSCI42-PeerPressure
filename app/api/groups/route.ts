import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// Generate a random 6-character uppercase join code
function generateJoinCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I/O/0/1 to avoid confusion
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// POST — Create a new group
export async function POST(request: Request) {
    try {
        const session = await getAuth().api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name } = body;

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json({ error: "Group name is required" }, { status: 400 });
        }

        const db = getDB();

        // Generate a unique join code (retry if collision)
        let joinCode = generateJoinCode();
        let attempts = 0;
        while (attempts < 10) {
            const existing = await db.group.findUnique({ where: { joinCode } });
            if (!existing) break;
            joinCode = generateJoinCode();
            attempts++;
        }

        // Create the group and add the creator as a member in one transaction
        const group = await db.group.create({
            data: {
                name: name.trim(),
                joinCode,
                ownerId: session.user.id,
                members: {
                    create: {
                        userId: session.user.id,
                    },
                },
            },
            include: {
                members: { include: { user: true } },
                owner: true,
            },
        });

        return NextResponse.json(group, { status: 201 });
    } catch (error: any) {
        console.error("Error creating group:", error);
        return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }
}

// GET — List all groups the current user belongs to
export async function GET() {
    try {
        const session = await getAuth().api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = getDB();

        const memberships = await db.groupMember.findMany({
            where: { userId: session.user.id },
            include: {
                group: {
                    include: {
                        owner: { select: { id: true, name: true, image: true } },
                        members: {
                            include: {
                                user: { select: { id: true, name: true, image: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { joinedAt: "desc" },
        });

        const groups = memberships.map((m: any) => m.group);

        return NextResponse.json(groups);
    } catch (error: any) {
        console.error("Error fetching groups:", error);
        return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
    }
}
