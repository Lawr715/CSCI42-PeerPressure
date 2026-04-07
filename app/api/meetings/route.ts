import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Create a new meeting schedule
export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Basic validation
        if (!data.meetingName || !data.startDate || !data.endDate || !data.startedById) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const meeting = await prisma.meetingSchedule.create({
            data: {
                meetingName: data.meetingName,
                meetingDescription: data.meetingDescription,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                startTime: data.startTime || "09:00:00",
                endTime: data.endTime || "17:00:00",
                startedById: data.startedById, // Needs an actual User ID from session in production
                ...(data.taskId ? { taskId: parseInt(data.taskId) } : {})
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

// Get all meetings (optional utility)
export async function GET() {
    try {
        const meetings = await prisma.meetingSchedule.findMany({
            orderBy: { startDate: "asc" },
        });
        return NextResponse.json(meetings);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch meetings" },
            { status: 500 }
        );
    }
}
