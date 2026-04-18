import { NextResponse } from "next/server";
import { getDB } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
    try {
        const session = await getAuth().api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = getDB();

        // Security check: Delete the user that matches the authenticated session ID.
        // Due to cascading deletes defined in schema.prisma, this will also wipe out 
        // their sessions, accounts, exclusively owned groups, and all messages.
        await db.user.delete({
            where: {
                id: session.user.id,
            },
        });

        return NextResponse.json({ message: "Account successfully deleted." }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting account:", error);
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }
}
