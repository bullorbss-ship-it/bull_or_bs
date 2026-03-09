import fs from 'fs';
import path from 'path';
import { TickerInfo, ALL_TICKERS } from './tickers';

const DYNAMIC_TICKERS_FILE = path.join(process.cwd(), 'data/dynamic-tickers.json');

/**
 * Load dynamically registered tickers (added during article generation).
 * These supplement the static lists in tickers.ts.
 */
export function getDynamicTickers(): TickerInfo[] {
  try {
    const data = fs.readFileSync(DYNAMIC_TICKERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Get all tickers: static (tickers.ts) + dynamic (data/dynamic-tickers.json).
 * Use this instead of ALL_TICKERS when you need the full expanded pool.
 */
export function getAllTickersExpanded(): TickerInfo[] {
  const dynamic = getDynamicTickers();
  const staticTickers = new Set(ALL_TICKERS.map(t => t.ticker.toUpperCase()));
  const unique = dynamic.filter(t => !staticTickers.has(t.ticker.toUpperCase()));
  return [...ALL_TICKERS, ...unique];
}

/**
 * Register a new ticker in the dynamic registry.
 * No-op if the ticker already exists in static or dynamic lists.
 */
export function registerTicker(info: TickerInfo): boolean {
  const allExpanded = getAllTickersExpanded();
  if (allExpanded.some(t => t.ticker.toUpperCase() === info.ticker.toUpperCase())) {
    return false; // already exists
  }

  const dynamic = getDynamicTickers();
  dynamic.push(info);
  fs.mkdirSync(path.dirname(DYNAMIC_TICKERS_FILE), { recursive: true });
  fs.writeFileSync(DYNAMIC_TICKERS_FILE, JSON.stringify(dynamic, null, 2));
  return true;
}

/**
 * After article generation, extract candidate tickers and auto-register any new ones.
 * Returns the list of newly registered tickers.
 */
export function registerArticleTickers(article: {
  ticker?: string;
  content: { candidates?: Array<{ ticker: string; name?: string; company?: string }> };
}): string[] {
  const registered: string[] = [];
  const allExpanded = getAllTickersExpanded();
  const knownSet = new Set(allExpanded.map(t => t.ticker.toUpperCase()));

  // Collect all tickers from article
  const tickers: Array<{ ticker: string; name?: string }> = [];
  if (article.ticker) {
    tickers.push({ ticker: article.ticker });
  }
  if (article.content.candidates) {
    for (const c of article.content.candidates) {
      tickers.push({ ticker: c.ticker, name: c.company || c.name });
    }
  }

  for (const t of tickers) {
    const upper = t.ticker.toUpperCase();
    if (knownSet.has(upper)) continue;

    // Infer exchange from ticker format
    const exchange = inferExchange(upper);
    const country = exchange === 'TSX' ? 'CA' : 'US';

    const info: TickerInfo = {
      ticker: upper,
      company: t.name || upper, // use candidate name if available
      exchange,
      sector: 'Other',
      country,
    };

    if (registerTicker(info)) {
      registered.push(upper);
      knownSet.add(upper);
      createStubProfile(info);
    }
  }

  return registered;
}

/**
 * Infer exchange from ticker format. Simple heuristic.
 */
function inferExchange(ticker: string): 'TSX' | 'NYSE' | 'NASDAQ' {
  // TSX tickers often have dots (RCI.B, GIB.A) or are .TO suffixed
  if (ticker.includes('.')) return 'TSX';
  // Common NASDAQ patterns (longer tickers, tech names)
  // Default to NYSE for US stocks
  return 'NYSE';
}

/**
 * Create a minimal stock profile JSON so the stock page renders.
 */
function createStubProfile(info: TickerInfo): void {
  const slug = info.ticker.toLowerCase().replace(/\./g, '-');
  const filePath = path.join(process.cwd(), 'data/stocks', `${slug}.json`);

  if (fs.existsSync(filePath)) return;

  const profile = {
    ticker: info.ticker,
    company: info.company,
    exchange: info.exchange,
    sector: info.sector,
    country: info.country,
    overview: `${info.company} (${info.ticker}) is listed on the ${info.exchange}. This profile was auto-generated when the ticker appeared in a BullOrBS article. A full qualitative analysis will be added in a future update.`,
    bullCase: ['Profile pending — check back for full analysis.'],
    bearCase: ['Profile pending — check back for full analysis.'],
    keyMetrics: {
      marketCap: 'Data pending',
      peRatio: 'Data pending',
      dividendYield: 'Data pending',
      sector: info.sector,
    },
    analystSummary: 'Full analyst summary pending.',
    seoDescription: `Should I buy ${info.ticker}? See our AI analysis of ${info.company} stock.`,
    generatedAt: new Date().toISOString(),
    generatedBy: 'auto-registered',
  };

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
}
