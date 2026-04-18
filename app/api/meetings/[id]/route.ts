import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// Get meeting details and its availabilities
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const scheduleId = parseInt(id);
        if (isNaN(scheduleId)) {
            return NextResponse.json({ error: "Invalid schedule ID" }, { status: 400 });
        }

        const meeting = await getDB().meetingSchedule.findUnique({
            where: { id: scheduleId },
            include: {
                availabilities: {
                    include: { user: { select: { id: true, name: true, image: true } } }
                },
                startedBy: { select: { id: true, name: true, image: true } },
                group: {
                    select: {
                        id: true,
                        name: true,
                        members: {
                            include: { user: { select: { id: true, name: true, image: true } } }
                        }
                    }
                },
            },
        });

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        return NextResponse.json(meeting);
    } catch (error) {
        console.error("Error fetching meeting:", error);
        return NextResponse.json(
            { error: "Failed to fetch meeting details" },
            { status: 500 }
        );
    }
}

// Update or set availabilities for a user
export async function POST(
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

        const { id } = await params;
        const scheduleId = parseInt(id);
        if (isNaN(scheduleId)) {
            return NextResponse.json({ error: "Invalid schedule ID" }, { status: 400 });
        }

        const data = await request.json();
        const { availabilities } = data;
        const userId = session.user.id;

        if (!Array.isArray(availabilities)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const results = [];
        for (const slot of availabilities) {
            const result = await getDB().meetingAvailability.upsert({
                where: {
                    scheduleId_userId_date_timeSlot: {
                        scheduleId,
                        userId,
                        date: new Date(slot.date),
                        timeSlot: slot.timeSlot
                    }
                },
                update: { status: slot.status },
                create: {
                    scheduleId,
                    userId,
                    date: new Date(slot.date),
                    timeSlot: slot.timeSlot,
                    status: slot.status
                }
            });
            results.push(result);
        }

        return NextResponse.json({ message: "Availabilities updated", count: results.length });
    } catch (error) {
        console.error("Error updating availabilities:", error);
        return NextResponse.json(
            { error: "Failed to update availabilities" },
            { status: 500 }
        );
    }
}

// PUT — Update meeting details (any group member or creator)
export async function PUT(
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

        const { id } = await params;
        const scheduleId = parseInt(id);
        if (isNaN(scheduleId)) {
            return NextResponse.json({ error: "Invalid schedule ID" }, { status: 400 });
        }

        const meeting = await getDB().meetingSchedule.findUnique({
            where: { id: scheduleId },
        });

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        // Check access: creator or group member
        let hasAccess = meeting.startedById === session.user.id;
        if (!hasAccess && meeting.groupId) {
            const membership = await getDB().groupMember.findUnique({
                where: { userId_groupId: { userId: session.user.id, groupId: meeting.groupId } },
            });
            hasAccess = !!membership;
        }

        if (!hasAccess) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const data = await request.json();
        const updateData: any = {};
        if (data.meetingName !== undefined) updateData.meetingName = data.meetingName;
        if (data.meetingDescription !== undefined) updateData.meetingDescription = data.meetingDescription;
        if (data.startDate) updateData.startDate = new Date(data.startDate);
        if (data.endDate) updateData.endDate = new Date(data.endDate);
        if (data.startTime) updateData.startTime = data.startTime;
        if (data.endTime) updateData.endTime = data.endTime;

        const updated = await getDB().meetingSchedule.update({
            where: { id: scheduleId },
            data: updateData,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating meeting:", error);
        return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 });
    }
}

// DELETE — Delete a meeting (any group member or creator)
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

        const { id } = await params;
        const scheduleId = parseInt(id);
        if (isNaN(scheduleId)) {
            return NextResponse.json({ error: "Invalid schedule ID" }, { status: 400 });
        }

        const meeting = await getDB().meetingSchedule.findUnique({
            where: { id: scheduleId },
        });

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        let hasAccess = meeting.startedById === session.user.id;
        if (!hasAccess && meeting.groupId) {
            const membership = await getDB().groupMember.findUnique({
                where: { userId_groupId: { userId: session.user.id, groupId: meeting.groupId } },
            });
            hasAccess = !!membership;
        }

        if (!hasAccess) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        await getDB().meetingSchedule.delete({ where: { id: scheduleId } });

        return NextResponse.json({ message: "Meeting deleted" });
    } catch (error) {
        console.error("Error deleting meeting:", error);
        return NextResponse.json({ error: "Failed to delete meeting" }, { status: 500 });
    }
}
