import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        // In a real app we'd get this from session
        const userId = "user_1";

        // Calculate dates for current week
        const today = new Date();
        const currentDayOfWeek = today.getDay(); // 0 is Sunday

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - currentDayOfWeek));
        endOfWeek.setHours(23, 59, 59, 999);

        // Fetch user streak
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { loginStreak: true }
        });

        // Fetch Completed Tasks for the week (Assuming they belong to this user)
        const completedTasks = await prisma.task.findMany({
            where: {
                assignedToId: userId,
                status: "Done",
                interactions: {
                    some: {
                        interactionType: "Complete",
                        timestamp: { gte: startOfWeek, lte: endOfWeek }
                    }
                }
            }
        });

        // Fetch Incomplete / Delayed Tasks 
        // (Tasks with a deadline before today that are not done)
        const delayedTasks = await prisma.task.findMany({
            where: {
                assignedToId: userId,
                status: { not: "Done" },
                hardDeadline: { lt: new Date() }
            }
        });

        // Fetch Pomodoro data for the week to analyze "Common time of day"
        const pomodoros = await prisma.pomodoroInteraction.findMany({
            where: {
                userId: userId,
                createdAt: { gte: startOfWeek, lte: endOfWeek }
            },
            select: { createdAt: true }
        });

        // Simple time-of-day logic (Morning: 5-12, Afternoon: 12-17, Evening: 17-5)
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

        // Generate suggested action based on delayed tasks
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
        return NextResponse.json(
            { error: "Failed to generate report" },
            { status: 500 }
        );
    }
}
