import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { generateRoast, generatePick, generateScreenshotRoast, generateScreenshotPick, generateTake } from '@/lib/ai/generate';
import { saveArticle } from '@/lib/content';
import { Article } from '@/lib/types';
import { timingSafeCompare, verifySession } from '@/lib/auth';
import { registerArticleTickers } from '@/lib/ticker-registry';
import { updateProfileFromArticle, ProfileUpdate } from '@/lib/stock-data';
import { todayEST } from '@/lib/date';

export async function POST(req: NextRequest) {
  // Rate limit: 5 requests per minute (costs money)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`generate:${ip}`, 5, 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

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
      const today = todayEST();
      const tickerSlug = ticker.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const slug = `${tickerSlug}-roast-${today}`;

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

      // Update all candidate profiles from article data
      const profileUpdates: ProfileUpdate[] = [];
      try {
        const candidates = result.content.candidates || [];
        for (const c of candidates) {
          if (c.ticker && result.content.dataPoints?.length > 0) {
            const updates = updateProfileFromArticle(c.ticker, result.content.dataPoints, c.company);
            profileUpdates.push(...updates);
          }
        }
      } catch (e) {
        console.log(`[Profile Update] Failed for roast candidates:`, e instanceof Error ? e.message : e);
      }

      return NextResponse.json({
        success: true,
        slug,
        article,
        newTickers,
        profileUpdates,
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
      const today = todayEST();
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

      // Update all candidate profiles from article data
      const profileUpdates: ProfileUpdate[] = [];
      try {
        const candidates = result.content.candidates || [];
        for (const c of candidates) {
          if (c.ticker && result.content.dataPoints?.length > 0) {
            const updates = updateProfileFromArticle(c.ticker, result.content.dataPoints, c.company);
            profileUpdates.push(...updates);
          }
        }
      } catch (e) {
        console.log(`[Profile Update] Failed for pick candidates:`, e instanceof Error ? e.message : e);
      }

      return NextResponse.json({
        success: true,
        slug,
        article,
        newTickers,
        profileUpdates,
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
    const { images, source, ticker: inputTicker, textData } = body;
    const hasMedia = images && Array.isArray(images) && images.length > 0;
    const hasText = textData && typeof textData === 'string' && textData.trim().length > 0;
    if (!hasMedia && !hasText) {
      return NextResponse.json({ error: 'Provide at least one screenshot, PDF, or pasted data' }, { status: 400 });
    }

    try {
      const result = await generateScreenshotRoast(images || [], source, textData);
      const today = todayEST();
      const ticker = inputTicker || result.content.candidates?.[0]?.ticker || 'unknown';
      const tickerSlug = ticker.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const slug = `${tickerSlug}-roast-${today}`;

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

      // Update ALL candidate ticker profiles from screenshot data
      const profileUpdates: ProfileUpdate[] = [];
      try {
        const candidates = result.content.candidates || [];
        for (const c of candidates) {
          if (c.ticker && result.content.dataPoints?.length > 0) {
            const updates = updateProfileFromArticle(c.ticker, result.content.dataPoints, c.company);
            profileUpdates.push(...updates);
          }
        }
      } catch (e) {
        console.log(`[Profile Update] Failed for roast candidates:`, e instanceof Error ? e.message : e);
      }

      return NextResponse.json({
        success: true,
        slug,
        article,
        newTickers,
        profileUpdates,
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
    const { images, topic, textData } = body;
    const hasMedia = images && Array.isArray(images) && images.length > 0;
    const hasText = textData && typeof textData === 'string' && textData.trim().length > 0;
    if (!hasMedia && !hasText) {
      return NextResponse.json({ error: 'Provide at least one screenshot, PDF, or pasted data' }, { status: 400 });
    }
    if (images && images.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 files for screenshot pick' }, { status: 400 });
    }

    try {
      const result = await generateScreenshotPick(images || [], topic, textData);
      const today = todayEST();
      const winnerTicker = result.content.winner?.ticker ? `-${result.content.winner.ticker.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
      const topicSlug = topic ? `-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40)}` : '';
      const slug = `ai-pick${winnerTicker}${topicSlug}-${today}`;

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

      // Update all candidate ticker profiles from screenshot data
      const profileUpdates: ProfileUpdate[] = [];
      try {
        const candidates = result.content.candidates || [];
        for (const c of candidates) {
          if (c.ticker && result.content.dataPoints?.length > 0) {
            const updates = updateProfileFromArticle(c.ticker, result.content.dataPoints, c.company);
            profileUpdates.push(...updates);
          }
        }
      } catch (e) {
        console.log(`[Profile Update] Failed for pick candidates:`, e instanceof Error ? e.message : e);
      }

      return NextResponse.json({
        success: true,
        slug,
        article,
        newTickers,
        profileUpdates,
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

  if (type === 'take') {
    const { newsText, source } = body;
    if (!newsText || typeof newsText !== 'string' || newsText.trim().length < 10) {
      return NextResponse.json({ error: 'Provide news text to summarize (min 10 chars)' }, { status: 400 });
    }

    try {
      const result = await generateTake(newsText, source);
      const today = todayEST();
      const topicSlug = result.content.headline
        ? result.content.headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50)
        : 'news';
      const slug = `take-${topicSlug}-${today}`;

      const article: Article = {
        slug,
        type: 'take',
        title: result.content.headline,
        description: result.content.summary,
        date: today,
        ticker: undefined,
        verdict: result.content.finalVerdict,
        tags: ['news', 'take', 'market update'],
        content: {
          ...result.content,
          newsSource: source || undefined,
        },
      };

      saveArticle(article);

      return NextResponse.json({
        success: true,
        slug,
        article,
        newTickers: [],
        profileUpdates: [],
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

  return NextResponse.json({ error: 'Invalid type. Use "roast", "pick", "screenshot-roast", "screenshot-pick", or "take".' }, { status: 400 });
}
