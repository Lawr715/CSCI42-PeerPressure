import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET — Fetch notifications for the current user
export async function GET() {
    try {
        const session = await getAuth().api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const notifications = await getDB().notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        return NextResponse.json(notifications);
    } catch (error: any) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

// PATCH — Mark notifications as read
export async function PATCH(request: Request) {
    try {
        const session = await getAuth().api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { ids, markAll } = body;

        if (markAll) {
            await getDB().notification.updateMany({
                where: { userId: session.user.id, read: false },
                data: { read: true },
            });
        } else if (ids && Array.isArray(ids)) {
            await getDB().notification.updateMany({
                where: {
                    id: { in: ids },
                    userId: session.user.id,
                },
                data: { read: true },
            });
        }

        return NextResponse.json({ message: "Notifications marked as read" });
    } catch (error: any) {
        console.error("Error updating notifications:", error);
        return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
    }
}
