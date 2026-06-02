import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, generateReferralCode } from "@/lib/crypto";
import { signJwt } from "@/lib/jwt";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, displayName, referralCode } = body as {
      email: string;
      password: string;
      displayName?: string;
      referralCode?: string;
    };

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return Response.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const newRefCode = generateReferralCode();

    // Find referrer if code provided
    let referrerId: string | null = null;
    if (referralCode) {
      const referrer = await db
        .select()
        .from(users)
        .where(eq(users.referralCode, referralCode))
        .limit(1);
      if (referrer.length > 0) {
        referrerId = referrer[0].id;
      }
    }

    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        displayName: displayName || email.split("@")[0],
        referralCode: newRefCode,
        referredBy: referrerId,
        pointsBalance: 500, // Welcome bonus
        totalEarned: 500,
      })
      .returning();

    const token = signJwt(user.id, user.email);

    return Response.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        pointsBalance: user.pointsBalance,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
