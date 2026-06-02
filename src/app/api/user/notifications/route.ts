import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getUserFromRequest } from "@/lib/jwt";
import { eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, payload.sub))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    const unreadCount = notifs.filter((n) => !n.read).length;

    return Response.json({ notifications: notifs, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mark all as read
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.userId, payload.sub),
          eq(notifications.read, false)
        )
      );

    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("Update notifications error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
