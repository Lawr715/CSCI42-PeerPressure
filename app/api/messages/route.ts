import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// POST — Send a message (group chat or DM)
export async function POST(request: Request) {
    try {
        const session = await getAuth().api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { content, groupId, recipientId } = body;

        if (!content || typeof content !== "string" || content.trim().length === 0) {
            return NextResponse.json({ error: "Message content is required" }, { status: 400 });
        }

        if (!groupId) {
            return NextResponse.json({ error: "Group context is required" }, { status: 400 });
        }

        const db = getDB();

        // Verify sender is a member of the group
        const membership = await db.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: session.user.id,
                    groupId: groupId,
                },
            },
        });

        if (!membership) {
            return NextResponse.json({ error: "You are not a member of this group" }, { status: 403 });
        }

        // If DM, verify recipient is also in the group
        if (recipientId) {
            const recipientMembership = await db.groupMember.findUnique({
                where: {
                    userId_groupId: {
                        userId: recipientId,
                        groupId: groupId,
                    },
                },
            });

            if (!recipientMembership) {
                return NextResponse.json({ error: "Recipient is not in this group" }, { status: 400 });
            }
        }

        const message = await db.message.create({
            data: {
                content: content.trim(),
                senderId: session.user.id,
                groupId,
                recipientId: recipientId || null,
            },
            include: {
                sender: { select: { id: true, name: true, image: true } },
            },
        });

        return NextResponse.json(message, { status: 201 });
    } catch (error: any) {
        console.error("Error sending message:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}

// GET — Fetch messages for a group chat or DM
export async function GET(request: Request) {
    try {
        const session = await getAuth().api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get("groupId");
        const recipientId = searchParams.get("recipientId");
        const before = searchParams.get("before"); // pagination cursor
        const limit = parseInt(searchParams.get("limit") || "50");

        if (!groupId) {
            return NextResponse.json({ error: "groupId is required" }, { status: 400 });
        }

        const db = getDB();

        // Build where clause
        const where: any = { groupId };

        if (recipientId) {
            // DM: messages between current user and recipient in this group context
            where.OR = [
                { senderId: session.user.id, recipientId: recipientId },
                { senderId: recipientId, recipientId: session.user.id },
            ];
        } else {
            // Group chat: messages with no recipient
            where.recipientId = null;
        }

        if (before) {
            where.createdAt = { lt: new Date(before) };
        }

        const messages = await db.message.findMany({
            where,
            include: {
                sender: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        // Return in chronological order
        return NextResponse.json(messages.reverse());
    } catch (error: any) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}
