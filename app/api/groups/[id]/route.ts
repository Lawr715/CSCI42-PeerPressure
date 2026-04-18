import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET — Get group details
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getAuth().api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: groupId } = await params;
        const db = getDB();

        const group = await db.group.findUnique({
            where: { id: groupId },
            include: {
                owner: { select: { id: true, name: true, email: true, image: true } },
                members: {
                    include: {
                        user: { select: { id: true, name: true, email: true, image: true } },
                    },
                    orderBy: { joinedAt: "asc" },
                },
            },
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        // Verify user is a member
        const isMember = group.members.some((m: any) => m.userId === session.user.id);
        if (!isMember) {
            return NextResponse.json({ error: "You are not a member of this group" }, { status: 403 });
        }

        return NextResponse.json(group);
    } catch (error: any) {
        console.error("Error fetching group:", error);
        return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 });
    }
}

// DELETE — Leave group (or delete if owner)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getAuth().api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: groupId } = await params;
        const db = getDB();

        const group = await db.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        // If the user is the owner, delete the entire group
        if (group.ownerId === session.user.id) {
            await db.group.delete({ where: { id: groupId } });
            return NextResponse.json({ message: "Group deleted" });
        }

        // Otherwise, just remove the user's membership
        await db.groupMember.deleteMany({
            where: {
                userId: session.user.id,
                groupId: groupId,
            },
        });

        return NextResponse.json({ message: "Left group successfully" });
    } catch (error: any) {
        console.error("Error leaving group:", error);
        return NextResponse.json({ error: "Failed to leave group" }, { status: 500 });
    }
}
