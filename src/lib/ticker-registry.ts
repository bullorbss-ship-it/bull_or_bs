import fs from 'fs';
import path from 'path';
import { TickerInfo, ALL_TICKERS } from './tickers';

const DYNAMIC_TICKERS_FILE = path.join(process.cwd(), 'data/dynamic-tickers.json');
const CONTENT_DIR = path.join(process.cwd(), 'content');

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
 * Scan all published articles and extract tickers mentioned as candidates or primary ticker.
 * This ensures that any ticker referenced in content gets a stock page at build time,
 * even when dynamic-tickers.json can't be written (e.g., Vercel read-only filesystem).
 */
function getTickersFromArticles(): TickerInfo[] {
  const found = new Map<string, TickerInfo>();

  for (const dir of ['roasts', 'picks', 'takes']) {
    const dirPath = path.join(CONTENT_DIR, dir);
    if (!fs.existsSync(dirPath)) continue;

    for (const file of fs.readdirSync(dirPath).filter(f => f.endsWith('.json'))) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dirPath, file), 'utf8'));

        // Primary ticker
        if (data.ticker && typeof data.ticker === 'string') {
          const upper = data.ticker.toUpperCase();
          if (!found.has(upper)) {
            found.set(upper, {
              ticker: upper,
              company: upper,
              exchange: inferExchange(upper),
              sector: 'Other',
              country: inferExchange(upper) === 'TSX' ? 'CA' : 'US',
            });
          }
        }

        // Candidate tickers
        if (data.content?.candidates && Array.isArray(data.content.candidates)) {
          for (const c of data.content.candidates) {
            if (!c.ticker || typeof c.ticker !== 'string') continue;
            const upper = c.ticker.toUpperCase();
            if (!found.has(upper)) {
              found.set(upper, {
                ticker: upper,
                company: c.company || c.name || upper,
                exchange: inferExchange(upper),
                sector: 'Other',
                country: inferExchange(upper) === 'TSX' ? 'CA' : 'US',
              });
            }
          }
        }
      } catch { /* skip malformed files */ }
    }
  }

  return Array.from(found.values());
}

/**
 * Get all tickers: static (tickers.ts) + dynamic (data/dynamic-tickers.json) + article-derived.
 * Use this instead of ALL_TICKERS when you need the full expanded pool.
 */
export function getAllTickersExpanded(): TickerInfo[] {
  const staticTickers = new Set(ALL_TICKERS.map(t => t.ticker.toUpperCase()));

  const dynamic = getDynamicTickers();
  const uniqueDynamic = dynamic.filter(t => !staticTickers.has(t.ticker.toUpperCase()));
  for (const t of uniqueDynamic) staticTickers.add(t.ticker.toUpperCase());

  const fromArticles = getTickersFromArticles();
  const uniqueArticle = fromArticles.filter(t => !staticTickers.has(t.ticker.toUpperCase()));

  return [...ALL_TICKERS, ...uniqueDynamic, ...uniqueArticle];
}

/**
 * Extended lookup: checks static + dynamic + article-derived tickers.
 * Use this for stock page rendering.
 */
export function getTickerInfoExpanded(ticker: string): TickerInfo | undefined {
  const upper = ticker.toUpperCase();
  return getAllTickersExpanded().find(t => t.ticker.toUpperCase() === upper);
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
  try {
    fs.mkdirSync(path.dirname(DYNAMIC_TICKERS_FILE), { recursive: true });
    fs.writeFileSync(DYNAMIC_TICKERS_FILE, JSON.stringify(dynamic, null, 2));
  } catch {
    // Read-only filesystem (Vercel) — skip dynamic ticker registration
    return false;
  }
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

    const exchange = inferExchange(upper);
    const country = exchange === 'TSX' ? 'CA' : 'US';

    const info: TickerInfo = {
      ticker: upper,
      company: t.name || upper,
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
  if (ticker.includes('.')) return 'TSX';
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

  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
  } catch {
    // Read-only filesystem (Vercel) — skip profile creation
  }
}
