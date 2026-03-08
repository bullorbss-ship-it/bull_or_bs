import { NextRequest, NextResponse } from 'next/server';
import { timingSafeCompare, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { password } = body;
  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  if (!timingSafeCompare(password, process.env.ADMIN_PASSWORD || '')) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = createSession();
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400,
    path: '/',
  });

  return response;
}
