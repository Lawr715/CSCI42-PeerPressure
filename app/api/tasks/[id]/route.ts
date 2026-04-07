import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const data = await request.json();

    // Map frontend data to Prisma expected types
    const updateData: any = {
      taskName: data.taskName,
      taskDescription: data.taskDescription,
      status: data.status,
      repetition: parseInt(data.repetition) || 0,
    };

    if (data.softDeadline) {
      updateData.softDeadline = new Date(data.softDeadline);
    }
    if (data.hardDeadline) {
      updateData.hardDeadline = new Date(data.hardDeadline);
    }
    if (data.categoryId) {
      updateData.categoryId = parseInt(data.categoryId);
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        category: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}
