import { db } from "@/lib/db";

export interface RevengeCheckResult {
  isRevenge: boolean;
  minutesSinceLastLoss: number | null;
  lastLossPnl: number | null;
}

/**
 * Checks if a new trade is a revenge trade based on the user's config.
 * A revenge trade is one placed within revengeWindowMinutes after a losing trade.
 */
export async function checkRevengeTrading(
  userId: string,
  tradeEntryAt: Date
): Promise<RevengeCheckResult> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { revengeWindowMinutes: true },
  });

  if (!user) return { isRevenge: false, minutesSinceLastLoss: null, lastLossPnl: null };

  const windowStart = new Date(
    tradeEntryAt.getTime() - user.revengeWindowMinutes * 60 * 1000
  );

  // Find the last losing trade within the window — use exitAt if set, otherwise createdAt
  const lastLoss = await db.trade.findFirst({
    where: {
      userId,
      pnl: { lt: 0 },
      OR: [
        { exitAt: { gte: windowStart, lte: tradeEntryAt } },
        { exitAt: null, createdAt: { gte: windowStart, lte: tradeEntryAt } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  if (!lastLoss) {
    return { isRevenge: false, minutesSinceLastLoss: null, lastLossPnl: null };
  }

  const lossTimestamp = lastLoss.exitAt ?? lastLoss.createdAt;
  const minutesSince =
    (tradeEntryAt.getTime() - lossTimestamp.getTime()) / 60000;

  return {
    isRevenge: true,
    minutesSinceLastLoss: Math.round(minutesSince),
    lastLossPnl: lastLoss.pnl,
  };
}

export async function getActiveCooldown(userId: string) {
  return db.cooldownSession.findFirst({
    where: {
      userId,
      endsAt: { gt: new Date() },
      dismissed: false,
    },
    orderBy: { endsAt: "desc" },
  });
}

export async function createCooldown(
  userId: string,
  reason: string,
  cooldownMinutes: number
) {
  const endsAt = new Date(Date.now() + cooldownMinutes * 60 * 1000);
  return db.cooldownSession.create({
    data: { userId, endsAt, reason },
  });
}
