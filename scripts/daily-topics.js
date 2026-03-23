#!/usr/bin/env node
/**
 * Daily Topics Email — sends 4 content topic suggestions every morning.
 *
 * Topics:
 *   2 × AI Pick (themed tournament with 8-12 ticker candidates)
 *   1 × Roast target (specific ticker + which publication recommended it)
 *   1 × News take (trending/viral market topic for today)
 *
 * Usage:
 *   node scripts/daily-topics.js              # send email
 *   node scripts/daily-topics.js --dry-run    # print to console, no email
 *
 * Env vars:
 *   ANTHROPIC_API_KEY   — Claude API key
 *   GMAIL_APP_PASSWORD  — Gmail app password (not regular password)
 *   DAILY_EMAIL_TO      — recipient email
 *   DAILY_EMAIL_FROM    — sender email (default: bull.or.bss@gmail.com)
 */

const https = require('https');
const nodemailer = require('nodemailer');

const dryRun = process.argv.includes('--dry-run');

// ─── Config ───────────────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const EMAIL_TO = process.env.DAILY_EMAIL_TO;
const EMAIL_FROM = process.env.DAILY_EMAIL_FROM || 'bull.or.bss@gmail.com';

if (!ANTHROPIC_API_KEY) { console.error('Missing ANTHROPIC_API_KEY'); process.exit(1); }
if (!dryRun && !GMAIL_APP_PASSWORD) { console.error('Missing GMAIL_APP_PASSWORD'); process.exit(1); }
if (!dryRun && !EMAIL_TO) { console.error('Missing DAILY_EMAIL_TO'); process.exit(1); }

// ─── RSS Feed Fetching ───────────────────────────────────────────────────────

const RSS_FEEDS = [
  'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US',
  'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114',
  'https://feeds.reuters.com/reuters/businessNews',
  'https://feeds.bloomberg.com/markets/news.rss',
];

function fetchUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'BullOrBS/1.0' }, timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

function extractHeadlines(xml) {
  const headlines = [];
  const titleRegex = /<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/g;
  let match;
  while ((match = titleRegex.exec(xml)) !== null) {
    const title = (match[1] || match[2] || '').trim();
    // Skip generic feed titles
    if (title && title.length > 15 && !title.includes('Yahoo') && !title.includes('CNBC') && !title.includes('Reuters') && !title.includes('Bloomberg')) {
      headlines.push(title);
    }
  }
  return headlines;
}

async function getMarketHeadlines() {
  console.log('Fetching market headlines...');
  const results = await Promise.all(RSS_FEEDS.map(fetchUrl));
  const allHeadlines = results.flatMap(extractHeadlines);
  // Deduplicate and take top 25
  const unique = [...new Set(allHeadlines)].slice(0, 25);
  console.log(`  Got ${unique.length} headlines`);
  return unique;
}

// ─── Claude API ──────────────────────────────────────────────────────────────

function callClaude(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.content && parsed.content[0]) {
            resolve(parsed.content[0].text);
          } else {
            reject(new Error(`Unexpected API response: ${data.substring(0, 200)}`));
          }
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Topic Generation ────────────────────────────────────────────────────────

function buildPrompt(headlines, dateStr) {
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

function formatEmail(topics, dateStr) {
  const data = JSON.parse(topics);

  let html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; color: #1a1a2e;">
  <div style="background: #0F172A; padding: 24px 28px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #10B981; margin: 0; font-size: 22px;">
      Bull Or BS — Daily Topics
    </h1>
    <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">${dateStr}</p>
  </div>
  <div style="border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; padding: 0;">`;

  // Pick 1
  html += formatPick(data.picks[0], 1);
  // Pick 2
  html += formatPick(data.picks[1], 2);
  // Roast
  html += formatRoast(data.roast);
  // Take
  html += formatTake(data.take);

  html += `
    <div style="padding: 16px 28px; background: #f8fafc; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="color: #94a3b8; font-size: 11px; margin: 0;">Auto-generated by BullOrBS daily pipeline</p>
    </div>
  </div>
</div>`;

  return { html, data };
}

function formatPick(pick, num) {
  return `
    <div style="padding: 20px 28px; border-bottom: 1px solid #e2e8f0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="background: #10B981; color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; font-family: monospace;">PICK ${num}</span>
      </div>
      <h2 style="margin: 0 0 6px; font-size: 17px; color: #0F172A;">${pick.theme}</h2>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 10px; line-height: 1.5;">${pick.why_now}</p>
      <p style="margin: 0 0 6px; font-size: 12px; color: #94a3b8; font-family: monospace;">TICKERS:</p>
      <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #0F172A; font-family: monospace; letter-spacing: 0.5px;">${pick.tickers.join(' · ')}</p>
      <p style="color: #64748b; font-size: 12px; margin: 0; font-style: italic;">Angle: ${pick.angle}</p>
    </div>`;
}

function formatRoast(roast) {
  return `
    <div style="padding: 20px 28px; border-bottom: 1px solid #e2e8f0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="background: #EF4444; color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; font-family: monospace;">ROAST</span>
        <span style="font-family: monospace; font-size: 14px; font-weight: 700; color: #0F172A;">${roast.ticker}</span>
      </div>
      <h2 style="margin: 0 0 6px; font-size: 17px; color: #0F172A;">${roast.company}</h2>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px; line-height: 1.5;">
        <strong>${roast.publication}</strong> says: "${roast.claim}"
      </p>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px; line-height: 1.5;">${roast.why_roast}</p>
      <p style="color: #94a3b8; font-size: 11px; margin: 0; font-family: monospace;">Search: ${roast.research_hint}</p>
    </div>`;
}

function formatTake(take) {
  return `
    <div style="padding: 20px 28px; border-bottom: 1px solid #e2e8f0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="background: #F59E0B; color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; font-family: monospace;">NEWS TAKE</span>
      </div>
      <h2 style="margin: 0 0 6px; font-size: 17px; color: #0F172A;">${take.suggested_headline}</h2>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px; line-height: 1.5;">${take.why_viral}</p>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px; line-height: 1.5;"><strong>Angle:</strong> ${take.angle}</p>
      <p style="color: #94a3b8; font-size: 12px; margin: 0; font-family: monospace;">Sources: ${take.key_sources.join(', ')}</p>
    </div>`;
}

// ─── Email Sending ───────────────────────────────────────────────────────────

async function sendEmail(subject, html) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_FROM,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"BullOrBS Topics" <${EMAIL_FROM}>`,
    to: EMAIL_TO,
    subject,
    html,
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Toronto',
  });

  console.log(`\nDaily Topics — ${dateStr}\n`);

  // 1. Fetch headlines
  const headlines = await getMarketHeadlines();

  // 2. Generate topics via Claude
  console.log('Generating topics via Haiku...');
  const prompt = buildPrompt(headlines, dateStr);
  const raw = await callClaude(prompt);

  // Extract JSON from response
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Failed to extract JSON from Claude response');
    console.error(raw.substring(0, 500));
    process.exit(1);
  }

  const topicsJson = jsonMatch[0];

  // Validate it parses
  try {
    JSON.parse(topicsJson);
  } catch (e) {
    console.error('Invalid JSON from Claude:', e.message);
    console.error(topicsJson.substring(0, 500));
    process.exit(1);
  }

  // 3. Format email
  const { html, data } = formatEmail(topicsJson, dateStr);

  console.log('\n--- TOPICS ---');
  console.log(`PICK 1: ${data.picks[0].theme}`);
  console.log(`  Tickers: ${data.picks[0].tickers.join(', ')}`);
  console.log(`PICK 2: ${data.picks[1].theme}`);
  console.log(`  Tickers: ${data.picks[1].tickers.join(', ')}`);
  console.log(`ROAST: ${data.roast.ticker} (${data.roast.company}) — ${data.roast.publication}`);
  console.log(`TAKE: ${data.take.suggested_headline}`);

  // 4. Send or print
  if (dryRun) {
    console.log('\n[DRY RUN] Email not sent. HTML preview:');
    console.log(html);
  } else {
    console.log('\nSending email...');
    const subject = `BullOrBS Topics — ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Toronto' })}`;
    await sendEmail(subject, html);
    console.log(`Email sent to ${EMAIL_TO}`);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
