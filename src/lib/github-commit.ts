import type { Article } from './types';

const GITHUB_REPO = 'bullorbss-ship-it/bull_or_bs';
const GITHUB_API = 'https://api.github.com';

export type CommitResult =
  | { ok: true; commitSha?: string; url?: string }
  | { ok: false; status: number; error: string; detail?: string };

export async function commitArticleToGitHub(
  article: Article,
  opts: { message?: string } = {},
): Promise<CommitResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { ok: false, status: 500, error: 'GITHUB_TOKEN not configured' };
  }

  const folder =
    article.type === 'roast' ? 'roasts' : article.type === 'take' ? 'takes' : 'picks';
  const filePath = `content/${folder}/${article.slug}.json`;
  const body = JSON.stringify(article, null, 2);
  const message = opts.message || `Add ${article.type}: ${article.slug}`;

  try {
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

    const commitRes = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(body).toString('base64'),
        ...(sha ? { sha } : {}),
        committer: { name: 'BullOrBS', email: 'noreply@github.com' },
      }),
    });

    if (!commitRes.ok) {
      const err = await commitRes.json().catch(() => ({}));
      return {
        ok: false,
        status: commitRes.status,
        error: 'GitHub commit failed',
        detail: err.message || JSON.stringify(err),
      };
    }

    const result = await commitRes.json();
    return { ok: true, commitSha: result.commit?.sha, url: result.content?.html_url };
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, status: 500, error: 'Commit failed', detail };
  }
}
