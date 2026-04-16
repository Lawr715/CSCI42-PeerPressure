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