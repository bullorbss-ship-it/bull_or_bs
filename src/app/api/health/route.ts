import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { getAllArticles } from '@/lib/content';

const startTime = Date.now();

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`health:${ip}`, 100, 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

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
