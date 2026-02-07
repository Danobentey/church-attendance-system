import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string; rememberMe?: boolean }
    | null;

  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Invalid credentials" },
      { status: 400 }
    );
  }

  const rememberMe = Boolean(body?.rememberMe);
  const sessionId = crypto.randomUUID();

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "ca_session",
    value: sessionId,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  });

  return res;
}
