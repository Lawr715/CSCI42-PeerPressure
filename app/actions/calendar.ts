"use server";

import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { getDB } from "@/lib/prisma";

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end?: string;
    allDay: boolean;
    color: string;
}

export async function getCalendarEvents() {
    const session = await getAuth().api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;
    const db = getDB();
    const allEvents: CalendarEvent[] = [];

    // --- 1. Attempt to Fetch Google Events ---
    try {
        const account = await db.account.findFirst({
            where: { userId: userId, providerId: "google" },
        });

        if (account?.accessToken) {
            const now = new Date().toISOString();
            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&orderBy=startTime&singleEvents=true&maxResults=20`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${account.accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                const googleEvents = data.items.map((event: any) => ({
                    id: `google-${event.id}`,
                    title: `🌐 ${event.summary}`,
                    start: event.start.dateTime || event.start.date,
                    end: event.end.dateTime || event.end.date,
                    allDay: !event.start.dateTime,
                    color: "#3B82F6", // Subtle Navy for Google
                }));
                allEvents.push(...googleEvents);
            }
        }
    } catch (error) {
        console.error("Google Calendar API skip (Not connected or error):", error);
    }

    // --- 2. Fetch Local Meetings ---
    try {
        // Get group IDs user belongs to
        const memberships = await db.groupMember.findMany({
            where: { userId },
            select: { groupId: true }
        });
        const groupIds = memberships.map((m: { groupId: string | null }) => m.groupId).filter((id: string | null): id is string => id !== null);

        const localMeetings = await db.meetingSchedule.findMany({
            where: {
                OR: [
                    { startedById: userId as any },
                    { groupId: { in: groupIds } }
                ]
            },
            include: {
                group: { select: { name: true } }
            }
        });

        const mappedMeetings = localMeetings.map((m: any) => {
            let start = "";
            let end = "";
            let title = `🤝 ${m.meetingName}`;

            if (m.isFinalized && m.finalDate && m.finalTimeSlot) {
                const dateStr = new Date(m.finalDate).toISOString().split('T')[0];
                const timePart = m.finalTimeSlot; // e.g., "09:00" or "09:00 – 10:30"
                
                if (timePart.includes(" – ")) {
                    const [s, e] = timePart.split(" – ");
                    start = `${dateStr}T${s}:00`;
                    end = `${dateStr}T${e}:00`;
                } else {
                    start = `${dateStr}T${timePart}:00`;
                    // Default 30 min duration if only start time is stored and not a range
                    const [h, min] = timePart.split(":");
                    const endD = new Date(`1970-01-01T${timePart}:00`);
                    endD.setMinutes(endD.getMinutes() + 30);
                    end = `${dateStr}T${endD.toTimeString().slice(0, 5)}:00`;
                }
                title = `✅ ${m.meetingName}${m.group ? ` (${m.group.name})` : ''}`;
            } else {
                // For non-finalized, show the range as proposed if wanted, or just the window
                // User said "set locked meetings", so maybe we show finalized ones prominent
                // Let's at least handle the basic fields for ongoing polls
                start = `${new Date(m.startDate).toISOString().split('T')[0]}T${m.startTime}`;
                end = `${new Date(m.endDate).toISOString().split('T')[0]}T${m.endTime}`;
                title = `🗳️ Poll: ${m.meetingName}`;
            }

            return {
                id: `meeting-${m.id}`,
                title,
                start,
                end,
                allDay: false,
                color: m.isFinalized ? "#059669" : "#1E3A8A", // Emerald for finalized, Navy for Polls
            };
        });
        allEvents.push(...mappedMeetings);
    } catch (error) {
        console.error("Local Meetings fetch error:", error);
    }

    // --- 3. Fetch Task Deadlines ---
    try {
        const tasksWithDeadlines = await db.task.findMany({
            where: {
                assignedUsers: {
                    some: { id: userId }
                }
            }
        });

        tasksWithDeadlines.forEach((task: any) => {
            if (task.hardDeadline) {
                allEvents.push({
                    id: `task-hard-${task.id}`,
                    title: `🚨 HARD: ${task.taskName}`,
                    start: task.hardDeadline,
                    allDay: true,
                    color: "#780000", // Deep Red for Hard Deadlines
                });
            }
            if (task.softDeadline) {
                allEvents.push({
                    id: `task-soft-${task.id}`,
                    title: `📅 SOFT: ${task.taskName}`,
                    start: task.softDeadline,
                    allDay: true,
                    color: "#D2691E", // Ochre for Soft Deadlines
                });
            }
        });
    } catch (error) {
        console.error("Tasks fetch error:", error);
    }

    return allEvents;
}