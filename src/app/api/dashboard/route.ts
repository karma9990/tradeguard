import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateDisciplineScore } from "@/lib/discipline-calculator";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const today = new Date();

  const [allTrades, todayTrades, discipline] = await Promise.all([
    db.trade.findMany({
      where: { userId },
      select: { pnl: true, isRevengeFlagged: true },
    }),
    db.trade.findMany({
      where: {
        userId,
        createdAt: { gte: startOfDay(today), lte: endOfDay(today) },
      },
      select: { pnl: true, isRevengeFlagged: true },
    }),
    calculateDisciplineScore(userId, today),
  ]);

  type TradePnl = { pnl: number | null; isRevengeFlagged: boolean };
  const closedTrades = allTrades.filter((t: TradePnl) => t.pnl !== null);
  const wins = closedTrades.filter((t: TradePnl) => (t.pnl ?? 0) > 0);
  const totalPnl = closedTrades.reduce((sum: number, t: TradePnl) => sum + (t.pnl ?? 0), 0);
  const todayPnl = todayTrades.reduce((sum: number, t: TradePnl) => sum + (t.pnl ?? 0), 0);

  return NextResponse.json({
    totalTrades: allTrades.length,
    winRate: closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0,
    totalPnl,
    todayPnl,
    avgPnl: closedTrades.length > 0 ? totalPnl / closedTrades.length : 0,
    revengeTrades: allTrades.filter((t: TradePnl) => t.isRevengeFlagged).length,
    disciplineScore: discipline.score,
    streak: discipline.streak,
    todayTrades: todayTrades.length,
  });
}
