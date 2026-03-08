import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data/subscribers.json');

function loadSubscribers(): string[] {
  try {
    return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveSubscribers(subs: string[]) {
  fs.mkdirSync(path.dirname(SUBSCRIBERS_FILE), { recursive: true });
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subs, null, 2));
}

export async function POST(req: NextRequest) {
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

  const subscribers = loadSubscribers();

  if (subscribers.includes(email.toLowerCase())) {
    return NextResponse.json({ error: 'Already subscribed' }, { status: 409 });
  }

  subscribers.push(email.toLowerCase());
  saveSubscribers(subscribers);

  return NextResponse.json({ success: true });
}
