import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { taskName, taskDescription, status, softDeadline, hardDeadline, repetition } = body;
    const newTask = await prisma.task.create({
      data: {
        taskName,
        taskDescription,
        status,
        softDeadline: softDeadline ? new Date(softDeadline) : null,
        hardDeadline: new Date(hardDeadline),
        repetition: Number(repetition),
        categoryId: body.categoryId ? Number(body.categoryId): null, 
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
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const tasks = await prisma.task.findMany({
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
      createdAt: "desc",
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