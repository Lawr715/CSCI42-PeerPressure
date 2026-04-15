import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
    console.log("🌱 Seeding database (cleaning up first)...");

    // Clean up any data from the partial previous run
    await prisma.taskInteraction.deleteMany({});
    await prisma.pomodoroInteraction.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.category.deleteMany({});
    console.log("🧹 Cleaned up old data");

    // Create Categories
    const cat1 = await prisma.category.create({ data: { categoryName: "Development" } });
    const cat2 = await prisma.category.create({ data: { categoryName: "Design" } });
    const cat3 = await prisma.category.create({ data: { categoryName: "Research" } });
    console.log("✅ Categories created");

    // Create Tasks - mix of completed, overdue, and in-progress
    const task1 = await prisma.task.create({
        data: {
            taskName: "Fix login page layout",
            taskDescription: "The login page has alignment issues on mobile devices",
            status: "DONE",
            assignedUsers: { connect: { id: "user-1" } },
            categoryId: cat1.id,
            hardDeadline: new Date("2026-03-08"),
        },
    });

    const task2 = await prisma.task.create({
        data: {
            taskName: "Design dashboard mockup",
            taskDescription: "Create wireframes for the main dashboard",
            status: "DONE",
            assignedUsers: { connect: { id: "user-1" } },
            categoryId: cat2.id,
            hardDeadline: new Date("2026-03-09"),
        },
    });

    const task3 = await prisma.task.create({
        data: {
            taskName: "Write unit tests for API",
            taskDescription: "Cover all meeting endpoints with tests",
            status: "IN_PROGRESS",
            assignedUsers: { connect: { id: "user-1" } },
            categoryId: cat1.id,
            hardDeadline: new Date("2026-03-05"), // Overdue!
        },
    });

    const task4 = await prisma.task.create({
        data: {
            taskName: "Update project documentation",
            taskDescription: "Add API docs for new meeting endpoints",
            status: "BACKLOG",
            assignedUsers: { connect: { id: "user-1" } },
            categoryId: cat3.id,
            hardDeadline: new Date("2026-03-07"), // Overdue!
        },
    });

    const task5 = await prisma.task.create({
        data: {
            taskName: "Implement notification system",
            taskDescription: "Send email reminders for upcoming deadlines",
            status: "FOR_REVIEW",
            assignedUsers: { connect: { id: "user-1" } },
            categoryId: cat1.id,
            hardDeadline: new Date("2026-03-06"), // Overdue!
        },
    });

    const task6 = await prisma.task.create({
        data: {
            taskName: "Research color palette options",
            taskDescription: "Find modern color schemes for the app redesign",
            status: "DONE",
            assignedUsers: { connect: { id: "user-1" } },
            categoryId: cat2.id,
            hardDeadline: new Date("2026-03-12"),
        },
    });

    const task7 = await prisma.task.create({
        data: {
            taskName: "Set up CI/CD pipeline",
            taskDescription: "Configure GitHub Actions for automated deployments",
            status: "IN_PROGRESS",
            assignedUsers: { connect: { id: "user-1" } },
            categoryId: cat1.id,
            hardDeadline: new Date("2026-03-15"),
        },
    });
    console.log("✅ 7 Tasks created");

    // Create TaskInteractions for completed tasks (this week: March 8-14, 2026)
    await prisma.taskInteraction.create({
        data: {
            taskId: task1.id,
            userId: "user-1",
            interactionType: "COMPLETE",
            timestamp: new Date("2026-03-09T14:30:00"),
        },
    });

    await prisma.taskInteraction.create({
        data: {
            taskId: task2.id,
            userId: "user-1",
            interactionType: "COMPLETE",
            timestamp: new Date("2026-03-10T10:15:00"),
        },
    });

    await prisma.taskInteraction.create({
        data: {
            taskId: task6.id,
            userId: "user-1",
            interactionType: "COMPLETE",
            timestamp: new Date("2026-03-10T16:00:00"),
        },
    });

    await prisma.taskInteraction.create({
        data: {
            taskId: task3.id,
            userId: "user-1",
            interactionType: "CREATE",
            timestamp: new Date("2026-03-04T09:00:00"),
        },
    });

    await prisma.taskInteraction.create({
        data: {
            taskId: task7.id,
            userId: "user-1",
            interactionType: "CREATE",
            timestamp: new Date("2026-03-08T11:00:00"),
        },
    });
    console.log("✅ Task interactions created");

    // Create Pomodoro sessions (various times of day this week)
    const pomodoroData = [
        new Date("2026-03-08T09:15:00"), // Morning
        new Date("2026-03-08T10:00:00"), // Morning
        new Date("2026-03-08T14:30:00"), // Afternoon
        new Date("2026-03-09T08:45:00"), // Morning
        new Date("2026-03-09T09:30:00"), // Morning
        new Date("2026-03-09T15:00:00"), // Afternoon
        new Date("2026-03-10T07:00:00"), // Morning
        new Date("2026-03-10T10:30:00"), // Morning
        new Date("2026-03-10T13:00:00"), // Afternoon
        new Date("2026-03-10T19:00:00"), // Evening
    ];

    for (const createdAt of pomodoroData) {
        await prisma.pomodoroInteraction.create({
            data: {
                userId: "user-1",
                focusTime: 25,
                restTime: 5,
                createdAt,
            },
        });
    }
    console.log("✅ 10 Pomodoro sessions created");

    // Update user-1 login streak
    await prisma.user.update({
        where: { id: "user-1" },
        data: { loginStreak: 5 },
    });
    console.log("✅ User streak updated to 5 days");

    console.log("\n🎉 Database seeded successfully!");
    console.log("Summary:");
    console.log("  - 3 categories");
    console.log("  - 7 tasks (3 completed, 3 overdue, 1 in progress)");
    console.log("  - 5 task interactions");
    console.log("  - 10 pomodoro sessions (6 morning, 3 afternoon, 1 evening)");
    console.log("  - User streak: 5 days");

    await pool.end();
}

seed().catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
});
