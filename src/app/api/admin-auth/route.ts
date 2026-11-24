import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ADMIN_COOKIE, adminCookieOptions, createAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// Simple in-memory brake on password guessing (per server instance).
const attempts = new Map<string, { count: number; until: number }>();

/** POST: log in with ADMIN_EMAIL + password (checked against ADMIN_PASSWORD_HASH). */
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const a = attempts.get(ip);
  if (a && a.count >= 5 && a.until > now) {
    return NextResponse.json({ success: false, error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !adminHash) {
    return NextResponse.json({ success: false, error: 'Admin login is not configured' }, { status: 500 });
  }

  const { email, password } = await request.json().catch(() => ({}));
  const ok =
    typeof email === 'string' &&
    typeof password === 'string' &&
    email.trim().toLowerCase() === adminEmail.toLowerCase() &&
    (await bcrypt.compare(password, adminHash));

  if (!ok) {
    const count = (a && a.until > now ? a.count : 0) + 1;
    attempts.set(ip, { count, until: now + 15 * 60 * 1000 });
    return NextResponse.json({ success: false, error: 'Wrong email or password' }, { status: 401 });
  }

  attempts.delete(ip);
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, await createAdminSession(adminEmail), adminCookieOptions);
  return res;
}

/** DELETE: log out. */
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions, maxAge: 0 });
  return res;
}
