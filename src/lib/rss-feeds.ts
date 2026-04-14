/**
 * Allowlisted RSS feeds for the /daily briefing cron.
 * "Verification" happens at this layer: only stories from these sources are
 * eligible. Tier 1 = top-tier wire / primary source (weighted higher in ranking).
 */

export type BriefingSlotId = 'ai-tech' | 'markets' | 'canada' | 'global';

export interface BriefingFeed {
  url: string;
  source: string; // display name
  tier: 1 | 2 | 3;
}

export interface BriefingSlot {
  id: BriefingSlotId;
  label: string;
  feeds: BriefingFeed[];
}

export const BRIEFING_SLOTS: BriefingSlot[] = [
  {
    id: 'ai-tech',
    label: 'AI & Tech',
    feeds: [
      { url: 'https://www.anthropic.com/news/rss.xml', source: 'Anthropic', tier: 1 },
      { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI', tier: 1 },
      {
        url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
        source: 'TechCrunch',
        tier: 2,
      },
      {
        url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
        source: 'The Verge',
        tier: 2,
      },
      { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', source: 'Ars Technica', tier: 2 },
    ],
  },
  {
    id: 'markets',
    label: 'Markets & Macro',
    feeds: [
      {
        url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
        source: 'CNBC',
        tier: 1,
      },
      { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters', tier: 1 },
      { url: 'https://feeds.marketwatch.com/marketwatch/topstories/', source: 'MarketWatch', tier: 2 },
    ],
  },
  {
    id: 'canada',
    label: 'Canada & TSX',
    feeds: [
      { url: 'https://www.theglobeandmail.com/business/rss/', source: 'Globe & Mail', tier: 1 },
      { url: 'https://www.bnnbloomberg.ca/rss.xml', source: 'BNN Bloomberg', tier: 1 },
      { url: 'https://financialpost.com/feed/', source: 'Financial Post', tier: 2 },
      { url: 'https://www.cbc.ca/webfeed/rss/rss-business', source: 'CBC Business', tier: 2 },
    ],
  },
  {
    id: 'global',
    label: 'Global News',
    feeds: [
      { url: 'https://feeds.reuters.com/Reuters/worldNews', source: 'Reuters World', tier: 1 },
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business', tier: 1 },
      { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', tier: 2 },
    ],
  },
];

export const BRIEFING_SLOT_IDS = BRIEFING_SLOTS.map(s => s.id);

export function getSlot(id: string): BriefingSlot | undefined {
  return BRIEFING_SLOTS.find(s => s.id === id);
}
