import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateWeeklySummary } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const session = await getAuth().api.getSession({
            headers: await headers()
        });

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const userName = session.user.name;

        const today = new Date();
        const currentDayOfWeek = today.getDay();

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - currentDayOfWeek));
        endOfWeek.setHours(23, 59, 59, 999);

        const user = await getDB().user.findUnique({
            where: { id: userId },
            select: { loginStreak: true }
        });

        // 1. Fetch Completed Tasks (Rich Data)
        const completedTasks = await getDB().task.findMany({
            where: {
                assignedUsers: { some: { id: userId } },
                status: "DONE",
                interactions: {
                    some: {
                        interactionType: "COMPLETE",
                        timestamp: { gte: startOfWeek, lte: endOfWeek }
                    }
                }
            },
            select: { taskName: true, taskDescription: true }
        });

        // 2. Fetch Delayed Tasks
        const delayedTasks = await getDB().task.findMany({
            where: {
                assignedUsers: { some: { id: userId } },
                status: { not: "DONE" },
                hardDeadline: { lt: new Date() }
            },
            select: { taskName: true, hardDeadline: true }
        });

        // 3. Fetch Pomodoro Windows
        const pomodoros = await getDB().pomodoroInteraction.findMany({
            where: {
                userId: userId,
                createdAt: { gte: startOfWeek, lte: endOfWeek }
            },
            select: { createdAt: true }
        });

        // 4. Fetch Peer Meetings
        const meetings = await getDB().meetingSchedule.findMany({
            where: {
                OR: [
                    { startedById: userId },
                    { availabilities: { some: { userId } } }
                ],
                startDate: { gte: startOfWeek, lte: endOfWeek }
            },
            select: { meetingName: true }
        });

        // Time Analysis
        let morning = 0, afternoon = 0, evening = 0;
        pomodoros.forEach((p: any) => {
            const hour = p.createdAt.getHours();
            if (hour >= 5 && hour < 12) morning++;
            else if (hour >= 12 && hour < 17) afternoon++;
            else evening++;
        });

        let commonTime = "Undetermined";
        if (morning > afternoon && morning > evening) commonTime = "Morning";
        if (afternoon > morning && afternoon > evening) commonTime = "Afternoon";
        if (evening > morning && evening > afternoon) commonTime = "Evening";

        // AI SYNTHESIS
        const aiReport = await generateWeeklySummary({
            userId,
            userName,
            completedTasks,
            delayedTasks,
            focusTime: commonTime,
            meetings
        });

        return NextResponse.json({
            streak: user?.loginStreak || 0,
            completedTasks,
            delayedTasks,
            commonTime,
            ...aiReport
        });
    } catch (error) {
        console.error("Error generating weekly report:", error);
        return NextResponse.json({
            error: "Failed to generate weekly report"
        }, { status: 500 });
    }
}
