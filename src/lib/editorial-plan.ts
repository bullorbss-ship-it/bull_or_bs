import { getAllArticles } from './content';
import { nowEST } from './date';
import type { EditorialContentType, EditorialPlan, EditorialPlanItem } from './types';
import { assertEditorialStagesAreIsolated, callStageAI, parseStageJson } from './ai/stage-provider';

const VALID_TYPES = new Set<EditorialContentType>([
  'comparison',
  'recommendation-audit',
  'canadian-guide',
]);

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

function isDateInMonth(value: string, month: string): boolean {
  return new RegExp(`^${month}-\\d{2}$`).test(value) && !Number.isNaN(new Date(`${value}T12:00:00Z`).getTime());
}

export function nextMonth(base = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    timeZone: 'America/Toronto',
  }).formatToParts(base);
  const year = Number(parts.find(part => part.type === 'year')?.value);
  const month = Number(parts.find(part => part.type === 'month')?.value);
  const next = new Date(Date.UTC(year, month, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function businessDates(month: string): string[] {
  const [year, monthNumber] = month.split('-').map(Number);
  const result: string[] = [];
  const cursor = new Date(Date.UTC(year, monthNumber - 1, 1, 12));
  while (cursor.getUTCMonth() === monthNumber - 1) {
    const day = cursor.getUTCDay();
    if (day >= 1 && day <= 5) result.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}

export async function generateEditorialPlan(month: string): Promise<EditorialPlan> {
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error('Month must use YYYY-MM');
  assertEditorialStagesAreIsolated();
  const recentTitles = getAllArticles().slice(0, 80).map(article => article.title);
  const dates = businessDates(month);
  const system = `You are the editorial strategist for Bull Or BS, an evidence-first site for Canadian self-directed investors.
Create people-first topics with a concrete decision, original comparison, or claim audit. Avoid generic daily news, broad trend summaries, and keyword variants.
Return only valid JSON.`;
  const user = `Create one evidence-first assignment for every weekday in ${month}.
Use each of these dates exactly once:
${dates.join(', ')}

Required mix:
- About 60% head-to-head comparisons relevant to Canadians
- About 20% recommendation audits with a falsifiable claim and follow-up potential
- About 20% Canadian investor decision guides

Each item must include:
{
  "publishDate": "YYYY-MM-DD in ${month}",
  "type": "comparison | recommendation-audit | canadian-guide",
  "title": "specific working title",
  "primaryKeyword": "one natural-language query",
  "angle": "the exact decision this resolves",
  "tickers": ["0-4 relevant ticker symbols"],
  "whyNow": "why this belongs in this month",
  "uniqueAsset": "an original table, calculation, scorecard, checklist, or dataset"
}

Do not repeat or lightly rewrite these recent titles:
${recentTitles.join('\n')}

Return: {"items":[...]}`;
  const response = await callStageAI('plan', system, user, { maxTokens: 10000 });
  const parsed = parseStageJson<{ items?: Partial<EditorialPlanItem>[] }>(response.text);
  if (!Array.isArray(parsed.items) || parsed.items.length !== dates.length) {
    throw new Error(`Planner must return exactly ${dates.length} weekday items`);
  }
  const seen = new Set<string>();
  const items: EditorialPlanItem[] = parsed.items.map((raw, index) => {
    const type = raw.type as EditorialContentType;
    const title = String(raw.title || '').trim();
    const publishDate = String(raw.publishDate || '');
    if (!VALID_TYPES.has(type) || title.length < 12 || !isDateInMonth(publishDate, month)) {
      throw new Error(`Invalid planner item at position ${index + 1}`);
    }
    const baseId = slugify(`${publishDate}-${title}`);
    const id = seen.has(baseId) ? `${baseId}-${index + 1}` : baseId;
    seen.add(id);
    return {
      id,
      publishDate,
      type,
      title,
      primaryKeyword: String(raw.primaryKeyword || '').trim(),
      angle: String(raw.angle || '').trim(),
      tickers: Array.isArray(raw.tickers)
        ? raw.tickers.map(String).map(ticker => ticker.toUpperCase()).slice(0, 4)
        : [],
      whyNow: String(raw.whyNow || '').trim(),
      uniqueAsset: String(raw.uniqueAsset || '').trim(),
      status: 'planned' as const,
    };
  }).sort((a, b) => a.publishDate.localeCompare(b.publishDate));
  if (items.some((item, index) => item.publishDate !== dates[index])) {
    throw new Error('Planner must schedule exactly one item on every weekday');
  }

  return {
    month,
    status: 'pending_approval',
    createdAt: nowEST(),
    model: response.model,
    items,
  };
}
