import fs from 'fs';
import path from 'path';

export interface StockData {
  ticker: string;
  company: string;
  exchange: string;
  sector: string;
  country: string;
  overview: string;
  bullCase: string[];
  bearCase: string[];
  keyMetrics: {
    marketCap: string;
    peRatio: string;
    dividendYield: string;
    sector: string;
  };
  analystSummary: string;
  seoDescription: string;
  generatedAt: string;
  generatedBy: string;
}

const DATA_DIR = path.join(process.cwd(), 'data', 'stocks');

export function getStockData(ticker: string): StockData | null {
  const slug = ticker.toLowerCase().replace(/\./g, '-');
  const filePath = path.join(DATA_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export interface ProfileUpdate {
  field: string;
  oldValue: string;
  newValue: string;
}

interface ArticleData {
  dataPoints?: { label: string; value: string; source?: string }[];
  risks?: string[];
  catalysts?: (string | { claimed: string; actual?: string; confidence?: string })[];
  summary?: string;
  company?: string;
}

/**
 * Update a ticker profile from article data.
 * Pulls keyMetrics, bull/bear cases, analyst summary, and overview.
 * Returns list of changes made (empty if nothing changed).
 */
export function updateProfileFromArticle(
  ticker: string,
  dataPoints: { label: string; value: string; source?: string }[],
  company?: string,
  articleData?: ArticleData,
): ProfileUpdate[] {
  const slug = ticker.toLowerCase().replace(/\./g, '-');
  const filePath = path.join(DATA_DIR, `${slug}.json`);

  // Load existing or create minimal profile
  let profile: StockData;
  if (fs.existsSync(filePath)) {
    profile = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else {
    return []; // Don't create profiles from scratch here — ticker-registry handles that
  }

  const updates: ProfileUpdate[] = [];

  // --- 1. Key Metrics from dataPoints ---
  const marketCapPatterns = /market\s*cap|mkt\s*cap|valuation/i;
  const pePatterns = /p\/e|pe\s*ratio|price.to.earnings/i;
  const yieldPatterns = /dividend\s*yield|yield|distribution/i;

  for (const dp of dataPoints) {
    const label = dp.label.toLowerCase();
    const value = dp.value;
    if (!value || value === 'N/A' || value === 'Data pending') continue;

    if (marketCapPatterns.test(label)) {
      if (profile.keyMetrics.marketCap !== value) {
        updates.push({ field: 'keyMetrics.marketCap', oldValue: profile.keyMetrics.marketCap, newValue: value });
        profile.keyMetrics.marketCap = value;
      }
    } else if (pePatterns.test(label)) {
      if (profile.keyMetrics.peRatio !== value) {
        updates.push({ field: 'keyMetrics.peRatio', oldValue: profile.keyMetrics.peRatio, newValue: value });
        profile.keyMetrics.peRatio = value;
      }
    } else if (yieldPatterns.test(label)) {
      if (profile.keyMetrics.dividendYield !== value) {
        updates.push({ field: 'keyMetrics.dividendYield', oldValue: profile.keyMetrics.dividendYield, newValue: value });
        profile.keyMetrics.dividendYield = value;
      }
    }
  }

  // --- 2. Bull/Bear Cases from catalysts/risks ---
  if (articleData?.catalysts && articleData.catalysts.length > 0) {
    const newBullCase = articleData.catalysts.slice(0, 4).map(c =>
      typeof c === 'string' ? c : c.claimed
    ).filter(Boolean);
    if (newBullCase.length > 0) {
      const oldVal = profile.bullCase.join(' | ');
      profile.bullCase = newBullCase;
      updates.push({ field: 'bullCase', oldValue: oldVal, newValue: newBullCase.join(' | ') });
    }
  }

  if (articleData?.risks && articleData.risks.length > 0) {
    const newBearCase = articleData.risks.slice(0, 4);
    if (newBearCase.length > 0) {
      const oldVal = profile.bearCase.join(' | ');
      profile.bearCase = newBearCase;
      updates.push({ field: 'bearCase', oldValue: oldVal, newValue: newBearCase.join(' | ') });
    }
  }

  // --- 3. Analyst Summary from key dataPoints ---
  const summaryParts: string[] = [];
  for (const dp of dataPoints) {
    const label = dp.label.toLowerCase();
    // Pick high-signal metrics for the summary
    if (/revenue|eps|net income|roe|fcf|free cash flow|ebitda/i.test(label)) {
      summaryParts.push(`${dp.label}: ${dp.value}`);
    }
  }
  if (summaryParts.length >= 2) {
    const newSummary = `Key figures: ${summaryParts.slice(0, 5).join('. ')}.`;
    if (profile.analystSummary !== newSummary) {
      updates.push({ field: 'analystSummary', oldValue: profile.analystSummary, newValue: newSummary });
      profile.analystSummary = newSummary;
    }
  }

  // --- 4. Overview from article summary (if longer/fresher) ---
  if (articleData?.summary && articleData.summary.length > 80) {
    const trimmed = articleData.summary.slice(0, 500);
    if (trimmed !== profile.overview) {
      updates.push({ field: 'overview', oldValue: profile.overview.slice(0, 80) + '...', newValue: trimmed.slice(0, 80) + '...' });
      profile.overview = trimmed;
    }
  }

  // --- 5. Company name ---
  const companyName = company || articleData?.company;
  if (companyName && companyName !== profile.company && companyName.length > 2) {
    updates.push({ field: 'company', oldValue: profile.company, newValue: companyName });
    profile.company = companyName;
  }

  if (updates.length > 0) {
    profile.generatedAt = new Date().toISOString();
    profile.generatedBy = 'article-update';
    try {
      fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
      console.log(`[Profile Update] ${ticker}: ${updates.length} field(s) updated from article data`);
    } catch {
      console.log(`[Profile Update] ${ticker}: skipped write (read-only filesystem)`);
    }
  }

  return updates;
}

/**
 * Update ALL candidate profiles from a pick/roast article.
 * Each candidate with a matching profile gets its data refreshed.
 */
export function updateCandidateProfiles(
  candidates: { ticker: string; company: string; score?: number | string; reasonConsidered: string; reasonEliminated?: string }[],
): { ticker: string; updates: ProfileUpdate[] }[] {
  const results: { ticker: string; updates: ProfileUpdate[] }[] = [];

  for (const candidate of candidates) {
    const slug = candidate.ticker.toLowerCase().replace(/\./g, '-');
    const filePath = path.join(DATA_DIR, `${slug}.json`);
    if (!fs.existsSync(filePath)) continue;

    const profile: StockData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const updates: ProfileUpdate[] = [];

    // Update analyst summary with score + reasoning
    const parts: string[] = [];
    if (candidate.score) parts.push(`BullOrBS Score: ${candidate.score}/10`);
    if (candidate.reasonConsidered) parts.push(candidate.reasonConsidered);
    const newSummary = parts.join('. ').slice(0, 300);

    if (newSummary && profile.analystSummary !== newSummary) {
      updates.push({ field: 'analystSummary', oldValue: profile.analystSummary, newValue: newSummary });
      profile.analystSummary = newSummary;
    }

    // Update company name
    if (candidate.company && candidate.company !== profile.company && candidate.company.length > 2) {
      updates.push({ field: 'company', oldValue: profile.company, newValue: candidate.company });
      profile.company = candidate.company;
    }

    if (updates.length > 0) {
      profile.generatedAt = new Date().toISOString();
      profile.generatedBy = 'article-update';
      try {
        fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
      } catch {
        // read-only filesystem
      }
      results.push({ ticker: candidate.ticker, updates });
    }
  }

  return results;
}
