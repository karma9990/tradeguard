import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, PRO_PRICE_ID } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeId: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkout = await getStripe().checkout.sessions.create({
    customer_email: user.stripeId ? undefined : user.email!,
    customer: user.stripeId ?? undefined,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/settings`,
    metadata: { userId: session.user.id },
  });

  return NextResponse.json({ url: checkout.url });
}
