import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Destructure the data from your form
    const { taskName, taskDescription, status, softDeadline, hardDeadline, repetition } = body;

    // 2. Save to database using Prisma
    const newTask = await prisma.task.create({
      data: {
        taskName,
        taskDescription,
        status,
        // Ensure dates are handled correctly as Date objects
        softDeadline: softDeadline ? new Date(softDeadline) : null,
        hardDeadline: new Date(hardDeadline),
        repetition: Number(repetition),
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Fetch all tasks from the database, ordered by most recently created
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      // If you want to include category info, uncomment the line below:
      // include: { category: true }
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}