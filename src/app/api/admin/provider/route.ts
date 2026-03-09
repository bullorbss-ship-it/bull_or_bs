import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getActiveProvider } from '@/lib/ai/providers';

export async function GET(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    provider: getActiveProvider(),
    hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
    hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
  });
}
