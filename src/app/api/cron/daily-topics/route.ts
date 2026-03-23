import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import Anthropic from '@anthropic-ai/sdk';

// Vercel cron auth: only allow requests with the CRON_SECRET header
// or from Vercel's cron system (which sends Authorization: Bearer <CRON_SECRET>)
function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

// ─── RSS Feed Fetching ───────────────────────────────────────────────────────

const RSS_FEEDS = [
  'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US',
  'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114',
  'https://feeds.reuters.com/reuters/businessNews',
];

async function fetchHeadlines(): Promise<string[]> {
  const results = await Promise.all(
    RSS_FEEDS.map(async (url) => {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'BullOrBS/1.0' },
          signal: AbortSignal.timeout(8000),
        });
        return await res.text();
      } catch {
        return '';
      }
    })
  );

  const headlines: string[] = [];
  const titleRegex = /<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/g;

  for (const xml of results) {
    let match;
    while ((match = titleRegex.exec(xml)) !== null) {
      const title = (match[1] || match[2] || '').trim();
      if (title && title.length > 15 && !title.includes('Yahoo') && !title.includes('CNBC') && !title.includes('Reuters')) {
        headlines.push(title);
      }
    }
  }

  return [...new Set(headlines)].slice(0, 25);
}

// ─── Topic Generation ────────────────────────────────────────────────────────

function buildPrompt(headlines: string[], dateStr: string): string {
  return `You are a content strategist for BullOrBS (bullorbs.com) — an AI-driven stock analysis site targeting Canadian and US retail investors. Your audience is young investors (20-35) who want plain-English analysis.

TODAY'S DATE: ${dateStr}

TODAY'S MARKET HEADLINES (from RSS feeds):
${headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Generate exactly 4 content topics for today. Return ONLY valid JSON matching this structure:

{
  "picks": [
    {
      "theme": "string — catchy tournament theme (e.g., 'Best AI Defense Stock for 2026')",
      "why_now": "string — 1-2 sentences on why this topic is timely today",
      "tickers": ["string — 8-12 ticker symbols to compare"],
      "angle": "string — the specific question the tournament should answer"
    },
    {
      "theme": "string — second pick theme, different sector/angle from first",
      "why_now": "string — 1-2 sentences on why this topic is timely today",
      "tickers": ["string — 8-12 ticker symbols to compare"],
      "angle": "string — the specific question the tournament should answer"
    }
  ],
  "roast": {
    "ticker": "string — specific stock ticker to roast",
    "company": "string — company name",
    "publication": "string — which publication recently recommended it (Motley Fool, Seeking Alpha, Zacks, etc.)",
    "claim": "string — paraphrase of what the publication said",
    "why_roast": "string — why this recommendation deserves scrutiny right now",
    "research_hint": "string — what to Google to find the original article"
  },
  "take": {
    "topic": "string — the trending news story to cover",
    "why_viral": "string — why this will get clicks/shares today",
    "angle": "string — the BullOrBS angle: how does this affect everyday investors?",
    "key_sources": ["string — 2-3 publication names to pull research from"],
    "suggested_headline": "string — punchy headline for the article"
  }
}

RULES:
- Pick topics should cover DIFFERENT sectors (don't do two tech tournaments)
- At least one pick should have Canadian/TSX tickers
- The roast should target a REAL, recent recommendation from a major financial publication
- The news take should be about something happening TODAY or THIS WEEK — not stale news
- All tickers must be real, actively traded stocks or ETFs
- Think about what would perform well on Reddit (r/CanadianInvestor, r/stocks) and X
- Prioritize topics with high search volume: "should I buy X", "X vs Y", "best X stock 2026"`;
}

// ─── Email Formatting ────────────────────────────────────────────────────────

interface Pick { theme: string; why_now: string; tickers: string[]; angle: string; }
interface Roast { ticker: string; company: string; publication: string; claim: string; why_roast: string; research_hint: string; }
interface Take { topic: string; why_viral: string; angle: string; key_sources: string[]; suggested_headline: string; }
interface Topics { picks: Pick[]; roast: Roast; take: Take; }

function formatEmail(topics: Topics, dateStr: string): string {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; color: #1a1a2e;">
  <div style="background: #0F172A; padding: 24px 28px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #10B981; margin: 0; font-size: 22px;">Bull Or BS — Daily Topics</h1>
    <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">${dateStr}</p>
  </div>
  <div style="border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; padding: 0;">
    ${formatPick(topics.picks[0], 1)}
    ${formatPick(topics.picks[1], 2)}
    ${formatRoast(topics.roast)}
    ${formatTake(topics.take)}
    <div style="padding: 16px 28px; background: #f8fafc; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="color: #94a3b8; font-size: 11px; margin: 0;">Auto-generated by BullOrBS daily pipeline</p>
    </div>
  </div>
</div>`;
}

function formatPick(pick: Pick, num: number): string {
  return `
    <div style="padding: 20px 28px; border-bottom: 1px solid #e2e8f0;">
      <span style="background: #10B981; color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; font-family: monospace;">PICK ${num}</span>
      <h2 style="margin: 8px 0 6px; font-size: 17px; color: #0F172A;">${pick.theme}</h2>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 10px; line-height: 1.5;">${pick.why_now}</p>
      <p style="margin: 0 0 6px; font-size: 12px; color: #94a3b8; font-family: monospace;">TICKERS:</p>
      <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #0F172A; font-family: monospace; letter-spacing: 0.5px;">${pick.tickers.join(' · ')}</p>
      <p style="color: #64748b; font-size: 12px; margin: 0; font-style: italic;">Angle: ${pick.angle}</p>
    </div>`;
}

function formatRoast(roast: Roast): string {
  return `
    <div style="padding: 20px 28px; border-bottom: 1px solid #e2e8f0;">
      <span style="background: #EF4444; color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; font-family: monospace;">ROAST</span>
      <span style="font-family: monospace; font-size: 14px; font-weight: 700; color: #0F172A; margin-left: 8px;">${roast.ticker}</span>
      <h2 style="margin: 8px 0 6px; font-size: 17px; color: #0F172A;">${roast.company}</h2>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px; line-height: 1.5;">
        <strong>${roast.publication}</strong> says: &quot;${roast.claim}&quot;
      </p>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px; line-height: 1.5;">${roast.why_roast}</p>
      <p style="color: #94a3b8; font-size: 11px; margin: 0; font-family: monospace;">Search: ${roast.research_hint}</p>
    </div>`;
}

function formatTake(take: Take): string {
  return `
    <div style="padding: 20px 28px; border-bottom: 1px solid #e2e8f0;">
      <span style="background: #F59E0B; color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; font-family: monospace;">NEWS TAKE</span>
      <h2 style="margin: 8px 0 6px; font-size: 17px; color: #0F172A;">${take.suggested_headline}</h2>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px; line-height: 1.5;">${take.why_viral}</p>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px; line-height: 1.5;"><strong>Angle:</strong> ${take.angle}</p>
      <p style="color: #94a3b8; font-size: 12px; margin: 0; font-family: monospace;">Sources: ${take.key_sources.join(', ')}</p>
    </div>`;
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function GET(request: Request) {
  // Auth check — Vercel cron sends Authorization: Bearer <CRON_SECRET>
  if (!isAuthorized(request)) {
    const hasCronSecret = !!process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization') || '';
    return NextResponse.json({
      error: 'Unauthorized',
      debug: {
        cronSecretSet: hasCronSecret,
        cronSecretLength: process.env.CRON_SECRET?.length || 0,
        authHeaderPresent: !!authHeader,
        authHeaderPrefix: authHeader.substring(0, 10),
      }
    }, { status: 401 });
  }

  const emailTo = process.env.DAILY_EMAIL_TO;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const emailFrom = process.env.DAILY_EMAIL_FROM || 'bull.or.bss@gmail.com';

  if (!emailTo || !gmailPass) {
    return NextResponse.json({ error: 'Missing DAILY_EMAIL_TO or GMAIL_APP_PASSWORD env vars' }, { status: 500 });
  }

  try {
    // 1. Fetch headlines
    const headlines = await fetchHeadlines();

    // 2. Generate topics via Claude
    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/Toronto',
    });

    const client = new Anthropic();
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: buildPrompt(headlines, dateStr) }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to extract JSON from Claude' }, { status: 500 });
    }

    const topics: Topics = JSON.parse(jsonMatch[0]);

    // 3. Format and send email
    const html = formatEmail(topics, dateStr);
    const shortDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Toronto',
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailFrom, pass: gmailPass },
    });

    await transporter.sendMail({
      from: `"BullOrBS Topics" <${emailFrom}>`,
      to: emailTo,
      subject: `BullOrBS Topics — ${shortDate}`,
      html,
    });

    return NextResponse.json({
      success: true,
      date: dateStr,
      headlines: headlines.length,
      picks: topics.picks.map(p => p.theme),
      roast: `${topics.roast.ticker} (${topics.roast.company})`,
      take: topics.take.suggested_headline,
    });
  } catch (err) {
    console.error('Daily topics error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
