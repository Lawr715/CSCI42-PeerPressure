import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getAuth().api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { taskName, taskDescription, status, softDeadline, hardDeadline, repetition, categoryId, groupId } = body;
    
    // If groupId is provided, verify the user is a member of that group
    if (groupId) {
      const membership = await getDB().groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: session.user.id,
            groupId: groupId,
          },
        },
      });

      if (!membership) {
        return NextResponse.json({ error: "You are not a member of this group" }, { status: 403 });
      }
    }

    const newTask = await getDB().task.create({
      data: {
        taskName,
        taskDescription,
        status,
        softDeadline: softDeadline ? new Date(softDeadline) : null,
        hardDeadline: new Date(hardDeadline),
        repetition: Number(repetition),
        categoryId: categoryId ? Number(categoryId): null, 
        assignedUsers: {
          connect: { id: session.user.id }
        },
        ...(groupId ? { groupId } : {}),
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getAuth().api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const db = getDB();

    // Get user's group IDs
    const memberships = await db.groupMember.findMany({
      where: { userId },
      select: { groupId: true },
    });
    const groupIds = memberships.map((m: any) => m.groupId);

    // Fetch personal tasks AND tasks from all groups the user belongs to
    const tasks = await db.task.findMany({
      where: {
        OR: [
          // Personal tasks assigned to the user
          {
            assignedUsers: { some: { id: userId } },
            groupId: null,
          },
          // Group tasks from any group the user is in
          ...(groupIds.length > 0
            ? [{ groupId: { in: groupIds } }]
            : []),
        ],
        status: { not: "DONE" as any },
      },
      include: {
        category: true,
        group: { select: { id: true, name: true } },
      },
      orderBy: {
        hardDeadline: "asc",
      },
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}