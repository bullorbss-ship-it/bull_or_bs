/**
 * Market Data Provider — 3-tier architecture (see docs/architecture-decisions.md)
 *
 * Tier 1: FMP API (free, ~87 US tickers) → VERIFIED data
 * Tier 2: Local stock JSON (all 61 tickers) → APPROXIMATE data (qualitative only)
 * Tier 3: Nothing available → UNAVAILABLE
 *
 * Every data point is tagged with confidence level so Haiku knows
 * when to cite exact numbers vs hedge with "approximately".
 */

import { getStockData as getLocalStockData } from '@/lib/stock-data';

// ─── Types ───────────────────────────────────────────────────────────────────

export type DataConfidence = 'VERIFIED' | 'APPROXIMATE' | 'UNAVAILABLE';

export interface TaggedStockData {
  confidence: DataConfidence;
  source: string;
  ticker: string;
  context: string; // formatted text for prompt injection
  apiCalls: number;
}

export interface TaggedMarketMovers {
  confidence: DataConfidence;
  source: string;
  context: string;
  apiCalls: number;
}

// ─── FMP API (Tier 1) ───────────────────────────────────────────────────────

const FMP_BASE = 'https://financialmodelingprep.com/api/v3';

function apiKey(): string {
  return process.env.FMP_API_KEY || '';
}

function hasFmpKey(): boolean {
  return apiKey().length > 0;
}

async function fmpFetch<T>(endpoint: string): Promise<T | null> {
  if (!hasFmpKey()) return null;
  try {
    const url = `${FMP_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${apiKey()}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

interface FMPProfile {
  symbol: string;
  companyName: string;
  price: number;
  mktCap: number;
  sector: string;
  industry: string;
  exchange: string;
  beta: number;
  volAvg: number;
  lastDiv: number;
  range: string;
}

interface FMPQuote {
  symbol: string;
  price: number;
  changesPercentage: number;
  change: number;
  yearLow: number;
  yearHigh: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  pe: number;
  eps: number;
  earningsAnnouncement: string;
}

interface FMPRatios {
  peRatioTTM: number;
  pegRatioTTM: number;
  priceToBookRatioTTM: number;
  dividendYielTTM: number;
  returnOnEquityTTM: number;
  debtEquityRatioTTM: number;
}

interface FMPMover {
  symbol: string;
  name: string;
  change: number;
  price: number;
  changesPercentage: number;
}

async function fetchFmpTicker(ticker: string): Promise<TaggedStockData | null> {
  const [profile, quote, ratios] = await Promise.all([
    fmpFetch<FMPProfile[]>(`/profile/${ticker}`),
    fmpFetch<FMPQuote[]>(`/quote/${ticker}`),
    fmpFetch<FMPRatios[]>(`/ratios-ttm/${ticker}`),
  ]);

  const p = profile?.[0];
  const q = quote?.[0];
  const r = ratios?.[0];

  if (!p && !q) return null; // FMP doesn't have this ticker

  const lines: string[] = [];
  lines.push('[DATA CONFIDENCE: VERIFIED — real-time from financial data API]\n');

  if (p) {
    lines.push(`COMPANY: ${p.companyName} (${p.symbol})`);
    lines.push(`SECTOR: ${p.sector} | INDUSTRY: ${p.industry}`);
    lines.push(`EXCHANGE: ${p.exchange}`);
    lines.push(`PRICE: $${p.price} | MARKET CAP: $${(p.mktCap / 1e9).toFixed(1)}B`);
    lines.push(`52-WEEK RANGE: ${p.range}`);
    lines.push(`AVG VOLUME: ${(p.volAvg / 1e6).toFixed(1)}M | BETA: ${p.beta}`);
    lines.push(`LAST DIVIDEND: $${p.lastDiv}`);
  }

  if (q) {
    lines.push(`P/E RATIO: ${q.pe} | EPS: $${q.eps}`);
    lines.push(`CHANGE: ${q.changesPercentage > 0 ? '+' : ''}${q.changesPercentage.toFixed(2)}%`);
    lines.push(`VOLUME: ${(q.volume / 1e6).toFixed(1)}M`);
    if (q.earningsAnnouncement) {
      lines.push(`NEXT EARNINGS: ${q.earningsAnnouncement.split('T')[0]}`);
    }
  }

  if (r) {
    lines.push(`\nKEY RATIOS (TTM):`);
    if (r.peRatioTTM) lines.push(`  P/E: ${r.peRatioTTM.toFixed(1)}`);
    if (r.pegRatioTTM) lines.push(`  PEG: ${r.pegRatioTTM.toFixed(2)}`);
    if (r.priceToBookRatioTTM) lines.push(`  P/B: ${r.priceToBookRatioTTM.toFixed(1)}`);
    if (r.dividendYielTTM) lines.push(`  DIV YIELD: ${(r.dividendYielTTM * 100).toFixed(2)}%`);
    if (r.returnOnEquityTTM) lines.push(`  ROE: ${(r.returnOnEquityTTM * 100).toFixed(1)}%`);
    if (r.debtEquityRatioTTM) lines.push(`  D/E: ${r.debtEquityRatioTTM.toFixed(2)}`);
  }

  return {
    confidence: 'VERIFIED',
    source: 'FMP API',
    ticker,
    context: lines.join('\n'),
    apiCalls: 3,
  };
}

// ─── Local Stock Data (Tier 2) ───────────────────────────────────────────────

function fetchLocalTicker(ticker: string): TaggedStockData | null {
  const data = getLocalStockData(ticker);
  if (!data) return null;

  const age = Date.now() - new Date(data.generatedAt).getTime();
  const daysSinceGenerated = Math.floor(age / (1000 * 60 * 60 * 24));
  const staleWarning = daysSinceGenerated > 30 ? ` (DATA IS ${daysSinceGenerated} DAYS OLD — may be outdated)` : '';

  // Qualitative context only — strip specific numbers since they're guesses
  const lines: string[] = [];
  lines.push(`[DATA CONFIDENCE: APPROXIMATE — qualitative context only, no exact numbers available${staleWarning}]`);
  lines.push(`[Source: static profile, generated ${data.generatedAt.split('T')[0]}]\n`);
  lines.push(`COMPANY: ${data.company} (${data.ticker})`);
  lines.push(`EXCHANGE: ${data.exchange} | SECTOR: ${data.sector} | COUNTRY: ${data.country}`);
  lines.push(`\nOVERVIEW: ${data.overview}`);

  if (data.bullCase.length > 0) {
    lines.push(`\nBULL CASE:`);
    data.bullCase.forEach(b => lines.push(`  - ${b}`));
  }

  if (data.bearCase.length > 0) {
    lines.push(`\nBEAR CASE:`);
    data.bearCase.forEach(b => lines.push(`  - ${b}`));
  }

  lines.push(`\nANALYST SUMMARY: ${data.analystSummary}`);

  // NOTE: We intentionally DO NOT include keyMetrics (marketCap, peRatio, dividendYield)
  // because they're approximate guesses from GPT-4o-mini, not real data.

  return {
    confidence: 'APPROXIMATE',
    source: 'local stock profile',
    ticker,
    context: lines.join('\n'),
    apiCalls: 0,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Resolve stock data with confidence tagging — FMP first, local fallback */
export async function resolveStockData(ticker: string): Promise<TaggedStockData> {
  // Tier 1: Try FMP
  const fmpData = await fetchFmpTicker(ticker);
  if (fmpData) return fmpData;

  // Tier 2: Local stock JSON
  const localData = fetchLocalTicker(ticker);
  if (localData) return localData;

  // Tier 3: Nothing
  return {
    confidence: 'UNAVAILABLE',
    source: 'none',
    ticker,
    context: `[DATA CONFIDENCE: UNAVAILABLE — no data found for ${ticker}]\nUse your general knowledge but clearly state that specific current data was not available.`,
    apiCalls: 0,
  };
}

/** Fetch market movers from FMP for picks */
export async function resolveMarketMovers(): Promise<TaggedMarketMovers> {
  if (!hasFmpKey()) {
    return {
      confidence: 'UNAVAILABLE',
      source: 'none',
      context: '[DATA CONFIDENCE: UNAVAILABLE — no FMP API key configured]\nUse your general knowledge of current market conditions.',
      apiCalls: 0,
    };
  }

  const [actives, gainers, losers] = await Promise.all([
    fmpFetch<FMPMover[]>('/stock_market/actives'),
    fmpFetch<FMPMover[]>('/stock_market/gainers'),
    fmpFetch<FMPMover[]>('/stock_market/losers'),
  ]);

  if (!actives && !gainers && !losers) {
    return {
      confidence: 'UNAVAILABLE',
      source: 'FMP API (failed)',
      context: '[DATA CONFIDENCE: UNAVAILABLE — market data API returned no results]\nThis may indicate markets are closed. Use your general knowledge.',
      apiCalls: 3,
    };
  }

  const lines: string[] = [];
  lines.push('[DATA CONFIDENCE: VERIFIED — real-time market movers from financial data API]\n');

  if (gainers && gainers.length > 0) {
    lines.push('TOP GAINERS:');
    for (const s of gainers.slice(0, 15)) {
      lines.push(`  ${s.symbol} (${s.name}): $${s.price} | +${s.changesPercentage.toFixed(2)}%`);
    }
    lines.push('');
  }

  if (losers && losers.length > 0) {
    lines.push('TOP LOSERS:');
    for (const s of losers.slice(0, 10)) {
      lines.push(`  ${s.symbol} (${s.name}): $${s.price} | ${s.changesPercentage.toFixed(2)}%`);
    }
    lines.push('');
  }

  if (actives && actives.length > 0) {
    lines.push('MOST ACTIVE:');
    for (const s of actives.slice(0, 15)) {
      lines.push(`  ${s.symbol} (${s.name}): $${s.price} | ${s.changesPercentage > 0 ? '+' : ''}${s.changesPercentage.toFixed(2)}%`);
    }
    lines.push('');
  }

  return {
    confidence: 'VERIFIED',
    source: 'FMP API',
    context: lines.join('\n'),
    apiCalls: 3,
  };
}
