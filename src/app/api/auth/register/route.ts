import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const DEFAULT_CHECKLIST = [
  "Is there a clear setup / pattern I can identify?",
  "Is my risk-to-reward at least 1:2?",
  "Am I trading with the trend or do I have a reason to fade it?",
  "Is my position size within my 1-2% account risk limit?",
  "Am I entering this trade with a clear head (not emotional)?",
];

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashed,
        checklistItems: {
          create: DEFAULT_CHECKLIST.map((question, order) => ({
            question,
            order,
          })),
        },
      },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
