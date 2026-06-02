// src/lib/points.ts
// Points allocation utility — central business logic for reward crediting

import { prisma } from "./prisma";
import { TransactionType, TxStatus } from "@prisma/client";

// Virtual currency exchange rate: 1000 C-N = $1.00 USD
export const POINTS_PER_DOLLAR = 1000;

/**
 * Converts USD reward amount to C-N points
 * e.g., $0.50 → 500 C-N
 */
export function usdToPoints(usdAmount: number): number {
  return Math.floor(usdAmount * POINTS_PER_DOLLAR);
}

/**
 * Converts C-N points to USD equivalent
 * e.g., 1500 C-N → $1.50
 */
export function pointsToUsd(points: number): number {
  return points / POINTS_PER_DOLLAR;
}

/**
 * Formats points as currency display string
 * e.g., 1500 → "$1.50"
 */
export function formatPointsAsCurrency(points: number): string {
  return `$${pointsToUsd(points).toFixed(2)}`;
}

/**
 * Core function: Credits points to a user account after a verified survey completion.
 * Runs as a database transaction to ensure atomicity.
 *
 * @returns The created Transaction record
 */
export async function creditSurveyReward(params: {
  userId: string;
  transId: string;       // RapidoReach transaction ID (idempotency key)
  rewardUsd: number;     // USD value from postback
  surveyRef?: string;    // Optional survey reference
  metadata?: Record<string, unknown>; // Full webhook payload for audit
}) {
  const { userId, transId, rewardUsd, surveyRef, metadata } = params;
  const points = usdToPoints(rewardUsd);

  // Atomic database transaction: credit balance + log transaction
  const [transaction] = await prisma.$transaction([
    // 1. Create the transaction log entry
    prisma.transaction.create({
      data: {
        userId,
        type: TransactionType.EARNED_SURVEY,
        points,
        currencyAmount: rewardUsd,
        status: TxStatus.COMPLETED,
        transId,
        surveyRef: surveyRef ?? null,
        metadata: metadata ?? {},
      },
    }),
    // 2. Increment the user's point balance
    prisma.user.update({
      where: { id: userId },
      data: { pointsBalance: { increment: points } },
    }),
  ]);

  console.log(
    `[Points] Credited ${points} C-N ($${rewardUsd}) to user ${userId} | transId: ${transId}`
  );

  return transaction;
}

/**
 * Credits a small screenout/disqualification bonus.
 * Default: 10 C-N (matches your RapidoReach screenout setting)
 */
export async function creditScreenoutBonus(params: {
  userId: string;
  transId: string;
  metadata?: Record<string, unknown>;
}) {
  const { userId, transId, metadata } = params;
  const SCREENOUT_POINTS = 10; // matches your RapidoReach setting

  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId,
        type: TransactionType.SCREENOUT_BONUS,
        points: SCREENOUT_POINTS,
        currencyAmount: pointsToUsd(SCREENOUT_POINTS),
        status: TxStatus.COMPLETED,
        transId,
        metadata: metadata ?? {},
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { pointsBalance: { increment: SCREENOUT_POINTS } },
    }),
  ]);

  return transaction;
}

/**
 * Fetches paginated transaction history for a user
 */
export async function getUserTransactions(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where: { userId } }),
  ]);

  return {
    transactions,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
}
