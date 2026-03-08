/**
 * Cost tracking for AI generation runs.
 * Logs every run to data/costs.json so we can monitor burn rate.
 */

import fs from 'fs';
import path from 'path';

const COSTS_FILE = path.join(process.cwd(), 'data', 'costs.json');

export interface CostEntry {
  id: string;
  date: string;
  type: 'roast' | 'pick';
  ticker?: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  fmpCalls: number;
  durationMs: number;
}

export interface CostSummary {
  totalCost: number;
  totalRuns: number;
  avgCostPerRun: number;
  monthlyBreakdown: Record<string, { cost: number; runs: number }>;
  last30Days: { cost: number; runs: number };
  entries: CostEntry[];
}

// Haiku 4.5 pricing (per 1M tokens)
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-haiku-4-5-20251001': { input: 0.80, output: 4.00 },
  'claude-sonnet-4-5-20250929': { input: 3.00, output: 15.00 },
};

// Batch API = 50% off
const BATCH_DISCOUNT = 0.5;

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  batch = false
): number {
  const pricing = PRICING[model] || PRICING['claude-haiku-4-5-20251001'];
  const discount = batch ? BATCH_DISCOUNT : 1;
  const inputCost = (inputTokens / 1_000_000) * pricing.input * discount;
  const outputCost = (outputTokens / 1_000_000) * pricing.output * discount;
  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000; // 6 decimal places
}

function readCosts(): CostEntry[] {
  try {
    if (!fs.existsSync(COSTS_FILE)) return [];
    return JSON.parse(fs.readFileSync(COSTS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeCosts(entries: CostEntry[]): void {
  const dir = path.dirname(COSTS_FILE);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(COSTS_FILE, JSON.stringify(entries, null, 2));
}

export function logCost(entry: Omit<CostEntry, 'id'>): CostEntry {
  const entries = readCosts();
  const full: CostEntry = {
    ...entry,
    id: `${entry.date}-${entry.type}-${Date.now().toString(36)}`,
  };
  entries.push(full);
  writeCosts(entries);
  return full;
}

export function getCostSummary(): CostSummary {
  const entries = readCosts();
  const totalCost = entries.reduce((sum, e) => sum + e.costUsd, 0);
  const totalRuns = entries.length;

  // Monthly breakdown
  const monthlyBreakdown: Record<string, { cost: number; runs: number }> = {};
  for (const e of entries) {
    const month = e.date.slice(0, 7); // YYYY-MM
    if (!monthlyBreakdown[month]) monthlyBreakdown[month] = { cost: 0, runs: 0 };
    monthlyBreakdown[month].cost += e.costUsd;
    monthlyBreakdown[month].runs += 1;
  }

  // Last 30 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const recent = entries.filter(e => new Date(e.date) >= cutoff);

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    totalRuns,
    avgCostPerRun: totalRuns > 0 ? Math.round((totalCost / totalRuns) * 10000) / 10000 : 0,
    monthlyBreakdown,
    last30Days: {
      cost: Math.round(recent.reduce((s, e) => s + e.costUsd, 0) * 100) / 100,
      runs: recent.length,
    },
    entries: entries.sort((a, b) => b.date.localeCompare(a.date)),
  };
}
