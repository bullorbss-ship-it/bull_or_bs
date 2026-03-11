import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

const GITHUB_REPO = 'bullorbss-ship-it/bull_or_bs';
const GITHUB_API = 'https://api.github.com';
const SUBSCRIBERS_PATH = 'data/subscribers.json';

async function getSubscribersFromGitHub(token: string): Promise<{ emails: string[]; sha: string | null }> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${SUBSCRIBERS_PATH}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!res.ok) return { emails: [], sha: null };
    const data = await res.json();
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return { emails: JSON.parse(content), sha: data.sha };
  } catch {
    return { emails: [], sha: null };
  }
}

async function saveSubscribersToGitHub(token: string, emails: string[], sha: string | null): Promise<boolean> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${SUBSCRIBERS_PATH}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `New subscriber (${emails.length} total)`,
        content: Buffer.from(JSON.stringify(emails, null, 2)).toString('base64'),
        ...(sha ? { sha } : {}),
        committer: { name: 'BullOrBS', email: 'noreply@github.com' },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// CASL compliance: consent is obtained via SubscribeForm UI (privacy policy link + opt-in text)
// Users agree to privacy policy and consent to emails before submitting
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`subscribe:${ip}`, 10, 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { email } = body;

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Subscribe service unavailable' }, { status: 503 });
  }

  const { emails: subscribers, sha } = await getSubscribersFromGitHub(token);

  if (subscribers.includes(email.toLowerCase())) {
    return NextResponse.json({ error: 'Already subscribed' }, { status: 409 });
  }

  subscribers.push(email.toLowerCase());

  const saved = await saveSubscribersToGitHub(token, subscribers, sha);
  if (!saved) {
    return NextResponse.json({ error: 'Failed to save. Try again later.' }, { status: 503 });
  }

  return NextResponse.json({ success: true });
}
