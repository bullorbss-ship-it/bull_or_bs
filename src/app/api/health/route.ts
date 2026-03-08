import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/content';

const startTime = Date.now();

export async function GET() {
  const articles = getAllArticles();
  const roasts = articles.filter(a => a.type === 'roast');
  const picks = articles.filter(a => a.type === 'pick');
  const lastArticle = articles[0];

  return NextResponse.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime_ms: Date.now() - startTime,
    content: {
      total_articles: articles.length,
      roasts: roasts.length,
      picks: picks.length,
      last_published: lastArticle?.date || null,
    },
  });
}
