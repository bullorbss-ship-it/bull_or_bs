import { timingSafeEqual, randomBytes, createHmac } from 'crypto';
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

// Signed token auth — works on serverless (no in-memory state needed)
// Token format: expiry_hex.hmac_signature

function getSecret(): string {
  return process.env.ADMIN_PASSWORD || randomBytes(32).toString('hex');
}

function hmacSign(data: string): string {
  return createHmac('sha256', getSecret()).update(data).digest('hex');
}

export function createSession(): string {
  const expiry = (Date.now() + 24 * 60 * 60 * 1000).toString(16);
  const sig = hmacSign(expiry);
  return `${expiry}.${sig}`;
}

export function verifySession(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [expiry, sig] = parts;
  const expectedSig = hmacSign(expiry);

  if (!timingSafeCompare(sig, expectedSig)) return false;

  const expiryMs = parseInt(expiry, 16);
  if (isNaN(expiryMs) || Date.now() > expiryMs) return false;

  return true;
}
