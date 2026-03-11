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

/**
 * Update a ticker profile's keyMetrics from article dataPoints.
 * Only updates metrics that can be matched from the data.
 * Returns list of changes made (empty if nothing changed).
 */
export function updateProfileFromArticle(
  ticker: string,
  dataPoints: { label: string; value: string; source?: string }[],
  company?: string,
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

  // Map dataPoint labels to profile fields
  const labelMap: Record<string, keyof StockData['keyMetrics']> = {};
  const marketCapPatterns = /market\s*cap|mkt\s*cap|valuation/i;
  const pePatterns = /p\/e|pe\s*ratio|price.to.earnings|mer/i;
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

  // Update company name if provided and different
  if (company && company !== profile.company && company.length > 2) {
    updates.push({ field: 'company', oldValue: profile.company, newValue: company });
    profile.company = company;
  }

  if (updates.length > 0) {
    profile.generatedAt = new Date().toISOString();
    profile.generatedBy = 'screenshot-update';
    try {
      fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
      console.log(`[Profile Update] ${ticker}: ${updates.length} field(s) updated from article data`);
    } catch {
      console.log(`[Profile Update] ${ticker}: skipped write (read-only filesystem)`);
    }
  }

  return updates;
}
