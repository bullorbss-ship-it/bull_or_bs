import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai/providers';
import { BRACKET_PROMPT } from '@/lib/ai/prompts';
import { parseArticleContent } from '@/lib/ai/parse';
import { buildIdentityOnlySheet } from '@/lib/ai/ticker-profiles';
import { logCost } from '@/lib/costs';
import { todayEST } from '@/lib/date';

export async function POST(req: NextRequest) {
  // Feature flag
  if (process.env.ENABLE_BRACKET !== 'true') {
    return NextResponse.json({ error: 'Bracket feature is not enabled.' }, { status: 404 });
  }

  // Rate limit: 2 per minute per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`bracket:${ip}`, 2, 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 });
  }

  // Global daily cap: 50 brackets/day
  const today = todayEST();
  if (!rateLimit(`bracket:global:${today}`, 50, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Daily bracket limit reached. Try again tomorrow.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { tickers } = body;

    // Validate tickers
    if (!Array.isArray(tickers) || tickers.length < 2 || tickers.length > 16) {
      return NextResponse.json({ error: 'Provide 2-16 tickers.' }, { status: 400 });
    }

    const validTickers: string[] = [];
    for (const t of tickers) {
      if (typeof t !== 'string') continue;
      const cleaned = t.trim().toUpperCase();
      if (!/^[A-Z0-9.\-]{1,12}$/.test(cleaned)) continue;
      if (!validTickers.includes(cleaned)) validTickers.push(cleaned);
    }

    if (validTickers.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 valid tickers.' }, { status: 400 });
    }

    const start = Date.now();

    // Build identity reference (no metrics to prevent leakage)
    const referenceSheet = buildIdentityOnlySheet();

    const userMessage = `Today is ${today}.

${referenceSheet ? `${referenceSheet}\n` : ''}

The user wants to compare these ${validTickers.length} stocks/ETFs in a tournament bracket:
${validTickers.join(', ')}

Run your elimination tournament comparing ONLY these tickers. Crown a winner. If a ticker is not in the reference sheet above, use your training knowledge but note it.

Return ONLY valid JSON.`;

    const response = await callAI(BRACKET_PROMPT, userMessage, 6000);

    const durationMs = Date.now() - start;

    logCost({
      date: today,
      type: 'pick', // closest existing type
      ticker: validTickers.join(','),
      model: response.model || 'unknown',
      inputTokens: response.inputTokens || 0,
      outputTokens: response.outputTokens || 0,
      costUsd: response.costUsd || 0,
      fmpCalls: 0,
      durationMs,
    });

    const content = parseArticleContent(response.text);

    return NextResponse.json({
      content,
      tickers: validTickers,
      costUsd: response.costUsd || 0,
      durationMs,
    });
  } catch (error) {
    console.error('Bracket generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate bracket. Try again.' },
      { status: 500 }
    );
  }
}
