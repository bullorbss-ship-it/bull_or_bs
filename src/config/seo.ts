import { siteConfig } from './site';
import type { Metadata } from 'next';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.displayName} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.displayName}`,
  },
  description: siteConfig.description,
  keywords: [
    'AI stock analysis',
    'stock picks graded',
    'should I buy stock',
    'stock picks',
    'AI investing',
    'Canadian stocks',
    'TSX analysis',
    'stock market analysis',
    'AI-driven investing',
    'stock recommendation audit',
  ],
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.displayName,
    title: `${siteConfig.displayName} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: `${siteConfig.url}/og?type=default`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.displayName} — ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bull_or_bs',
    creator: '@bull_or_bs',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': '/feed.xml' },
  },
};

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.displayName,
    url: siteConfig.url,
    description: `${siteConfig.displayName} — ${siteConfig.tagline}`,
    sameAs: Object.values(siteConfig.social),
  };
}

export function articleSchema(article: {
  title: string;
  description: string;
  date: string;
  slug: string;
  ticker?: string;
  company?: string;
  exchange?: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    author: { '@type': 'Organization', name: siteConfig.displayName },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.displayName,
      url: siteConfig.url,
    },
    mainEntityOfPage: `${siteConfig.url}/article/${article.slug}`,
  };

  if (article.ticker && article.exchange) {
    schema.tickerSymbol = `${article.exchange}:${article.ticker}`;
    schema.mentions = [{
      '@type': 'Corporation',
      name: article.company || article.ticker,
      tickerSymbol: article.ticker,
      exchange: article.exchange,
    }];
  }

  return schema;
}

export function faqSchema(questions: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function reviewSchema(article: {
  title: string;
  description: string;
  date: string;
  slug: string;
  type: string;
  verdict: string;
  ticker?: string;
  company?: string;
  exchange?: string;
}) {
  // Only generate Review schema for graded content (roasts/picks, not takes)
  if (article.type === 'take') return null;

  // Extract numeric rating: "Score: 7/10" → 7, or letter grade → number
  let ratingValue: number | null = null;
  const scoreMatch = article.verdict?.match(/\b(\d{1,2})\/10\b/);
  if (scoreMatch) {
    ratingValue = parseInt(scoreMatch[1], 10);
  } else {
    // Convert letter grades to 1-10 scale
    const gradeMatch = article.verdict?.match(/\bGRADE:\s*([ABCDF][+-]?)\b/i);
    if (gradeMatch) {
      const gradeMap: Record<string, number> = {
        'A+': 10, 'A': 9, 'A-': 8.5,
        'B+': 8, 'B': 7, 'B-': 6.5,
        'C+': 6, 'C': 5, 'C-': 4.5,
        'D+': 4, 'D': 3, 'D-': 2.5,
        'F': 1,
      };
      ratingValue = gradeMap[gradeMatch[1].toUpperCase()] || 5;
    }
  }

  if (ratingValue === null) return null;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    author: { '@type': 'Organization', name: siteConfig.displayName },
    publisher: { '@type': 'Organization', name: siteConfig.displayName, url: siteConfig.url },
    url: `${siteConfig.url}/article/${article.slug}`,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: ratingValue,
      bestRating: 10,
      worstRating: 1,
    },
  };

  // Add itemReviewed if we have ticker info
  if (article.ticker) {
    schema.itemReviewed = {
      '@type': article.exchange ? 'Corporation' : 'Thing',
      name: article.company || article.ticker,
      ...(article.exchange && { tickerSymbol: article.ticker, exchange: article.exchange }),
    };
  }

  return schema;
}

export function corporationSchema(ticker: string, company: string, exchange: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Corporation',
    name: company,
    tickerSymbol: ticker,
    exchange,
    url: `${siteConfig.url}/stock/${ticker.toLowerCase().replace('.', '-')}`,
  };
}

export function newsArticleSchema(article: {
  title: string;
  description: string;
  date: string;
  slug: string;
  type: string;
  ticker?: string;
  company?: string;
  exchange?: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    articleSection: article.type,
    author: {
      '@type': 'Organization',
      name: siteConfig.displayName,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.displayName,
      url: siteConfig.url,
    },
    mainEntityOfPage: `${siteConfig.url}/article/${article.slug}`,
  };

  if (article.ticker && article.exchange) {
    schema.tickerSymbol = `${article.exchange}:${article.ticker}`;
    schema.mentions = [{
      '@type': 'Corporation',
      name: article.company || article.ticker,
      tickerSymbol: article.ticker,
      exchange: article.exchange,
    }];
  }

  return schema;
}
