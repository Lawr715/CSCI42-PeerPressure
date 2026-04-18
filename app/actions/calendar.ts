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
        const localMeetings = await db.meetingSchedule.findMany({
            where: {
                OR: [
                    { startedById: userId as any },
                    // In a real app, you'd check attendees table too
                ]
            }
        });

        const mappedMeetings = localMeetings.map((m: any) => ({
            id: `meeting-${m.id}`,
            title: `🤝 ${m.meetingName}`,
            start: `${new Date(m.startDate).toISOString().split('T')[0]}T${m.startTime}`,
            end: `${new Date(m.endDate).toISOString().split('T')[0]}T${m.endTime}`,
            allDay: false,
            color: "#1E3A8A", // Deep Blue for local meetings
        }));
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

        tasksWithDeadlines.forEach(task => {
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