import fs from 'fs';
import path from 'path';
import { Article } from './types';
import { nowEST } from './date';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export function getAllArticles(): Article[] {
  const articles: { article: Article; mtime: number }[] = [];

  for (const type of ['roasts', 'picks'] as const) {
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
  for (const type of ['roasts', 'picks']) {
    const filePath = path.join(CONTENT_DIR, type, `${slug}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  }
  return null;
}

export function getArticlesByType(type: 'roasts' | 'picks'): Article[] {
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

export function saveArticle(article: Article): void {
  if (!article.createdAt) {
    article.createdAt = nowEST();
  }
  const type = article.type === 'roast' ? 'roasts' : 'picks';
  const dir = path.join(CONTENT_DIR, type);
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, `${article.slug}.json`),
      JSON.stringify(article, null, 2)
    );
  } catch (err) {
    throw new Error(`Cannot save article — filesystem is read-only (Vercel). Use "Publish & Save to Repo" instead. ${err}`);
  }
}
