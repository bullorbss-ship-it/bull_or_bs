import { getAllArticles, isIndexableArticle } from '@/lib/content';
import { tickerToSlug } from '@/lib/tickers';
import { getAllTickersExpanded } from '@/lib/ticker-registry';
import { siteConfig } from '@/config/site';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles().filter(isIndexableArticle);
  const latestDate = articles[0]?.date ? new Date(articles[0].date) : undefined;
  const reviewedByTicker = new Map<string, typeof articles>();
  for (const article of articles) {
    if (!article.ticker) continue;
    const ticker = article.ticker.toUpperCase();
    reviewedByTicker.set(ticker, [...(reviewedByTicker.get(ticker) || []), article]);
  }

  const articleEntries = articles.map(a => ({
    url: `${siteConfig.url}/article/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Daily briefing per-date entries (last 30 days with briefing content)
  const briefingDates = Array.from(
    new Set(
      articles
        .filter(a => a.tags?.includes('daily-briefing'))
        .map(a => a.date),
    ),
  )
    .sort()
    .reverse()
    .slice(0, 30);

  const dailyEntries = briefingDates.map(d => ({
    url: `${siteConfig.url}/daily/${d}`,
    lastModified: new Date(d),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const stockEntries = getAllTickersExpanded().flatMap(t => {
    const reviewed = reviewedByTicker.get(t.ticker.toUpperCase()) || [];
    if (reviewed.length === 0) return [];
    return [{
      url: `${siteConfig.url}/stock/${tickerToSlug(t.ticker)}`,
      lastModified: new Date(reviewed[0].date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }];
  });

  return [
    {
      url: siteConfig.url,
      ...(latestDate ? { lastModified: latestDate } : {}),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteConfig.url}/stock`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/about`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/disclaimer`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/roasts`,
      ...(latestDate ? { lastModified: latestDate } : {}),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/picks`,
      ...(latestDate ? { lastModified: latestDate } : {}),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/takes`,
      ...(latestDate ? { lastModified: latestDate } : {}),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/editorial`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteConfig.url}/methodology`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/privacy`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/terms`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/learn`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/learn/tfsa`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/learn/rrsp`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/learn/fhsa`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/learn/dividend-investing`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/learn/us-stocks-from-canada`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...articleEntries,
    ...dailyEntries,
    ...stockEntries,
  ];
}
