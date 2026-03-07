import { NextResponse } from "next/server";
import { logAuditEvent } from "@/app/lib/audit";
import { getProfile } from "@/app/lib/auth";

export async function POST() {
  try {
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await logAuditEvent(profile.id, "login");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error logging login audit event:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}