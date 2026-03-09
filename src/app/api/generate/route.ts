import { NextRequest, NextResponse } from 'next/server';
import { generateRoast, generatePick } from '@/lib/ai/generate';
import { saveArticle } from '@/lib/content';
import { Article } from '@/lib/types';
import { timingSafeCompare, verifySession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  // Auth: accept either SCAN_SECRET query param or admin session cookie
  const secret = req.nextUrl.searchParams.get('secret') || '';
  const hasSecret = timingSafeCompare(secret, process.env.SCAN_SECRET || '');
  const hasSession = verifySession(req);

  if (!hasSecret && !hasSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { type } = body;

  if (type === 'roast') {
    const { claim, ticker, source } = body;
    if (!claim || !ticker) {
      return NextResponse.json({ error: 'Missing claim or ticker' }, { status: 400 });
    }

    try {
      const result = await generateRoast(claim, ticker, source || 'Popular financial publication');
      const today = new Date().toISOString().split('T')[0];
      const slug = `${ticker.toLowerCase()}-roast-${today}`;

      const article: Article = {
        slug,
        type: 'roast',
        title: result.content.headline,
        description: result.content.summary,
        date: today,
        ticker: ticker.toUpperCase(),
        verdict: result.content.finalVerdict,
        tags: [ticker.toUpperCase(), 'roast', 'stock analysis', 'AI analysis'],
        content: result.content,
      };

      saveArticle(article);
      return NextResponse.json({
        success: true,
        slug,
        article,
        cost: {
          usd: result.costUsd,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          apiCalls: result.apiCalls,
          durationMs: result.durationMs,
          model: 'claude-haiku-4-5-20251001',
          dataConfidence: result.dataConfidence,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Generation failed', detail: message }, { status: 500 });
    }
  }

  if (type === 'pick') {
    try {
      const result = await generatePick();
      const today = new Date().toISOString().split('T')[0];
      const slug = `ai-pick-${today}`;

      const article: Article = {
        slug,
        type: 'pick',
        title: result.content.headline,
        description: result.content.summary,
        date: today,
        ticker: result.content.winner?.ticker,
        verdict: result.content.finalVerdict,
        confidence: typeof result.content.winner?.score === 'number' ? result.content.winner.score : result.content.winner?.score ? parseFloat(String(result.content.winner.score)) : undefined,
        tags: [
          result.content.winner?.ticker || '',
          'AI pick',
          'stock analysis',
          'weekly pick',
        ].filter(Boolean),
        content: result.content,
      };

      saveArticle(article);
      return NextResponse.json({
        success: true,
        slug,
        article,
        cost: {
          usd: result.costUsd,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          apiCalls: result.apiCalls,
          durationMs: result.durationMs,
          model: 'claude-haiku-4-5-20251001',
          dataConfidence: result.dataConfidence,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Generation failed', detail: message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid type. Use "roast" or "pick".' }, { status: 400 });
}
