import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/crypto";
import { signJwt } from "@/lib/jwt";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signJwt(user.id, user.email);

    return Response.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        pointsBalance: user.pointsBalance,
        totalEarned: user.totalEarned,
        surveysCompleted: user.surveysCompleted,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        referralCode: user.referralCode,
        darkMode: user.darkMode,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
