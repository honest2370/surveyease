import { db } from "@/db";
import {
  users,
  surveyWallSessions,
  transactions,
  notifications,
} from "@/db/schema";
import { getUserFromRequest } from "@/lib/jwt";
import { usdToPoints } from "@/lib/crypto";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * DEV-ONLY: Simulate a successful survey postback for testing.
 * This endpoint mimics what happens when RapidoReach sends a callback.
 */
export async function POST(request: Request) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const rewardUsd = body.reward || 0.5;
    const points = usdToPoints(rewardUsd);
    const transId = `SIM-${crypto.randomUUID()}`;

    // Create survey session
    await db.insert(surveyWallSessions).values({
      userId: payload.sub,
      trackingId: transId,
      status: "COMPLETED",
      earnedPoints: points,
    });

    // Credit user
    await db
      .update(users)
      .set({
        pointsBalance: sql`${users.pointsBalance} + ${points}`,
        totalEarned: sql`${users.totalEarned} + ${points}`,
        surveysCompleted: sql`${users.surveysCompleted} + 1`,
        xp: sql`${users.xp} + ${Math.round(points / 10)}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, payload.sub));

    // Log transaction
    await db.insert(transactions).values({
      userId: payload.sub,
      type: "EARNED_SURVEY",
      points,
      currencyAmount: rewardUsd,
      status: "COMPLETED",
      referenceId: transId,
      description: `[SIMULATED] Survey completed — earned ${points} points ($${rewardUsd.toFixed(2)})`,
    });

    // Notification
    await db.insert(notifications).values({
      userId: payload.sub,
      title: "Test Reward! 🧪",
      message: `[TEST] You earned ${points} points ($${rewardUsd.toFixed(2)})`,
    });

    // Fetch updated user
    const [updatedUser] = await db
      .select({
        pointsBalance: users.pointsBalance,
        totalEarned: users.totalEarned,
        surveysCompleted: users.surveysCompleted,
        xp: users.xp,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    return Response.json({
      status: "simulated",
      transId,
      points,
      rewardUsd,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Simulate error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
