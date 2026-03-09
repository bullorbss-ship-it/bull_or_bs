#!/usr/bin/env node

/**
 * Fill/refresh stock & ETF profiles using Anthropic Haiku (best), OpenRouter (free), or OpenAI fallback.
 * Usage: ANTHROPIC_API_KEY=xxx node scripts/fill-stock-pages.js [--force]    # Best quality (~$0.02)
 *        OPENROUTER_API_KEY=xxx node scripts/fill-stock-pages.js [--force]   # Free ($0)
 *        OPENAI_API_KEY=xxx node scripts/fill-stock-pages.js [--force]       # Fallback (~$0.02)
 * --force: regenerate all profiles even if they exist
 */

const fs = require('fs');
const path = require('path');

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!ANTHROPIC_KEY && !OPENROUTER_KEY && !OPENAI_KEY) {
  console.error('Set ANTHROPIC_API_KEY (best quality), OPENROUTER_API_KEY (free), or OPENAI_API_KEY env var');
  process.exit(1);
}

// Priority: Anthropic (best quality) > OpenRouter (free) > OpenAI (fallback)
const provider = ANTHROPIC_KEY ? 'anthropic' : OPENROUTER_KEY ? 'openrouter' : 'openai';
const COST_LABEL = { anthropic: '~$0.02 (Haiku)', openrouter: '$0 (free)', openai: '~$0.02 (GPT-4o-mini)' };
console.log(`Using provider: ${provider} — ${COST_LABEL[provider]}`);

const DATA_DIR = path.join(__dirname, '..', 'data', 'stocks');
const DELAY_MS = provider === 'openrouter' ? 800 : 500;

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
${t.sector === 'ETF' ? `This is an ETF. Focus on:
- What INDEX it tracks (exact index name)
- Whether it is HEDGED or UNHEDGED (for currency exposure)
- Its actual MER/expense ratio (be precise — e.g. 0.09%, not "low")
- Top holdings or sector weights
- Suitability for different investors
- How it differs from similar ETFs` : ''}

FACT-CHECK RULES (CRITICAL):
1. Before writing, mentally verify each fact. If you are NOT confident about a specific number (MER, yield, AUM), say "approximately" or omit it.
2. For ETFs: MER must be the ACTUAL management expense ratio. Canadian ETFs typically range 0.06%-0.75%. Do NOT guess — if unsure, say "approximately X%".
3. For ETFs: Clearly state if hedged (CAD-hedged) or unhedged (full currency exposure). This is critical for Canadian investors.
4. For ETFs: The dividend yield must reflect the ACTUAL distribution history, not a guess. High-dividend ETFs (like XEI, ZWB) often yield 5-8%.
5. Do NOT confuse similar ETFs (e.g., VFV is unhedged, VSP is hedged; ZAG and VAB are different products).
6. If you are unsure about ANY fact, mark it with "approximately" rather than stating it as definitive.

Output ONLY valid JSON with this exact structure:
{
  "ticker": "${t.ticker}",
  "company": "${t.company}",
  "exchange": "${t.exchange}",
  "sector": "${t.sector}",
  "country": "${t.country}",
  "overview": "2-3 paragraph overview. What it ${t.sector === 'ETF' ? 'tracks (exact index name), hedging status, strategy, key features, how it differs from alternatives' : 'does, market position, recent developments'}.",
  "bullCase": ["3 bullet points for why ${t.sector === 'ETF' ? 'this ETF is worth holding' : 'the stock could go up'}"],
  "bearCase": ["3 bullet points for ${t.sector === 'ETF' ? 'risks and drawbacks' : 'why the stock could go down'}"],
  "keyMetrics": {
    "marketCap": "${t.sector === 'ETF' ? 'approximate AUM string' : 'approximate market cap string'}",
    "peRatio": "${t.sector === 'ETF' ? 'exact MER percentage (e.g. 0.09% MER)' : 'approximate P/E ratio string or N/A'}",
    "dividendYield": "approximate yield string or N/A",
    "sector": "${t.sector}"
  },
  "analystSummary": "1-2 sentences summarizing the general consensus",
  "seoDescription": "A 150-character meta description targeting 'should I buy ${t.ticker}' and '${t.ticker} ${t.sector === 'ETF' ? 'ETF' : 'stock'} analysis'"
}

Output ONLY the JSON object, nothing else.`;

async function generateViaAnthropic(ticker) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
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
  const text = data.content?.map(b => b.text).join('') || '';
  if (!text) throw new Error('No text in Anthropic response');
  return { text, model: 'claude-haiku-4-5' };
}

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

      const { text, model } = provider === 'anthropic'
        ? await generateViaAnthropic(t)
        : provider === 'openrouter'
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
