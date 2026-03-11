import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const GITHUB_REPO = 'bullorbss-ship-it/bull_or_bs';
const GITHUB_API = 'https://api.github.com';

/**
 * Commits an article JSON file to GitHub so it persists across Render deploys.
 * Uses GitHub Contents API — requires GITHUB_TOKEN env var.
 */
export async function POST(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'GITHUB_TOKEN not configured. Set it in Vercel env vars.' },
      { status: 500 }
    );
  }

  const { slug, type, article } = await req.json();
  if (!slug || !type) {
    return NextResponse.json({ error: 'Missing slug or type' }, { status: 400 });
  }

  const folder = type === 'roast' ? 'roasts' : 'picks';
  let content: string;

  // Prefer article JSON passed directly from the client (works on Vercel's read-only FS)
  if (article) {
    content = typeof article === 'string' ? article : JSON.stringify(article, null, 2);
  } else {
    // Fallback: read from disk (works locally / on Render)
    const localPath = path.join(process.cwd(), 'content', folder, `${slug}.json`);
    if (!fs.existsSync(localPath)) {
      return NextResponse.json({ error: 'Article not found. Try generating again.' }, { status: 404 });
    }
    content = fs.readFileSync(localPath, 'utf8');
  }

  const filePath = `content/${folder}/${slug}.json`;

  try {
    // Check if file already exists (need SHA for updates)
    let sha: string | undefined;
    const checkRes = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }

    // Create or update file
    const commitRes = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add ${type}: ${slug}`,
        content: Buffer.from(content).toString('base64'),
        ...(sha ? { sha } : {}),
        committer: {
          name: 'BullOrBS',
          email: 'noreply@github.com',
        },
      }),
    });

    if (!commitRes.ok) {
      const err = await commitRes.json();
      return NextResponse.json(
        { error: 'GitHub commit failed', detail: err.message || JSON.stringify(err) },
        { status: commitRes.status }
      );
    }

    const result = await commitRes.json();
    return NextResponse.json({
      success: true,
      commitSha: result.commit?.sha,
      url: result.content?.html_url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Commit failed', detail: message }, { status: 500 });
  }
}
