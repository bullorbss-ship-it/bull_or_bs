/**
 * Builds a compact ticker reference sheet from local stock/ETF profiles.
 * Injected into AI prompts so models can't hallucinate what a ticker is.
 */

import fs from 'fs';
import path from 'path';
import { StockData } from '@/lib/stock-data';

const DATA_DIR = path.join(process.cwd(), 'data', 'stocks');

/** Extract hedging status from overview text — critical for Canadian ETFs */
function extractHedgeStatus(overview: string): string {
  const lower = overview.toLowerCase();
  if (lower.includes('unhedged') || lower.includes('not hedged') || lower.includes('full currency exposure') || lower.includes('full usd/cad')) {
    return ' | ⚠️ UNHEDGED (full FX exposure)';
  }
  if (lower.includes('cad-hedged') || lower.includes('currency-hedged') || lower.includes('hedged')) {
    return ' | CAD-HEDGED';
  }
  if (lower.includes('swap-based') || lower.includes('no distributions')) {
    return ' | SWAP-BASED (no distributions)';
  }
  return '';
}

/**
 * Load all stock profiles and build a compact reference string.
 * Format: one line per ticker with identity + key facts.
 * Keeps it short to avoid blowing up token counts.
 */
export function buildTickerReferenceSheet(): string {
  if (!fs.existsSync(DATA_DIR)) return '';

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  if (files.length === 0) return '';

  const lines: string[] = [
    '=== TICKER REFERENCE SHEET (GROUND TRUTH — use these identities, do NOT guess) ===',
    '',
  ];

  for (const file of files) {
    try {
      const data: StockData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
      const isETF = data.sector === 'ETF';
      const exchange = data.exchange || '?';
      const suffix = exchange === 'TSX' ? '.TO' : '';
      const overview = data.overview || '';

      // Extract critical ETF flags from overview text
      const hedgeStatus = isETF ? extractHedgeStatus(overview) : '';
      const mer = isETF && data.keyMetrics?.peRatio ? ` | MER: ${data.keyMetrics.peRatio}` : '';
      const yield_ = data.keyMetrics?.dividendYield && data.keyMetrics.dividendYield !== 'N/A'
        ? ` | Yield: ${data.keyMetrics.dividendYield}` : '';

      // Compact one-liner with critical flags upfront
      lines.push(`${data.ticker}${suffix} (${exchange}) — ${data.company} | ${data.sector}${hedgeStatus}${mer}${yield_}`);

      // First two sentences for better context
      const sentences = overview.match(/[^.!?]+[.!?]+/g) || [];
      const summary = sentences.slice(0, 2).join('').trim() || data.company;
      lines.push(`  → ${summary}`);
    } catch {
      // Skip corrupt files
    }
  }

  lines.push('');
  lines.push('CRITICAL RULES:');
  lines.push('- Use ONLY the identities, MERs, yields, and hedging status from this sheet.');
  lines.push('- Do NOT override these facts with your training data — your training data is often WRONG for Canadian ETFs.');
  lines.push('- VFV.TO is UNHEDGED (full USD/CAD exposure). VSP.TO is the HEDGED version. Do NOT confuse them.');
  lines.push('- If a ticker is NOT in this sheet, explicitly flag it as "based on training knowledge (unverified)".');

  return lines.join('\n');
}

/**
 * Identity-only reference sheet for screenshot-based generation.
 * Only includes ticker → company name + exchange. NO metrics, yields, MER, or summaries.
 * Prevents the model from using reference sheet data instead of screenshot data.
 */
export function buildIdentityOnlySheet(): string {
  if (!fs.existsSync(DATA_DIR)) return '';

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  if (files.length === 0) return '';

  const lines: string[] = [
    '=== TICKER IDENTITY SHEET (names only — do NOT use for any metrics/numbers) ===',
    '',
  ];

  for (const file of files) {
    try {
      const data: StockData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
      const exchange = data.exchange || '?';
      const suffix = exchange === 'TSX' ? '.TO' : '';
      lines.push(`${data.ticker}${suffix} — ${data.company} (${exchange})`);
    } catch {
      // Skip corrupt files
    }
  }

  lines.push('');
  lines.push('USE THIS SHEET ONLY TO VERIFY TICKER IDENTITIES (what company a ticker represents).');
  lines.push('Do NOT use any metrics, yields, MERs, or other data from this sheet.');
  lines.push('ALL numbers must come from the provided screenshots/data ONLY.');

  return lines.join('\n');
}

/**
 * Get profile for a specific ticker — fuller context for roasts.
 */
export function getTickerProfile(ticker: string): string | null {
  const slug = ticker.toLowerCase().replace(/\./g, '-');
  const filePath = path.join(DATA_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;

  try {
    const data: StockData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const lines: string[] = [
      `=== PROFILE: ${data.ticker} (${data.company}) ===`,
      `Exchange: ${data.exchange} | Sector: ${data.sector} | Country: ${data.country}`,
      `Overview: ${data.overview}`,
    ];

    if (data.bullCase?.length) {
      lines.push('Bull Case:');
      data.bullCase.forEach(b => lines.push(`  - ${b}`));
    }
    if (data.bearCase?.length) {
      lines.push('Bear Case:');
      data.bearCase.forEach(b => lines.push(`  - ${b}`));
    }
    if (data.keyMetrics) {
      const m = data.keyMetrics;
      lines.push(`Metrics: Market Cap/AUM: ${m.marketCap} | P/E or MER: ${m.peRatio} | Yield: ${m.dividendYield}`);
    }

    return lines.join('\n');
  } catch {
    return null;
  }
}
