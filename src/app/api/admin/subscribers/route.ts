import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

const GITHUB_REPO = 'bullorbss-ship-it/bull_or_bs';
const GITHUB_API = 'https://api.github.com';
const SUBSCRIBERS_PATH = 'data/subscribers.json';

export async function GET(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 503 });
  }

  try {
    const res = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${SUBSCRIBERS_PATH}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ emails: [], count: 0 });
    }

    const data = await res.json();
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    const emails: string[] = JSON.parse(content);

    return NextResponse.json({ emails, count: emails.length });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
