import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

        const meeting = await prisma.meetingSchedule.findUnique({
            where: { id: scheduleId },
            include: {
                availabilities: {
                    include: { user: true }
                },
                startedBy: true
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
        const { id } = await params;
        const scheduleId = parseInt(id);
        if (isNaN(scheduleId)) {
            return NextResponse.json({ error: "Invalid schedule ID" }, { status: 400 });
        }

        const data = await request.json();
        const { userId, availabilities } = data;
        // availabilities expecting: { date: string, timeSlot: string, status: string }[]

        if (!userId || !Array.isArray(availabilities)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // A simple way is to upsert each availability slot
        const results = [];
        for (const slot of availabilities) {
            const result = await prisma.meetingAvailability.upsert({
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
