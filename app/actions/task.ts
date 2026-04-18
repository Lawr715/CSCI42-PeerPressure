// /app/actions/task.ts
"use server";

import { getDB } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getNextTask() {
  const session = await getAuth().api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const task = await getDB().task.findFirst({
    where: {
      assignedUsers: {
        some: {
          id: session.user.id,
        },
      },
      hardDeadline: {
        gte: new Date(),
      },
    },
    orderBy: {
      hardDeadline: "asc",
    },
  });

  return task;
}

export async function getDashboardData() {
  const session = await getAuth().api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const user = await getDB().user.findUnique({
    where: { id: session.user.id },
    select: { loginStreak: true },
  });

  const tasks = await getDB().task.findMany({
    where: {
      OR: [
        { assignedUsers: { some: { id: session.user.id } } },
        { group: { members: { some: { userId: session.user.id } } } }
      ]
    },
    orderBy: { hardDeadline: "asc" },
    take: 4,
  });

  return {
    streak: user?.loginStreak || 0,
    upcomingTasks: tasks
  };
}