import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { revengeWindowMinutes: true, cooldownMinutes: true, plan: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { revengeWindowMinutes, cooldownMinutes } = await req.json();

  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(revengeWindowMinutes !== undefined && {
        revengeWindowMinutes: Math.max(1, Math.min(120, revengeWindowMinutes)),
      }),
      ...(cooldownMinutes !== undefined && {
        cooldownMinutes: Math.max(1, Math.min(240, cooldownMinutes)),
      }),
    },
    select: { revengeWindowMinutes: true, cooldownMinutes: true, plan: true },
  });

  return NextResponse.json(user);
}
