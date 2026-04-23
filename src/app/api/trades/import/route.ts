import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseCSV } from "@/lib/csv-parser";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const text = await file.text();
  const parsed = parseCSV(text);

  if (!parsed.length) {
    return NextResponse.json({ error: "No valid trades found in CSV" }, { status: 422 });
  }

  const created = await db.trade.createMany({
    data: parsed.map((t) => ({
      userId: session.user.id,
      ticker: t.ticker,
      side: t.side,
      quantity: t.quantity,
      entryPrice: t.entryPrice,
      exitPrice: t.exitPrice ?? null,
      pnl: t.pnl ?? null,
      entryAt: t.entryAt,
      exitAt: t.exitAt ?? null,
      notes: t.notes ?? null,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ imported: created.count });
}
