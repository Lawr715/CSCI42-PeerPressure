import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const userId = "user-1";

        const today = new Date();
        const currentDayOfWeek = today.getDay();

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - currentDayOfWeek));
        endOfWeek.setHours(23, 59, 59, 999);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { loginStreak: true }
        });

        const completedTasks = await prisma.task.findMany({
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

        const delayedTasks = await prisma.task.findMany({
            where: {
                assignedUsers: {
                    some: { id: userId }
                },
                status: { not: "DONE" },
                hardDeadline: { lt: new Date() }
            }
        });

        const pomodoros = await prisma.pomodoroInteraction.findMany({
            where: {
                userId: userId,
                createdAt: { gte: startOfWeek, lte: endOfWeek }
            },
            select: { createdAt: true }
        });

        let morning = 0, afternoon = 0, evening = 0;
        pomodoros.forEach(p => {
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
        // Fallback: return hardcoded sample data if Prisma/DB is unavailable
        console.error("Prisma unavailable, returning sample data:", error);
        return NextResponse.json({
            streak: 12,
            completedTasks: [
                { id: 1, taskName: "Finalize Brand Guidelines" },
                { id: 2, taskName: "Website UI Audit" },
                { id: 3, taskName: "Update Project README" },
                { id: 4, taskName: "Fix Login Page Styling" },
                { id: 5, taskName: "Database Schema Review" },
            ],
            delayedTasks: [
                { id: 6, taskName: "Prepare Investor Presentation", hardDeadline: "2026-03-15T00:00:00.000Z" },
                { id: 7, taskName: "API Integration Testing", hardDeadline: "2026-03-14T00:00:00.000Z" },
            ],
            commonTime: "Afternoon",
            suggestions: "You have 2 overdue tasks. Consider dedicating your next Focus Session to 'Prepare Investor Presentation' — it has the nearest deadline."
        });
    }
}
