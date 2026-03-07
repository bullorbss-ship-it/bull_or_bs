import { NextRequest, NextResponse } from 'next/server';
import { generateRoast, generatePick } from '@/lib/ai/generate';
import { saveArticle } from '@/lib/content';
import { Article } from '@/lib/types';

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.SCAN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { type } = body;

  if (type === 'roast') {
    const { claim, ticker, source } = body;
    if (!claim || !ticker) {
      return NextResponse.json({ error: 'Missing claim or ticker' }, { status: 400 });
    }

    const content = await generateRoast(claim, ticker, source || 'Popular financial publication');
    const today = new Date().toISOString().split('T')[0];
    const slug = `${ticker.toLowerCase()}-roast-${today}`;

    const article: Article = {
      slug,
      type: 'roast',
      title: content.headline,
      description: content.summary,
      date: today,
      ticker: ticker.toUpperCase(),
      verdict: content.finalVerdict,
      tags: [ticker.toUpperCase(), 'roast', 'stock analysis', 'AI analysis'],
      content,
    };

    saveArticle(article);
    return NextResponse.json({ success: true, slug, article });
  }

  if (type === 'pick') {
    const content = await generatePick();
    const today = new Date().toISOString().split('T')[0];
    const ticker = content.winner?.ticker || 'no-pick';
    const slug = `ai-pick-${today}`;

    const article: Article = {
      slug,
      type: 'pick',
      title: content.headline,
      description: content.summary,
      date: today,
      ticker: content.winner?.ticker,
      verdict: content.finalVerdict,
      confidence: content.winner?.score,
      tags: [
        ticker !== 'no-pick' ? ticker : '',
        'AI pick',
        'stock analysis',
        'weekly pick',
      ].filter(Boolean),
      content,
    };

    saveArticle(article);
    return NextResponse.json({ success: true, slug, article });
  }

  return NextResponse.json({ error: 'Invalid type. Use "roast" or "pick".' }, { status: 400 });
}
