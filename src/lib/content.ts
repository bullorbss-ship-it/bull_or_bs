import fs from 'fs';
import path from 'path';
import { Article } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');

export function getAllArticles(): Article[] {
  const articles: Article[] = [];

  for (const type of ['roasts', 'picks'] as const) {
    const dir = path.join(CONTENT_DIR, type);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      articles.push(data);
    }
  }

  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function saveArticle(article: Article): void {
  const type = article.type === 'roast' ? 'roasts' : 'picks';
  const dir = path.join(CONTENT_DIR, type);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${article.slug}.json`),
    JSON.stringify(article, null, 2)
  );
}
