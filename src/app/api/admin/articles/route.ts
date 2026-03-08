import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getAllArticles } from '@/lib/content';

export async function GET(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const articles = getAllArticles();
  return NextResponse.json({ articles });
}
