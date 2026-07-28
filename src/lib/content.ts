import fs from 'fs';
import path from 'path';
import { Article } from './types';
import { nowEST } from './date';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export function getAllArticles(): Article[] {
  const articles: { article: Article; mtime: number }[] = [];

  for (const type of ['roasts', 'picks', 'takes'] as const) {
    const dir = path.join(CONTENT_DIR, type);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const filePath = path.join(dir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const mtime = fs.statSync(filePath).mtimeMs;
      articles.push({ article: data, mtime });
    }
  }

  return articles
    .sort((a, b) => {
      const timeA = a.article.createdAt ? new Date(a.article.createdAt).getTime() : a.mtime;
      const timeB = b.article.createdAt ? new Date(b.article.createdAt).getTime() : b.mtime;
      return timeB - timeA;
    })
    .map(a => a.article);
}

export function getArticleBySlug(slug: string): Article | null {
  for (const type of ['roasts', 'picks', 'takes']) {
    const filePath = path.join(CONTENT_DIR, type, `${slug}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  }
  return null;
}

export function isIndexableArticle(article: Article): boolean {
  if (article.editorialReview?.status === 'approved') return true;
  if (article.tags?.includes('daily-briefing') || article.factChecked !== true) return false;
  const references = article.content?.references || [];
  const words = (article.content?.analysis || '').split(/\s+/).filter(Boolean).length;
  return words >= 500 &&
    references.length >= 3 &&
    references.every(reference => {
      try {
        const url = new URL(reference.url);
        return url.protocol === 'https:' || url.protocol === 'http:';
      } catch {
        return false;
      }
    });
}

export function getArticlesByType(type: 'roasts' | 'picks' | 'takes'): Article[] {
  const dir = path.join(CONTENT_DIR, type);
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const filePath = path.join(dir, f);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return { article: data, mtime: fs.statSync(filePath).mtimeMs };
    })
    .sort((a, b) => {
      const timeA = a.article.createdAt ? new Date(a.article.createdAt).getTime() : a.mtime;
      const timeB = b.article.createdAt ? new Date(b.article.createdAt).getTime() : b.mtime;
      return timeB - timeA;
    })
    .map(a => a.article);
}

export function getArticlesByTicker(ticker: string): Article[] {
  const upper = ticker.toUpperCase();
  return getAllArticles().filter(a => {
    if (a.ticker?.toUpperCase() === upper) return true;
    if (a.content?.candidates?.some(c => c.ticker?.toUpperCase() === upper)) return true;
    return false;
  });
}

export function getPrimaryArticlesByTicker(ticker: string): Article[] {
  const upper = ticker.toUpperCase();
  return getAllArticles().filter(article => article.ticker?.toUpperCase() === upper);
}

export function getAllArticleTickers(): { ticker: string; company: string; articleCount: number }[] {
  const articles = getAllArticles().filter(isIndexableArticle);
  const tickerMap = new Map<string, { company: string; count: number }>();

  for (const a of articles) {
    if (a.ticker) {
      const t = a.ticker.toUpperCase();
      const existing = tickerMap.get(t);
      tickerMap.set(t, {
        company: existing?.company || a.content?.candidates?.find(c => c.ticker?.toUpperCase() === t)?.company || t,
        count: (existing?.count || 0) + 1,
      });
    }
    if (a.content?.candidates) {
      for (const c of a.content.candidates) {
        if (c.ticker) {
          const t = c.ticker.toUpperCase();
          const existing = tickerMap.get(t);
          tickerMap.set(t, {
            company: c.company || existing?.company || t,
            count: (existing?.count || 0) + 1,
          });
        }
      }
    }
  }

  return Array.from(tickerMap.entries())
    .map(([ticker, { company, count }]) => ({ ticker, company, articleCount: count }))
    .sort((a, b) => b.articleCount - a.articleCount);
}

/**
 * Legacy generation backlog. New editorial content uses the independent
 * verifier and approval workflow instead of this boolean-only check.
 */
export function getUncheckedCount(): number {
  let count = 0;
  for (const type of ['roasts', 'picks'] as const) {
    const dir = path.join(CONTENT_DIR, type);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
        if (!data.factChecked) count++;
      } catch { /* skip */ }
    }
  }
  return count;
}

export function saveArticle(article: Article): void {
  if (!article.createdAt) {
    article.createdAt = nowEST();
  }
  const type = article.type === 'roast' ? 'roasts' : article.type === 'take' ? 'takes' : 'picks';
  const dir = path.join(CONTENT_DIR, type);
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, `${article.slug}.json`),
      JSON.stringify(article, null, 2)
    );
  } catch {
    // Vercel has a read-only filesystem — skip local save, article is returned via API response
  }
}
