#!/usr/bin/env node

/**
 * Generate stock/ETF profiles using Claude Haiku via Anthropic API.
 * Usage: ANTHROPIC_API_KEY=xxx node scripts/fill-etf-profiles.js
 * Cost: ~$0.01 for 30 ETFs (Haiku 4.5)
 */

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('Set ANTHROPIC_API_KEY env var');
  process.exit(1);
}

const DATA_DIR = path.join(__dirname, '..', 'data', 'stocks');
const DELAY_MS = 300;

// Read tickers from source
const tickersFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'tickers.ts'), 'utf8');
const tickers = [];
const regex = /\{\s*ticker:\s*'([^']+)',\s*company:\s*'([^']+)',\s*exchange:\s*'([^']+)',\s*sector:\s*'([^']+)',\s*country:\s*'([^']+)'/g;
let match;
while ((match = regex.exec(tickersFile)) !== null) {
  tickers.push({ ticker: match[1], company: match[2], exchange: match[3], sector: match[4], country: match[5] });
}

console.log(`Found ${tickers.length} tickers`);

const PROMPT_TEMPLATE = (t) => `You are a stock/ETF analyst writing for BullOrBS, an AI-driven stock analysis site.

Generate a profile for ${t.company} (${t.ticker}) on the ${t.exchange}.
${t.sector === 'ETF' ? 'This is an ETF. Focus on what the ETF tracks, its strategy, holdings, fees, and suitability for different investors.' : ''}

Output ONLY valid JSON with this exact structure:
{
  "ticker": "${t.ticker}",
  "company": "${t.company}",
  "exchange": "${t.exchange}",
  "sector": "${t.sector}",
  "country": "${t.country}",
  "overview": "2-3 paragraph overview. What it ${t.sector === 'ETF' ? 'tracks/holds, strategy, key features' : 'does, market position, recent developments'}.",
  "bullCase": ["3 bullet points for why ${t.sector === 'ETF' ? 'this ETF is worth holding' : 'the stock could go up'}"],
  "bearCase": ["3 bullet points for ${t.sector === 'ETF' ? 'risks and drawbacks' : 'why the stock could go down'}"],
  "keyMetrics": {
    "marketCap": "${t.sector === 'ETF' ? 'approximate AUM string' : 'approximate market cap string'}",
    "peRatio": "${t.sector === 'ETF' ? 'MER/expense ratio string' : 'approximate P/E ratio string or N/A'}",
    "dividendYield": "approximate yield string or N/A",
    "sector": "${t.sector}"
  },
  "analystSummary": "1-2 sentences summarizing the general consensus",
  "seoDescription": "A 150-character meta description targeting 'should I buy ${t.ticker}' and '${t.ticker} ${t.sector === 'ETF' ? 'ETF' : 'stock'} analysis'"
}

Be factual. Use approximate ranges. Output ONLY the JSON object, nothing else.`;

async function generateProfile(ticker) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: PROMPT_TEMPLATE(ticker) }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error('No text in response');

  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');

  let jsonStr = jsonMatch[0].replace(/,\s*([}\]])/g, '$1');
  return JSON.parse(jsonStr);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Only generate for tickers that don't have profiles yet
  const missing = tickers.filter(t => {
    const slug = t.ticker.toLowerCase().replace(/\./g, '-');
    return !fs.existsSync(path.join(DATA_DIR, `${slug}.json`));
  });

  console.log(`${missing.length} profiles to generate (${tickers.length - missing.length} already exist)`);

  let success = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < missing.length; i++) {
    const t = missing[i];
    const slug = t.ticker.toLowerCase().replace(/\./g, '-');
    const filePath = path.join(DATA_DIR, `${slug}.json`);

    try {
      process.stdout.write(`  [${i + 1}/${missing.length}] ${t.ticker} (${t.company})... `);
      const profileData = await generateProfile(t);
      profileData.generatedAt = new Date().toISOString();
      profileData.generatedBy = 'claude-haiku-4.5';
      fs.writeFileSync(filePath, JSON.stringify(profileData, null, 2));
      console.log('OK');
      success++;
    } catch (err) {
      console.log(`FAIL: ${err.message.slice(0, 80)}`);
      errors.push({ ticker: t.ticker, error: err.message });
      failed++;
    }

    if (i < missing.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\nDone: ${success} success, ${failed} failed out of ${missing.length}`);
  if (errors.length > 0) {
    console.log('\nFailed tickers:');
    errors.forEach(e => console.log(`  ${e.ticker}: ${e.error.slice(0, 100)}`));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
