// Staff login: one shared password (ADMIN_PASSWORD) and a signed, http-only cookie.
import crypto from "crypto";
import { cookies } from "next/headers";

export const COOKIE = "apfc_staff";
const MAX_AGE = 60 * 60 * 12; // 12 hours

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}
function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}
function safeEqual(a: string, b: string) {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function checkPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  return !!pw && safeEqual(input, pw);
}

export async function startSession() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isStaff() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw || !process.env.SESSION_SECRET) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || !safeEqual(sig, sign(exp))) return false;
  return Number(exp) > Date.now();
}

// Simple in-memory limit on login attempts per address.
const attempts = new Map<string, { n: number; until: number }>();
export function loginAllowed(ip: string) {
  const a = attempts.get(ip);
  if (a && a.until < Date.now()) attempts.delete(ip);
  return (attempts.get(ip)?.n ?? 0) < 8;
}
export function loginFailed(ip: string) {
  const a = attempts.get(ip) ?? { n: 0, until: Date.now() + 10 * 60 * 1000 };
  a.n++;
  attempts.set(ip, a);
}
