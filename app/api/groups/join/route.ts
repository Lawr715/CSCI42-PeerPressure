import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// POST — Join a group by code
export async function POST(request: Request) {
    try {
        const session = await getAuth().api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { joinCode } = body;

        if (!joinCode || typeof joinCode !== "string") {
            return NextResponse.json({ error: "Join code is required" }, { status: 400 });
        }

        const db = getDB();
        const code = joinCode.trim().toUpperCase();

        // Find the group by join code
        const group = await db.group.findUnique({
            where: { joinCode: code },
            include: {
                members: { include: { user: { select: { id: true, name: true } } } },
                owner: { select: { id: true, name: true } },
            },
        });

        if (!group) {
            return NextResponse.json({ error: "Invalid join code. No group found." }, { status: 404 });
        }

        // Check if user is already a member
        const existingMember = group.members.find((m: any) => m.userId === session.user.id);
        if (existingMember) {
            return NextResponse.json({ error: "You are already a member of this group." }, { status: 409 });
        }

        // Add user to the group
        await db.groupMember.create({
            data: {
                userId: session.user.id,
                groupId: group.id,
            },
        });

        // Fetch the updated group
        const updatedGroup = await db.group.findUnique({
            where: { id: group.id },
            include: {
                members: { include: { user: { select: { id: true, name: true, image: true } } } },
                owner: { select: { id: true, name: true, image: true } },
            },
        });

        return NextResponse.json(updatedGroup);
    } catch (error: any) {
        console.error("Error joining group:", error);
        return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
    }
}
