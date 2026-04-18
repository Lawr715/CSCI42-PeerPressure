import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

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

        const completedTasks = await getDB().task.findMany({
            where: {
                assignedUsers: {
                    some: { id: userId }
                },
                status: "DONE",
                interactions: {
                    some: {
                        interactionType: "COMPLETE",
                        timestamp: { gte: startOfWeek, lte: endOfWeek }
                    }
                }
            }
        });

        const delayedTasks = await getDB().task.findMany({
            where: {
                assignedUsers: {
                    some: { id: userId }
                },
                status: { not: "DONE" },
                hardDeadline: { lt: new Date() }
            }
        });

        const pomodoros = await getDB().pomodoroInteraction.findMany({
            where: {
                userId: userId,
                createdAt: { gte: startOfWeek, lte: endOfWeek }
            },
            select: { createdAt: true }
        });

        let morning = 0, afternoon = 0, evening = 0;
        pomodoros.forEach((p: any) => {
            const hour = p.createdAt.getHours();
            if (hour >= 5 && hour < 12) morning++;
            else if (hour >= 12 && hour < 17) afternoon++;
            else evening++;
        });

        let commonTime = "Not enough data";
        if (morning > afternoon && morning > evening) commonTime = "Morning";
        if (afternoon > morning && afternoon > evening) commonTime = "Afternoon";
        if (evening > morning && evening > afternoon) commonTime = "Evening";

        const suggestions = delayedTasks.length > 0
            ? `You have ${delayedTasks.length} overdue tasks. Consider dedicating your next Focus Session to the highest priority one.`
            : "Great job keeping up with your tasks! Take a break or start planning next week.";

        return NextResponse.json({
            streak: user?.loginStreak || 0,
            completedTasks,
            delayedTasks,
            commonTime,
            suggestions
        });
    } catch (error) {
        console.error("Error generating weekly report:", error);
        return NextResponse.json({
            error: "Failed to generate weekly report"
        }, { status: 500 });
    }
}
