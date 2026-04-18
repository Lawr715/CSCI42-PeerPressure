import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// Create a new meeting schedule
export async function POST(request: Request) {
    try {
        const session = await getAuth().api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        if (!data.meetingName || !data.startDate || !data.endDate) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // If groupId provided, verify membership
        if (data.groupId) {
            const membership = await getDB().groupMember.findUnique({
                where: {
                    userId_groupId: {
                        userId: session.user.id,
                        groupId: data.groupId,
                    },
                },
            });

            if (!membership) {
                return NextResponse.json({ error: "You are not a member of this group" }, { status: 403 });
            }
        }

        const meeting = await getDB().meetingSchedule.create({
            data: {
                meetingName: data.meetingName,
                meetingDescription: data.meetingDescription,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                startTime: data.startTime || "09:00:00",
                endTime: data.endTime || "17:00:00",
                startedById: session.user.id, // Use authenticated user, not hardcoded
                ...(data.taskId ? { taskId: parseInt(data.taskId) } : {}),
                ...(data.groupId ? { groupId: data.groupId } : {}),
            },
        });

        return NextResponse.json(meeting, { status: 201 });
    } catch (error) {
        console.error("Error creating meeting:", error);
        return NextResponse.json(
            { error: "Failed to create meeting" },
            { status: 500 }
        );
    }
}

// Get all meetings for the current user (personal + group)
export async function GET() {
    try {
        const session = await getAuth().api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = getDB();
        const userId = session.user.id;

        // Get user's group IDs
        const memberships = await db.groupMember.findMany({
            where: { userId },
            select: { groupId: true },
        });
        const groupIds = memberships.map((m: any) => m.groupId);

        const meetings = await db.meetingSchedule.findMany({
            where: {
                OR: [
                    { startedById: userId, groupId: null },
                    ...(groupIds.length > 0 ? [{ groupId: { in: groupIds } }] : []),
                ],
            },
            include: {
                startedBy: { select: { id: true, name: true, image: true } },
                group: { select: { id: true, name: true } },
            },
            orderBy: { startDate: "asc" },
        });

        return NextResponse.json(meetings);
    } catch (error) {
        console.error("Error fetching meetings:", error);
        return NextResponse.json(
            { error: "Failed to fetch meetings" },
            { status: 500 }
        );
    }
}
