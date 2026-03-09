/**
 * Builds a compact ticker reference sheet from local stock/ETF profiles.
 * Injected into AI prompts so models can't hallucinate what a ticker is.
 */

import fs from 'fs';
import path from 'path';
import { StockData } from '@/lib/stock-data';

const DATA_DIR = path.join(process.cwd(), 'data', 'stocks');

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

      // Compact one-liner: TICKER (Exchange) — Full Name | Sector | 1-sentence what it is
      const firstSentence = data.overview?.split('.')[0]?.trim() || data.company;
      const mer = isETF && data.keyMetrics?.peRatio ? ` | MER: ${data.keyMetrics.peRatio}` : '';
      const yield_ = data.keyMetrics?.dividendYield && data.keyMetrics.dividendYield !== 'N/A'
        ? ` | Yield: ${data.keyMetrics.dividendYield}` : '';

      lines.push(`${data.ticker}${suffix} (${exchange}) — ${data.company} | ${data.sector}${mer}${yield_}`);
      lines.push(`  → ${firstSentence}.`);
    } catch {
      // Skip corrupt files
    }
  }

  lines.push('');
  lines.push('IMPORTANT: When discussing any ticker above, use the identity from this reference sheet. Do NOT rely on your training data for what a ticker represents — it may be wrong for Canadian ETFs.');

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
