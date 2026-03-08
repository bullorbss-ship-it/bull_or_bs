#!/usr/bin/env node

/**
 * Fill stock pages with AI-generated content using OpenAI GPT-4o-mini
 * Usage: OPENAI_API_KEY=xxx node scripts/fill-stock-pages.js
 * Cost: ~$0.02 for all 61 tickers
 */

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('Set OPENAI_API_KEY env var');
  process.exit(1);
}

const DATA_DIR = path.join(__dirname, '..', 'data', 'stocks');
const DELAY_MS = 500; // gpt-4o-mini has generous rate limits

// Read tickers from source
const tickersFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'tickers.ts'), 'utf8');
const tickers = [];
const regex = /\{\s*ticker:\s*'([^']+)',\s*company:\s*'([^']+)',\s*exchange:\s*'([^']+)',\s*sector:\s*'([^']+)',\s*country:\s*'([^']+)'/g;
let match;
while ((match = regex.exec(tickersFile)) !== null) {
  tickers.push({ ticker: match[1], company: match[2], exchange: match[3], sector: match[4], country: match[5] });
}

console.log(`Found ${tickers.length} tickers`);

const PROMPT_TEMPLATE = (t) => `You are a stock analyst writing for BullOrBS, an AI-driven stock analysis site.

Generate a stock overview for ${t.company} (${t.ticker}) on the ${t.exchange}.

Output ONLY valid JSON with this exact structure:
{
  "ticker": "${t.ticker}",
  "company": "${t.company}",
  "exchange": "${t.exchange}",
  "sector": "${t.sector}",
  "country": "${t.country}",
  "overview": "2-3 paragraph company overview. What they do, market position, recent developments.",
  "bullCase": ["3 bullet points for why the stock could go up"],
  "bearCase": ["3 bullet points for why the stock could go down"],
  "keyMetrics": {
    "marketCap": "approximate market cap string",
    "peRatio": "approximate P/E ratio string or N/A",
    "dividendYield": "approximate yield string or N/A",
    "sector": "${t.sector}"
  },
  "analystSummary": "1-2 sentences summarizing what analysts generally think",
  "seoDescription": "A 150-character meta description targeting 'should I buy ${t.ticker}' and '${t.ticker} stock analysis'"
}

Be factual. Use your training data. Do not make up specific current prices — use approximate ranges or say "as of early 2025" etc. Output ONLY the JSON object, nothing else.`;

async function generateStockData(ticker) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: PROMPT_TEMPLATE(ticker) }],
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('No text in OpenAI response');

  // Extract JSON (strip markdown code fences if present)
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');

  // Clean and parse
  let jsonStr = jsonMatch[0].replace(/,\s*([}\]])/g, '$1');
  return JSON.parse(jsonStr);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  let success = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < tickers.length; i++) {
    const t = tickers[i];
    const slug = t.ticker.toLowerCase().replace(/\./g, '-');
    const filePath = path.join(DATA_DIR, `${slug}.json`);

    // Skip if already exists
    if (fs.existsSync(filePath)) {
      console.log(`  [${i + 1}/${tickers.length}] SKIP ${t.ticker} (exists)`);
      success++;
      continue;
    }

    try {
      process.stdout.write(`  [${i + 1}/${tickers.length}] ${t.ticker} (${t.company})... `);
      const stockData = await generateStockData(t);
      stockData.generatedAt = new Date().toISOString();
      stockData.generatedBy = 'gpt-4o-mini';
      fs.writeFileSync(filePath, JSON.stringify(stockData, null, 2));
      console.log('OK');
      success++;
    } catch (err) {
      console.log(`FAIL: ${err.message.slice(0, 80)}`);
      errors.push({ ticker: t.ticker, error: err.message });
      failed++;
    }

    // Small delay between calls
    if (i < tickers.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\nDone: ${success} success, ${failed} failed out of ${tickers.length}`);
  if (errors.length > 0) {
    console.log('\nFailed tickers:');
    errors.forEach(e => console.log(`  ${e.ticker}: ${e.error.slice(0, 100)}`));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
