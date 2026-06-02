import { db } from "@/db";
import { transactions } from "@/db/schema";
import { getUserFromRequest } from "@/lib/jwt";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const txns = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, payload.sub))
      .orderBy(desc(transactions.createdAt))
      .limit(50);

    return Response.json({ transactions: txns });
  } catch (error) {
    console.error("Get transactions error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
