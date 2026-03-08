import { timingSafeEqual, randomBytes } from 'crypto';
import { NextRequest } from 'next/server';

/**
 * Timing-safe string comparison to prevent timing attacks.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}

// In-memory session store (resets on deploy — fine for single admin)
const sessions = new Map<string, number>();

export function createSession(): string {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + 24 * 60 * 60 * 1000); // 24h
  return token;
}

export function verifySession(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) return false;

  const expiry = sessions.get(token);
  if (!expiry || Date.now() > expiry) {
    sessions.delete(token);
    return false;
  }

  return true;
}
