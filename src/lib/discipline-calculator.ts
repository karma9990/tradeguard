import { db } from "@/lib/db";
import { startOfDay, endOfDay, subDays } from "date-fns";

export interface DisciplineScore {
  score: number;
  streak: number;
  totalTrades: number;
  revengeTrades: number;
  checklistPassRate: number;
  breakdown: {
    noRevengeTrades: number;
    checklistCompletion: number;
    consistencyBonus: number;
  };
}

function computeScore(
  totalTrades: number,
  revengeTrades: number,
  checklistPassRate: number
): number {
  const noRevengePenalty = totalTrades > 0 ? (revengeTrades / totalTrades) * 33 : 0;
  const noRevengeScore = Math.round(33 - noRevengePenalty);
  const checklistScore = Math.round(checklistPassRate * 34);
  const consistencyBonus =
    revengeTrades === 0 && checklistPassRate === 1 && totalTrades > 0 ? 33 : 0;
  return Math.min(100, noRevengeScore + checklistScore + consistencyBonus);
}

export async function calculateDisciplineScore(
  userId: string,
  date: Date = new Date()
): Promise<DisciplineScore> {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [trades, streak] = await Promise.all([
    db.trade.findMany({
      where: { userId, createdAt: { gte: dayStart, lte: dayEnd } },
      include: { checklistResponses: true },
    }),
    calculateStreak(userId, date),
  ]);

  const totalTrades = trades.length;
  const revengeTrades = trades.filter(
    (t: { isRevengeFlagged: boolean }) => t.isRevengeFlagged
  ).length;
  const tradesWithChecklist = trades.filter(
    (t: { checklistResponses: unknown[] }) => t.checklistResponses.length > 0
  ).length;
  const checklistPassRate = totalTrades > 0 ? tradesWithChecklist / totalTrades : 1;

  const noRevengePenalty = totalTrades > 0 ? (revengeTrades / totalTrades) * 33 : 0;
  const noRevengeScore = Math.round(33 - noRevengePenalty);
  const checklistScore = Math.round(checklistPassRate * 34);
  const consistencyBonus =
    revengeTrades === 0 && checklistPassRate === 1 && totalTrades > 0 ? 33 : 0;
  const score = Math.min(100, noRevengeScore + checklistScore + consistencyBonus);

  return {
    score,
    streak,
    totalTrades,
    revengeTrades,
    checklistPassRate: Math.round(checklistPassRate * 100),
    breakdown: {
      noRevengeTrades: noRevengeScore,
      checklistCompletion: checklistScore,
      consistencyBonus,
    },
  };
}

// Calcule le streak directement depuis la DB — sans rappeler calculateDisciplineScore
async function calculateStreak(userId: string, date: Date): Promise<number> {
  let streak = 0;

  for (let i = 1; i <= 30; i++) {
    const checkDate = subDays(date, i);
    const dayStart = startOfDay(checkDate);
    const dayEnd = endOfDay(checkDate);

    const trades = await db.trade.findMany({
      where: { userId, createdAt: { gte: dayStart, lte: dayEnd } },
      include: { checklistResponses: { select: { id: true } } },
    });

    if (trades.length === 0) continue;

    const revengeTrades = trades.filter(
      (t: { isRevengeFlagged: boolean }) => t.isRevengeFlagged
    ).length;
    const tradesWithChecklist = trades.filter(
      (t: { checklistResponses: unknown[] }) => t.checklistResponses.length > 0
    ).length;
    const checklistPassRate = tradesWithChecklist / trades.length;

    const dayScore = computeScore(trades.length, revengeTrades, checklistPassRate);

    if (dayScore >= 70) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
