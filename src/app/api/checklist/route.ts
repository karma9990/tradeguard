import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await db.checklistItem.findMany({
    where: { userId: session.user.id, active: true },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { question, required } = await req.json();
  if (!question) return NextResponse.json({ error: "Question required" }, { status: 400 });

  const maxOrder = await db.checklistItem.aggregate({
    where: { userId: session.user.id },
    _max: { order: true },
  });

  const item = await db.checklistItem.create({
    data: {
      userId: session.user.id,
      question,
      required: required ?? true,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, question, required, active, order } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const item = await db.checklistItem.update({
    where: { id, userId: session.user.id },
    data: {
      ...(question !== undefined && { question }),
      ...(required !== undefined && { required }),
      ...(active !== undefined && { active }),
      ...(order !== undefined && { order }),
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await db.checklistItem.update({
    where: { id, userId: session.user.id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}
