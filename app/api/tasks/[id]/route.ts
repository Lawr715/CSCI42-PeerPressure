import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuth().api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    // Verify user has access (personal task owner or group member)
    const task = await getDB().task.findUnique({
      where: { id: taskId },
      include: { assignedUsers: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check access: either assigned to user, or user is in the same group
    const isAssigned = task.assignedUsers.some((u: any) => u.id === session.user.id);
    let isGroupMember = false;

    if (task.groupId) {
      const membership = await getDB().groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: session.user.id,
            groupId: task.groupId,
          },
        },
      });
      isGroupMember = !!membership;
    }

    if (!isAssigned && !isGroupMember) {
      return NextResponse.json({ error: "You don't have access to this task" }, { status: 403 });
    }

    const data = await request.json();

    const updateData: any = {};
    if (data.taskName !== undefined) updateData.taskName = data.taskName;
    if (data.taskDescription !== undefined) updateData.taskDescription = data.taskDescription;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.repetition !== undefined) updateData.repetition = parseInt(data.repetition) || 0;
    if (data.softDeadline) updateData.softDeadline = new Date(data.softDeadline);
    if (data.hardDeadline) updateData.hardDeadline = new Date(data.hardDeadline);
    if (data.categoryId) updateData.categoryId = parseInt(data.categoryId);

    const updatedTask = await getDB().task.update({
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

    const task = await getDB().task.findUnique({
      where: { id: taskId },
      include: {
        category: true,
        group: { select: { id: true, name: true } },
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuth().api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const task = await getDB().task.findUnique({
      where: { id: taskId },
      include: { assignedUsers: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check access
    const isAssigned = task.assignedUsers.some((u: any) => u.id === session.user.id);
    let isGroupMember = false;

    if (task.groupId) {
      const membership = await getDB().groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: session.user.id,
            groupId: task.groupId,
          },
        },
      });
      isGroupMember = !!membership;
    }

    if (!isAssigned && !isGroupMember) {
      return NextResponse.json({ error: "You don't have access to this task" }, { status: 403 });
    }

    await getDB().task.delete({ where: { id: taskId } });

    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
