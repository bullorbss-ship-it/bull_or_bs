import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getCostSummary } from '@/lib/costs';

export async function GET(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = getCostSummary();
  return NextResponse.json(summary);
}
