/**
 * NewsAPI.org layer for the /daily briefing cron.
 *
 * The curated RSS feeds (rss-feeds.ts) are siloed by publication and topic, so
 * cross-cutting stories slip through — a G7 communiqué, a summit's trade
 * fallout, a sporting event's market ripple. This layer runs ONE broad
 * theme query per slot against NewsAPI's /v2/everything endpoint to surface
 * those stories, then hands them to the same dedupe/ranking pipeline the RSS
 * stories use.
 *
 * Opt-in: if NEWSAPI_KEY is unset the functions no-op and the briefing falls
 * back to RSS-only. The free/developer tier (100 req/day, results delayed up
 * to 24h) is plenty for 4 calls per morning run.
 */

import type { NewsStory } from './news-fetcher';
import { BRIEFING_SLOTS, type BriefingSlotId } from './rss-feeds';

// Well-known wire/national sources get tier 1 so a NewsAPI Reuters story
// competes with curated tier-1 RSS. Everything else is tier 2.
const REPUTABLE = new Set([
  'reuters',
  'associated press',
  'ap news',
  'bloomberg',
  'cnbc',
  'the wall street journal',
  'financial times',
  'the globe and mail',
  'bbc news',
  'the new york times',
  'the economist',
  'marketwatch',
  'axios',
  'politico',
  'the guardian',
  'cnn',
  'npr',
  'al jazeera english',
  'business insider',
]);

interface NewsApiArticle {
  source: { id: string | null; name: string };
  title: string | null;
  description: string | null;
  url: string;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: string;
  articles?: NewsApiArticle[];
}

export function newsApiConfigured(): boolean {
  return Boolean(process.env.NEWSAPI_KEY);
}

export async function fetchNewsApiStories(slotId: BriefingSlotId): Promise<NewsStory[]> {
  const key = process.env.NEWSAPI_KEY;
  if (!key) return [];

  const slot = BRIEFING_SLOTS.find(s => s.id === slotId);
  if (!slot?.query) return [];

  // Look back 36h so an early-morning run still catches yesterday's news.
  const from = new Date(Date.now() - 36 * 3_600_000).toISOString();
  const params = new URLSearchParams({
    q: slot.query,
    from,
    language: 'en',
    sortBy: 'publishedAt',
    pageSize: '20',
  });
  const url = `https://newsapi.org/v2/everything?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        'X-Api-Key': key,
        'User-Agent': 'BullOrBS/1.0 (daily-briefing)',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const data = (await res.json()) as NewsApiResponse;
    if (data.status !== 'ok' || !Array.isArray(data.articles)) return [];

    return data.articles
      .filter(a => a.title && a.url && a.title !== '[Removed]')
      .map(a => {
        const name = (a.source?.name || 'NewsAPI').trim();
        const tier: 1 | 2 = REPUTABLE.has(name.toLowerCase()) ? 1 : 2;
        const desc = (a.description || a.content || '')
          .replace(/\[\+\d+ chars\]$/, '') // NewsAPI free-tier truncation marker
          .replace(/\s+/g, ' ')
          .trim();
        return {
          title: a.title!.trim(),
          url: a.url.trim(),
          description: desc.slice(0, 2000),
          pubDate: a.publishedAt
            ? new Date(a.publishedAt).toISOString()
            : new Date().toISOString(),
          source: name,
          tier,
        } satisfies NewsStory;
      });
  } catch {
    return [];
  }
}
