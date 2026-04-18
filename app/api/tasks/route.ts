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
    const { taskName, taskDescription, status, softDeadline, hardDeadline, repetition, categoryId } = body;
    
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
        }
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

    const tasks = await getDB().task.findMany({
      where: {
        assignedUsers: {
          some: {
            id: userId,
          },
        },
        status: {
          not: 'DONE',
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        hardDeadline: "asc", // Adopted from tasklist branch
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