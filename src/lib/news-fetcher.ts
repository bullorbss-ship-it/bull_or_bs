import { BRIEFING_SLOTS, type BriefingFeed, type BriefingSlotId } from './rss-feeds';

export interface NewsStory {
  title: string;
  url: string;
  description: string;
  pubDate: string; // ISO
  source: string;
  tier: 1 | 2 | 3;
}

// ─── RSS / Atom parsing ─────────────────────────────────────────────────────

const stripCdata = (s: string): string =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();

const decodeEntities = (s: string): string =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');

const stripHtml = (s: string): string =>
  decodeEntities(s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')).trim();

function extractTag(item: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = item.match(re);
  return m ? stripCdata(m[1]) : null;
}

function extractAtomLink(item: string): string | null {
  // <link href="..." /> form (Atom)
  const attr = item.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  if (attr) return attr[1];
  // <link>url</link> form (RSS)
  return extractTag(item, 'link');
}

function parseFeed(xml: string, feed: BriefingFeed): NewsStory[] {
  if (!xml) return [];

  const items: string[] = [];
  // RSS: <item>...</item>
  const rssRe = /<item\b[\s\S]*?<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = rssRe.exec(xml)) !== null) items.push(m[0]);
  // Atom: <entry>...</entry>
  if (items.length === 0) {
    const atomRe = /<entry\b[\s\S]*?<\/entry>/gi;
    while ((m = atomRe.exec(xml)) !== null) items.push(m[0]);
  }

  const stories: NewsStory[] = [];
  for (const item of items) {
    const title = extractTag(item, 'title');
    const link = extractAtomLink(item);
    const desc =
      extractTag(item, 'description') ||
      extractTag(item, 'summary') ||
      extractTag(item, 'content') ||
      '';
    const pub =
      extractTag(item, 'pubDate') ||
      extractTag(item, 'published') ||
      extractTag(item, 'updated') ||
      '';

    if (!title || !link) continue;

    const iso = pub ? new Date(pub).toISOString() : new Date().toISOString();
    stories.push({
      title: decodeEntities(title).trim(),
      url: link.trim(),
      description: stripHtml(desc).slice(0, 2000),
      pubDate: iso,
      source: feed.source,
      tier: feed.tier,
    });
  }
  return stories;
}

export async function fetchFeed(feed: BriefingFeed): Promise<NewsStory[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'BullOrBS/1.0 (daily-briefing)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseFeed(xml, feed);
  } catch {
    return [];
  }
}

export async function fetchBriefingStories(slotId: BriefingSlotId): Promise<NewsStory[]> {
  const slot = BRIEFING_SLOTS.find(s => s.id === slotId);
  if (!slot) return [];
  const all = await Promise.all(slot.feeds.map(fetchFeed));
  return all.flat();
}

// ─── Dedupe + ranking ───────────────────────────────────────────────────────

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'after', 'from', 'into', 'that', 'this',
  'over', 'about', 'new', 'says', 'will', 'have', 'has', 'but', 'are',
  'was', 'were', 'can', 'could', 'would', 'should', 'its', 'their',
]);

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOPWORDS.has(w)),
  );
}

export function jaccard(a: string, b: string): number {
  const A = tokens(a);
  const B = tokens(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function isDuplicate(
  candidate: string,
  existingTitles: string[],
  threshold = 0.6,
): boolean {
  return existingTitles.some(t => jaccard(candidate, t) >= threshold);
}

function recencyScore(iso: string): number {
  const ageHours = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (ageHours < 0) return 1; // future-dated, treat as brand new
  if (ageHours > 24) return 0;
  return 1 - ageHours / 24;
}

function tierScore(tier: 1 | 2 | 3): number {
  return tier === 1 ? 1 : tier === 2 ? 0.6 : 0.3;
}

export function scoreStory(s: NewsStory): number {
  return recencyScore(s.pubDate) * 0.7 + tierScore(s.tier) * 0.3;
}

export function pickBestStory(
  stories: NewsStory[],
  existingTitles: string[],
  maxAgeHours = 24,
): NewsStory | null {
  const now = Date.now();
  const eligible = stories.filter(s => {
    const ageMs = now - new Date(s.pubDate).getTime();
    if (ageMs > maxAgeHours * 3_600_000) return false;
    if (!s.title || s.title.length < 20) return false;
    if (isDuplicate(s.title, existingTitles)) return false;
    return true;
  });
  if (eligible.length === 0) return null;
  eligible.sort((a, b) => scoreStory(b) - scoreStory(a));
  return eligible[0];
}
