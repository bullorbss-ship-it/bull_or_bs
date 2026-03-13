import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

const GITHUB_REPO = 'bullorbss-ship-it/bull_or_bs';
const GITHUB_API = 'https://api.github.com';

/**
 * Deletes an article JSON file from GitHub.
 * Requires admin session + GITHUB_TOKEN.
 */
export async function POST(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'GITHUB_TOKEN not configured.' },
      { status: 500 }
    );
  }

  const { slug, type } = await req.json();
  if (!slug || !type) {
    return NextResponse.json({ error: 'Missing slug or type' }, { status: 400 });
  }

  const folder = type === 'roast' ? 'roasts' : type === 'take' ? 'takes' : 'picks';
  const filePath = `content/${folder}/${slug}.json`;

  try {
    // Get file SHA (required for deletion)
    const checkRes = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!checkRes.ok) {
      return NextResponse.json({ error: 'Article not found on GitHub' }, { status: 404 });
    }

    const existing = await checkRes.json();

    // Delete file
    const deleteRes = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Delete ${type}: ${slug}`,
        sha: existing.sha,
        committer: {
          name: 'BullOrBS',
          email: 'noreply@github.com',
        },
      }),
    });

    if (!deleteRes.ok) {
      const err = await deleteRes.json();
      return NextResponse.json(
        { error: 'GitHub delete failed', detail: err.message || JSON.stringify(err) },
        { status: deleteRes.status }
      );
    }

    return NextResponse.json({ success: true, deleted: filePath });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Delete failed', detail: message }, { status: 500 });
  }
}
