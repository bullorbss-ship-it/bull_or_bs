import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (resets on deploy, which is fine for free tier)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean up stale entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export function middleware(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const path = req.nextUrl.pathname;

  // Rate limit API routes
  if (path.startsWith('/api/')) {
    // /api/admin/login — very strict: 5 attempts per 15 minutes (brute-force protection)
    if (path.startsWith('/api/admin/login')) {
      if (!rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
        return NextResponse.json(
          { error: 'Too many login attempts. Try again in 15 minutes.' },
          { status: 429 }
        );
      }
    }

    // /api/generate — strict: 5 requests per minute (costs money)
    if (path.startsWith('/api/generate')) {
      if (!rateLimit(`generate:${ip}`, 5, 60 * 1000)) {
        return NextResponse.json(
          { error: 'Too many requests. Try again later.' },
          { status: 429 }
        );
      }
    }

    // /api/subscribe — moderate: 10 requests per minute
    if (path.startsWith('/api/subscribe')) {
      if (!rateLimit(`subscribe:${ip}`, 10, 60 * 1000)) {
        return NextResponse.json(
          { error: 'Too many requests. Try again later.' },
          { status: 429 }
        );
      }
    }

    // /api/health — lenient: 100 per minute (pingers hit this)
    if (path.startsWith('/api/health')) {
      if (!rateLimit(`health:${ip}`, 100, 60 * 1000)) {
        return NextResponse.json(
          { error: 'Too many requests.' },
          { status: 429 }
        );
      }
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    // Only match API routes — rate limiting + security headers
    '/api/:path*',
    // Admin dashboard
    '/orange/:path*',
  ],
};
