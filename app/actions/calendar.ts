"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getCalendarEvents() {
    // Validate the session
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // Fetch the Google Access Token from your database
    // Better Auth stores this in the 'account' table
    const account = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            providerId: "google",
        },
    });

    if (!account || !account.accessToken) {
        throw new Error("Google account not connected or token missing");
    }

    // Call the Google Calendar API
    // fetch events from now until the end of the day (or 10 results)
    const now = new Date().toISOString();
    
    try {
        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&orderBy=startTime&singleEvents=true&maxResults=10`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${account.accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Google API Error:", errorData);
            throw new Error("Failed to fetch calendar data");
        }

        const data = await response.json();
        
        // Return only the necessary data to the client
        return data.items.map((event: any) => {
        const isAllDay = !event.start.dateTime;
        
        return {
            id: event.id,
            title: event.summary,
            // For All Day: "2026-03-12"
            // For Timed: "2026-03-12T10:00:00Z"
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            allDay: isAllDay, 
            };
        });
    } catch (error) {
        console.error("Calendar Action Error:", error);
        throw error;
    }
}