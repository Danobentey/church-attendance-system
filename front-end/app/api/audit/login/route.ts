import { NextResponse } from "next/server";
import { logAuditEvent } from "@/app/lib/audit";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }

    await logAuditEvent(userId, "login");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error logging login audit event:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}