/**
 * Allowlisted RSS feeds for the /daily briefing cron.
 * "Verification" happens at this layer: only stories from these sources are
 * eligible. Tier 1 = top-tier source (weighted higher in ranking).
 * A second relevance gate (news-relevance.ts) filters out off-topic stories
 * that slip through from broader feeds.
 */

export type BriefingSlotId = 'ai-tech' | 'markets' | 'canada' | 'geopolitics';

export interface BriefingFeed {
  url: string;
  source: string; // display name
  tier: 1 | 2 | 3;
}

export interface BriefingSlot {
  id: BriefingSlotId;
  label: string;
  feeds: BriefingFeed[];
  /**
   * Broad theme query for the NewsAPI layer (src/lib/newsapi.ts). Catches
   * cross-cutting stories the siloed RSS feeds miss — a G7 communiqué, a
   * summit's trade fallout, a sporting event's economic ripple. Boolean OR
   * syntax per NewsAPI /v2/everything.
   */
  query: string;
}

export const BRIEFING_SLOTS: BriefingSlot[] = [
  {
    id: 'ai-tech',
    label: 'AI & Tech',
    query:
      'artificial intelligence OR semiconductor OR "AI chips" OR OpenAI OR Nvidia OR "data center" OR "cloud computing" OR "tech earnings"',
    feeds: [
      { url: 'https://www.anthropic.com/news/rss.xml', source: 'Anthropic', tier: 1 },
      { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI', tier: 1 },
      { url: 'https://stratechery.com/feed/', source: 'Stratechery', tier: 1 },
      { url: 'https://semianalysis.com/feed/', source: 'SemiAnalysis', tier: 1 },
      { url: 'https://tldr.tech/api/rss/ai', source: 'TLDR AI', tier: 2 },
    ],
  },
  {
    id: 'markets',
    label: 'Markets & Macro',
    query:
      '"stock market" OR "Federal Reserve" OR inflation OR "interest rates" OR "bond yields" OR "S&P 500" OR earnings OR recession OR "oil prices"',
    feeds: [
      // Markets-specific feed (not CNBC top news)
      { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', source: 'CNBC Markets', tier: 1 },
      { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', source: 'WSJ Markets', tier: 1 },
      {
        url: 'https://feeds.marketwatch.com/marketwatch/realtimeheadlines/',
        source: 'MarketWatch',
        tier: 1,
      },
      { url: 'https://seekingalpha.com/market_currents.xml', source: 'Seeking Alpha', tier: 2 },
    ],
  },
  {
    id: 'canada',
    label: 'Canada & TSX',
    query:
      '"Bank of Canada" OR TSX OR "Canadian dollar" OR "Toronto Stock Exchange" OR "Canadian economy" OR "Canada GDP" OR "Canada housing"',
    feeds: [
      {
        url: 'https://www.theglobeandmail.com/investing/markets/feed/',
        source: 'Globe & Mail Investing',
        tier: 1,
      },
      {
        url: 'https://financialpost.com/category/investing/feed',
        source: 'Financial Post Investing',
        tier: 1,
      },
      { url: 'https://www.bnnbloomberg.ca/rss.xml', source: 'BNN Bloomberg', tier: 1 },
      {
        url: 'https://www.canadianminingjournal.com/feed/',
        source: 'Canadian Mining Journal',
        tier: 2,
      },
    ],
  },
  {
    id: 'geopolitics',
    label: 'Geopolitics & War',
    query:
      'G7 OR G20 OR summit OR sanctions OR NATO OR "trade war" OR tariffs OR ceasefire OR "diplomatic talks" OR "military conflict"',
    feeds: [
      { url: 'https://feeds.reuters.com/Reuters/worldNews', source: 'Reuters World', tier: 1 },
      { url: 'https://www.defenseone.com/rss/all/', source: 'Defense One', tier: 1 },
      { url: 'https://warontherocks.com/feed/', source: 'War on the Rocks', tier: 1 },
      { url: 'https://www.csis.org/analysis/feed', source: 'CSIS', tier: 2 },
    ],
  },
];

export const BRIEFING_SLOT_IDS = BRIEFING_SLOTS.map(s => s.id);

export function getSlot(id: string): BriefingSlot | undefined {
  return BRIEFING_SLOTS.find(s => s.id === id);
}
