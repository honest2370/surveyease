import { db } from "@/db";
import { users } from "@/db/schema";
import { getUserFromRequest } from "@/lib/jwt";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        pointsBalance: users.pointsBalance,
        totalEarned: users.totalEarned,
        surveysCompleted: users.surveysCompleted,
        level: users.level,
        xp: users.xp,
        streak: users.streak,
        referralCode: users.referralCode,
        darkMode: users.darkMode,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
