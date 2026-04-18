import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meetingId = parseInt(id, 10);
    if (isNaN(meetingId)) return NextResponse.json({ error: "Invalid meeting ID" }, { status: 400 });

    const session = await getAuth().api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDB();
    const meeting = await db.meetingSchedule.findUnique({
      where: { id: meetingId },
      include: { group: true }
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const isCreator = meeting.startedById === session.user.id;
    const isGroupOwner = meeting.group?.ownerId === session.user.id;

    if (!isCreator && !isGroupOwner) {
      return NextResponse.json({ error: "Forbidden. Only the creator or group owner can finalize." }, { status: 403 });
    }

    const { finalDate, finalTimeSlot } = await request.json();

    const updated = await db.meetingSchedule.update({
      where: { id: meetingId },
      data: {
        isFinalized: true,
        finalDate: finalDate ? new Date(finalDate) : null,
        finalTimeSlot,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error finalizing meeting:", error);
    return NextResponse.json({ error: "Failed to finalize meeting" }, { status: 500 });
  }
}
