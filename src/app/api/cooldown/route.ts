import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getActiveCooldown } from "@/lib/revenge-detector";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cooldown = await getActiveCooldown(session.user.id);
  const now = Date.now();

  if (!cooldown) {
    return NextResponse.json({ active: false, session: null, remainingSeconds: 0 });
  }

  const remainingSeconds = Math.max(
    0,
    Math.round((cooldown.endsAt.getTime() - now) / 1000)
  );

  return NextResponse.json({ active: true, session: cooldown, remainingSeconds });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  await db.cooldownSession.update({
    where: { id, userId: session.user.id },
    data: { dismissed: true },
  });

  return NextResponse.json({ success: true });
}
