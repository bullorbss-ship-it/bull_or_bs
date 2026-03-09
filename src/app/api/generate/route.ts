import { NextRequest, NextResponse } from 'next/server';
import { generateRoast, generatePick, generateScreenshotRoast, generateScreenshotPick } from '@/lib/ai/generate';
import { saveArticle } from '@/lib/content';
import { Article } from '@/lib/types';
import { timingSafeCompare, verifySession } from '@/lib/auth';
import { registerArticleTickers } from '@/lib/ticker-registry';

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
      const newTickers = registerArticleTickers(article);
      return NextResponse.json({
        success: true,
        slug,
        article,
        newTickers,
        profileWarnings: result.profileWarnings,
        cost: {
          usd: result.costUsd,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          apiCalls: result.apiCalls,
          durationMs: result.durationMs,
          model: result.model,
          provider: result.provider,
          dataConfidence: result.dataConfidence,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Generation failed', detail: message }, { status: 500 });
    }
  }

  if (type === 'pick') {
    const { topic } = body;
    try {
      const result = await generatePick(topic || undefined);
      const today = new Date().toISOString().split('T')[0];
      const topicSlug = topic ? `-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40)}` : '';
      const slug = `ai-pick${topicSlug}-${today}`;

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
          topic || 'weekly pick',
        ].filter(Boolean),
        content: result.content,
      };

      saveArticle(article);
      const newTickers = registerArticleTickers(article);
      return NextResponse.json({
        success: true,
        slug,
        article,
        newTickers,
        profileWarnings: result.profileWarnings,
        cost: {
          usd: result.costUsd,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          apiCalls: result.apiCalls,
          durationMs: result.durationMs,
          model: result.model,
          provider: result.provider,
          dataConfidence: result.dataConfidence,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Generation failed', detail: message }, { status: 500 });
    }
  }

  if (type === 'screenshot-roast') {
    const { images, source, ticker: inputTicker } = body;
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'Missing images array' }, { status: 400 });
    }

    try {
      const result = await generateScreenshotRoast(images, source);
      const today = new Date().toISOString().split('T')[0];
      const ticker = inputTicker || result.content.candidates?.[0]?.ticker || 'unknown';
      const slug = `${ticker.toLowerCase()}-roast-${today}`;

      const article: Article = {
        slug,
        type: 'roast',
        title: result.content.headline,
        description: result.content.summary,
        date: today,
        ticker: ticker.toUpperCase(),
        verdict: result.content.finalVerdict,
        tags: [ticker.toUpperCase(), 'roast', 'screenshot analysis', 'AI analysis'],
        content: result.content,
      };

      saveArticle(article);
      const newTickers = registerArticleTickers(article);
      return NextResponse.json({
        success: true,
        slug,
        article,
        newTickers,
        profileWarnings: [],
        cost: {
          usd: result.costUsd,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          apiCalls: result.apiCalls,
          durationMs: result.durationMs,
          model: result.model,
          provider: result.provider,
          dataConfidence: result.dataConfidence,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Generation failed', detail: message }, { status: 500 });
    }
  }

  if (type === 'screenshot-pick') {
    const { images, topic } = body;
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'Missing images array' }, { status: 400 });
    }
    if (images.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 images for screenshot pick' }, { status: 400 });
    }

    try {
      const result = await generateScreenshotPick(images, topic);
      const today = new Date().toISOString().split('T')[0];
      const topicSlug = topic ? `-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40)}` : '';
      const slug = `ai-screenshot-pick${topicSlug}-${today}`;

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
          'screenshot analysis',
          topic || 'comparison',
        ].filter(Boolean),
        content: result.content,
      };

      saveArticle(article);
      const newTickers = registerArticleTickers(article);
      return NextResponse.json({
        success: true,
        slug,
        article,
        newTickers,
        profileWarnings: [],
        cost: {
          usd: result.costUsd,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          apiCalls: result.apiCalls,
          durationMs: result.durationMs,
          model: result.model,
          provider: result.provider,
          dataConfidence: result.dataConfidence,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Generation failed', detail: message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid type. Use "roast", "pick", "screenshot-roast", or "screenshot-pick".' }, { status: 400 });
}
