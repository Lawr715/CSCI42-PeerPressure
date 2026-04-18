import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// DELETE — Kick a member (owner only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; memberId: string }> }
) {
    try {
        const session = await getAuth().api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: groupId, memberId } = await params;
        const db = getDB();

        // Verify the requester is the group owner
        const group = await db.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        if (group.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Only the group owner can kick members" }, { status: 403 });
        }

        // Cannot kick yourself (use leave instead)
        if (memberId === session.user.id) {
            return NextResponse.json({ error: "Cannot kick yourself. Use leave group instead." }, { status: 400 });
        }

        // Remove the member
        await db.groupMember.deleteMany({
            where: {
                userId: memberId,
                groupId: groupId,
            },
        });

        return NextResponse.json({ message: "Member removed" });
    } catch (error: any) {
        console.error("Error kicking member:", error);
        return NextResponse.json({ error: "Failed to kick member" }, { status: 500 });
    }
}
