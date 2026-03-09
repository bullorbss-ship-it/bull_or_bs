/**
 * Profile Refresh — Uses Gemini (free via OpenRouter) to web-search
 * current financial data for a ticker, diffs against local profile,
 * and updates stale fields.
 *
 * Only updates quantitative fields (keyMetrics). Never touches qualitative
 * fields (overview, bullCase, bearCase) — those are hand-corrected.
 *
 * ADR: docs/architecture-decisions.md #005
 */

import fs from 'fs';
import path from 'path';
import { StockData } from '@/lib/stock-data';

const DATA_DIR = path.join(process.cwd(), 'data', 'stocks');

// Gemini Flash (free on OpenRouter) for web-grounded data fetch
const GEMINI_MODEL = 'google/gemini-2.0-flash-exp:free';

export interface RefreshResult {
  ticker: string;
  status: 'updated' | 'no-change' | 'no-profile' | 'error';
  changes: ProfileChange[];
  error?: string;
}

export interface ProfileChange {
  field: string;
  oldValue: string;
  newValue: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Ask Gemini to web-search current data for a ticker.
 * Returns structured JSON with current financial metrics.
 */
async function fetchCurrentData(ticker: string, company: string): Promise<Record<string, string> | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.log('[RefreshProfile] No OPENROUTER_API_KEY — skipping Gemini lookup');
    return null;
  }

  const prompt = `Look up the current financial data for ${company} (ticker: ${ticker}).

Return ONLY a JSON object with these fields (use "unknown" if you can't find a value):
{
  "company": "full legal company name",
  "marketCap": "e.g. approximately $150 billion or approximately CAD 90 billion",
  "peRatio": "e.g. approximately 25 (or MER: 0.20% for ETFs)",
  "dividendYield": "e.g. approximately 2.5%",
  "revenue": "e.g. approximately $75 billion (TTM)",
  "sector": "e.g. Technology, Energy, ETF",
  "segments": "e.g. Cloud, Devices, Advertising (list main business segments)",
  "recentChanges": "any major M&A, restructuring, or segment changes in last 12 months"
}

IMPORTANT: Use current 2025-2026 data, not historical. If this is an ETF, use MER instead of P/E and AUM instead of market cap. Return ONLY the JSON, no explanation.`;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://bullorbs.com',
        'X-Title': 'BullOrBS Profile Refresh',
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        max_tokens: 1000,
        messages: [
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.log(`[RefreshProfile] Gemini failed (${res.status}): ${err.slice(0, 200)}`);
      return null;
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;

    // Extract JSON from response (may have markdown fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.log(`[RefreshProfile] Gemini error:`, err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Parse a numeric value from a human-readable string.
 * "approximately $150 billion" → 150000000000
 * "approximately CAD 90 billion" → 90000000000
 * "approximately 25" → 25
 * Returns null if unparseable.
 */
function parseNumeric(str: string): number | null {
  if (!str || str === 'unknown') return null;
  const cleaned = str.replace(/approximately|approx\.?|~|,/gi, '').trim();

  // Handle "CAD X billion" or "$X billion/trillion/million"
  const match = cleaned.match(/([\d.]+)\s*(trillion|billion|million)?/i);
  if (!match) return null;

  const num = parseFloat(match[1]);
  if (isNaN(num)) return null;

  const multiplier = match[2]?.toLowerCase();
  if (multiplier === 'trillion') return num * 1e12;
  if (multiplier === 'billion') return num * 1e9;
  if (multiplier === 'million') return num * 1e6;
  return num;
}

/**
 * Check if two values are "significantly different" enough to warrant an update.
 * For numeric values: >20% difference = significant.
 * For strings: different text = significant.
 */
function isSignificantChange(oldVal: string, newVal: string): { significant: boolean; confidence: 'high' | 'medium' | 'low' } {
  if (!newVal || newVal === 'unknown') return { significant: false, confidence: 'low' };

  const oldNum = parseNumeric(oldVal);
  const newNum = parseNumeric(newVal);

  if (oldNum && newNum) {
    const pctDiff = Math.abs(oldNum - newNum) / oldNum;
    if (pctDiff > 0.5) return { significant: true, confidence: 'high' }; // >50% off
    if (pctDiff > 0.2) return { significant: true, confidence: 'medium' }; // >20% off
    return { significant: false, confidence: 'low' }; // close enough
  }

  // String comparison (company name, sector, etc.)
  if (oldVal.toLowerCase().trim() !== newVal.toLowerCase().trim()) {
    return { significant: true, confidence: 'medium' };
  }

  return { significant: false, confidence: 'low' };
}

/**
 * Refresh a single ticker's profile by diffing Gemini web data against local JSON.
 *
 * Only updates keyMetrics fields. Never touches overview, bullCase, bearCase
 * (those are hand-corrected editorial content).
 *
 * @param ticker - e.g. "AAPL", "CNQ", "XEQT"
 * @param autoSave - if true, writes updated profile to disk. Default: false (dry run)
 */
export async function refreshProfile(ticker: string, autoSave = false): Promise<RefreshResult> {
  const slug = ticker.toLowerCase().replace(/\./g, '-');
  const filePath = path.join(DATA_DIR, `${slug}.json`);

  if (!fs.existsSync(filePath)) {
    return { ticker, status: 'no-profile', changes: [] };
  }

  let profile: StockData;
  try {
    profile = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return { ticker, status: 'error', changes: [], error: 'Failed to parse local profile' };
  }

  // Fetch current data from Gemini
  const current = await fetchCurrentData(ticker, profile.company);
  if (!current) {
    return { ticker, status: 'error', changes: [], error: 'Gemini returned no data' };
  }

  const changes: ProfileChange[] = [];

  // Diff keyMetrics
  const metricsMap: Array<{ field: string; profileKey: keyof StockData['keyMetrics']; geminiKey: string }> = [
    { field: 'marketCap', profileKey: 'marketCap', geminiKey: 'marketCap' },
    { field: 'peRatio', profileKey: 'peRatio', geminiKey: 'peRatio' },
    { field: 'dividendYield', profileKey: 'dividendYield', geminiKey: 'dividendYield' },
  ];

  for (const { field, profileKey, geminiKey } of metricsMap) {
    const oldVal = profile.keyMetrics?.[profileKey] || '';
    const newVal = current[geminiKey] || '';
    const { significant, confidence } = isSignificantChange(oldVal, newVal);

    if (significant) {
      changes.push({ field: `keyMetrics.${field}`, oldValue: oldVal, newValue: newVal, confidence });
    }
  }

  // Check company name mismatch (critical — catches MOG.A = Magnolia vs Moog type errors)
  if (current.company && current.company !== 'unknown') {
    const oldCompany = profile.company.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newCompany = current.company.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Only flag if names are very different (not just formatting)
    if (oldCompany !== newCompany && !newCompany.includes(oldCompany) && !oldCompany.includes(newCompany)) {
      changes.push({
        field: 'company',
        oldValue: profile.company,
        newValue: current.company,
        confidence: 'high',
      });
    }
  }

  // Check for segment/division changes (informational — flagged but not auto-updated)
  if (current.segments && current.segments !== 'unknown') {
    changes.push({
      field: 'segments (info only)',
      oldValue: '(check overview)',
      newValue: current.segments,
      confidence: 'medium',
    });
  }

  // Check for recent major changes
  if (current.recentChanges && current.recentChanges !== 'unknown' && current.recentChanges.length > 10) {
    changes.push({
      field: 'recentChanges (info only)',
      oldValue: '(none tracked)',
      newValue: current.recentChanges,
      confidence: 'medium',
    });
  }

  if (changes.length === 0) {
    return { ticker, status: 'no-change', changes: [] };
  }

  // Auto-save: only update keyMetrics fields with high/medium confidence
  if (autoSave) {
    let updated = false;
    for (const change of changes) {
      if (change.field.startsWith('keyMetrics.') && change.confidence !== 'low') {
        const key = change.field.replace('keyMetrics.', '') as keyof StockData['keyMetrics'];
        profile.keyMetrics[key] = change.newValue;
        updated = true;
      }
      // Company name: only auto-update on HIGH confidence (potential misidentification)
      if (change.field === 'company' && change.confidence === 'high') {
        profile.company = change.newValue;
        updated = true;
      }
    }

    if (updated) {
      profile.generatedAt = new Date().toISOString();
      profile.generatedBy = 'gemini-refresh';
      fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
    }
  }

  return { ticker, status: 'updated', changes };
}

/**
 * Refresh profiles for multiple tickers.
 * Runs sequentially to respect OpenRouter rate limits.
 */
export async function refreshProfiles(
  tickers: string[],
  autoSave = false
): Promise<RefreshResult[]> {
  const results: RefreshResult[] = [];

  for (const ticker of tickers) {
    console.log(`[RefreshProfile] Checking ${ticker}...`);
    const result = await refreshProfile(ticker, autoSave);
    results.push(result);

    if (result.changes.length > 0) {
      console.log(`[RefreshProfile] ${ticker}: ${result.changes.length} changes found`);
      for (const c of result.changes) {
        const flag = c.confidence === 'high' ? '!!!' : c.confidence === 'medium' ? '!!' : '';
        console.log(`  ${flag} ${c.field}: "${c.oldValue}" → "${c.newValue}" [${c.confidence}]`);
      }
    } else {
      console.log(`[RefreshProfile] ${ticker}: no changes`);
    }

    // Small delay between requests to be nice to OpenRouter
    await new Promise(r => setTimeout(r, 500));
  }

  return results;
}

/**
 * Refresh profiles for all tickers that are about to be used in article generation.
 * Called before generatePick() to ensure the reference sheet is fresh.
 *
 * @param candidateTickers - tickers the model will reference in this article
 * @param autoSave - write updates to disk (default: false for dry run)
 */
export async function refreshBeforeGenerate(
  candidateTickers: string[],
  autoSave = false
): Promise<{ refreshed: number; changes: ProfileChange[]; errors: string[] }> {
  const results = await refreshProfiles(candidateTickers, autoSave);

  const allChanges = results.flatMap(r => r.changes);
  const errors = results
    .filter(r => r.status === 'error')
    .map(r => `${r.ticker}: ${r.error}`);

  return {
    refreshed: results.filter(r => r.status === 'updated').length,
    changes: allChanges,
    errors,
  };
}
