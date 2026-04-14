import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { commitArticleToGitHub } from '@/lib/github-commit';
import fs from 'fs';
import path from 'path';

/**
 * Commits an article JSON file to GitHub so it persists across deploys.
 * Uses GitHub Contents API via src/lib/github-commit.ts.
 */
export async function POST(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug, type, article } = await req.json();
  if (!slug || !type) {
    return NextResponse.json({ error: 'Missing slug or type' }, { status: 400 });
  }

  let articleObj = article;

  // Fallback: read from disk (local / Render) if the client didn't pass article JSON
  if (!articleObj) {
    const folder = type === 'roast' ? 'roasts' : type === 'take' ? 'takes' : 'picks';
    const localPath = path.join(process.cwd(), 'content', folder, `${slug}.json`);
    if (!fs.existsSync(localPath)) {
      return NextResponse.json(
        { error: 'Article not found. Try generating again.' },
        { status: 404 },
      );
    }
    articleObj = JSON.parse(fs.readFileSync(localPath, 'utf8'));
  } else if (typeof articleObj === 'string') {
    articleObj = JSON.parse(articleObj);
  }

  const result = await commitArticleToGitHub(articleObj);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, detail: result.detail },
      { status: result.status },
    );
  }

  return NextResponse.json({
    success: true,
    commitSha: result.commitSha,
    url: result.url,
  });
}
