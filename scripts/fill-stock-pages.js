#!/usr/bin/env node

/**
 * Fill/refresh stock & ETF profiles using OpenRouter (free) or OpenAI fallback.
 * Usage: OPENROUTER_API_KEY=xxx node scripts/fill-stock-pages.js [--force]
 *        OPENAI_API_KEY=xxx node scripts/fill-stock-pages.js [--force]
 * Cost: $0 (OpenRouter free) or ~$0.02 (OpenAI)
 * --force: regenerate all profiles even if they exist
 */

const fs = require('fs');
const path = require('path');

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENROUTER_KEY && !OPENAI_KEY) {
  console.error('Set OPENROUTER_API_KEY (free) or OPENAI_API_KEY env var');
  process.exit(1);
}

const provider = OPENROUTER_KEY ? 'openrouter' : 'openai';
console.log(`Using provider: ${provider}${provider === 'openrouter' ? ' (free)' : ''}`);

const DATA_DIR = path.join(__dirname, '..', 'data', 'stocks');
const DELAY_MS = provider === 'openrouter' ? 800 : 500; // slightly slower for free tier

// OpenRouter free models in priority order
const OPENROUTER_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-32b:free',
];

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

Be factual. Use your training data. Do not make up specific current prices — use approximate ranges or say "as of early 2025" etc. Output ONLY the JSON object, nothing else.`;

async function generateViaOpenRouter(ticker) {
  for (const model of OPENROUTER_MODELS) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'HTTP-Referer': 'https://bullorbs.com',
          'X-Title': 'BullOrBS',
        },
        body: JSON.stringify({
          model,
          max_tokens: 2000,
          messages: [{ role: 'user', content: PROMPT_TEMPLATE(ticker) }],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.log(`  [${model}] ${res.status}: ${err.slice(0, 80)}`);
        continue;
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) continue;

      return { text, model };
    } catch (err) {
      console.log(`  [${model}] error: ${err.message.slice(0, 60)}`);
      continue;
    }
  }
  throw new Error('All OpenRouter models failed');
}

async function generateViaOpenAI(ticker) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: PROMPT_TEMPLATE(ticker) }],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('No text in response');
  return { text, model: 'gpt-4o-mini' };
}

function parseJSON(text) {
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  // Some models wrap in <think> tags — strip those
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '');
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
  const forceAll = process.argv.includes('--force');

  let success = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < tickers.length; i++) {
    const t = tickers[i];
    const slug = t.ticker.toLowerCase().replace(/\./g, '-');
    const filePath = path.join(DATA_DIR, `${slug}.json`);

    if (!forceAll && fs.existsSync(filePath)) {
      console.log(`  [${i + 1}/${tickers.length}] SKIP ${t.ticker} (exists)`);
      success++;
      continue;
    }

    try {
      process.stdout.write(`  [${i + 1}/${tickers.length}] ${t.ticker} (${t.company})... `);

      const { text, model } = provider === 'openrouter'
        ? await generateViaOpenRouter(t)
        : await generateViaOpenAI(t);

      const stockData = parseJSON(text);
      stockData.generatedAt = new Date().toISOString();
      stockData.generatedBy = model;
      fs.writeFileSync(filePath, JSON.stringify(stockData, null, 2));
      console.log(`OK [${model.split('/').pop()}]`);
      success++;
    } catch (err) {
      console.log(`FAIL: ${err.message.slice(0, 80)}`);
      errors.push({ ticker: t.ticker, error: err.message });
      failed++;
    }

    if (i < tickers.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\nDone: ${success} success, ${failed} failed out of ${tickers.length}`);
  console.log(`Provider: ${provider} | Cost: ${provider === 'openrouter' ? '$0' : '~$0.02'}`);
  if (errors.length > 0) {
    console.log('\nFailed tickers:');
    errors.forEach(e => console.log(`  ${e.ticker}: ${e.error.slice(0, 100)}`));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
