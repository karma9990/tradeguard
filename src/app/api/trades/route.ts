import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRevengeTrading, getActiveCooldown, createCooldown } from "@/lib/revenge-detector";
import { TradeSide } from "@/generated/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const [trades, total] = await Promise.all([
    db.trade.findMany({
      where: { userId: session.user.id },
      include: {
        checklistResponses: {
          include: { checklistItem: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    db.trade.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({ trades, total });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Block if active cooldown
  const cooldown = await getActiveCooldown(userId);
  if (cooldown) {
    return NextResponse.json(
      {
        error: "Cooldown active",
        cooldownEndsAt: cooldown.endsAt,
      },
      { status: 423 }
    );
  }

  const body = await req.json();
  const {
    ticker,
    side,
    quantity,
    entryPrice,
    exitPrice,
    pnl,
    entryAt,
    exitAt,
    notes,
    checklistResponses,
  } = body;

  if (!ticker || !side || !quantity || !entryPrice) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const entryDate = new Date(entryAt ?? Date.now());

  const { isRevenge } = await checkRevengeTrading(userId, entryDate);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { cooldownMinutes: true },
  });

  const trade = await db.trade.create({
    data: {
      userId,
      ticker: ticker.toUpperCase(),
      side: side as TradeSide,
      quantity,
      entryPrice,
      exitPrice: exitPrice ?? null,
      pnl: pnl ?? null,
      entryAt: entryDate,
      exitAt: exitAt ? new Date(exitAt) : null,
      isRevengeFlagged: isRevenge,
      notes: notes ?? null,
      checklistResponses: checklistResponses?.length
        ? {
            create: checklistResponses.map(
              (r: { checklistItemId: string; answer: boolean }) => ({
                checklistItemId: r.checklistItemId,
                answer: r.answer,
              })
            ),
          }
        : undefined,
    },
  });

  // Create cooldown if revenge trade detected
  if (isRevenge && user) {
    await createCooldown(userId, "revenge_trade_detected", user.cooldownMinutes);
  }

  return NextResponse.json(trade, { status: 201 });
}
