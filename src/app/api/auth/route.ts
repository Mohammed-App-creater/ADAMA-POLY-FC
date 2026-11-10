import { NextResponse } from "next/server";
import { checkPassword, endSession, isStaff, loginAllowed, loginFailed, startSession } from "@/lib/auth";

// GET: am I signed in?  POST: sign in.  DELETE: sign out.
export async function GET() {
  return NextResponse.json({ staff: await isStaff() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    return NextResponse.json({ error: "Staff login is not configured. Set ADMIN_PASSWORD and SESSION_SECRET." }, { status: 500 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!loginAllowed(ip)) {
    return NextResponse.json({ error: "Too many attempts. Try again in 10 minutes." }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  if (typeof body.password !== "string" || !checkPassword(body.password)) {
    loginFailed(ip);
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  await startSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await endSession();
  return NextResponse.json({ ok: true });
}
