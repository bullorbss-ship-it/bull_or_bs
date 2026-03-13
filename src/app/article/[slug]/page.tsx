import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllArticles, getArticleBySlug } from '@/lib/content';
import { getTickerInfo } from '@/lib/tickers';
import { siteConfig } from '@/config/site';
import { articleSchema, faqSchema, reviewSchema } from '@/config/seo';
import { formatMarkdown, linkifyTickers } from '@/lib/ai/parse';
import Tournament from '@/components/article/Tournament';
import DataPoints from '@/components/article/DataPoints';
import RisksAndCatalysts from '@/components/article/RisksAndCatalysts';
import Verdict from '@/components/article/Verdict';
import SubscribeForm from '@/components/forms/SubscribeForm';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ScoreGauge from '@/components/article/ScoreGauge';
import Collapsible from '@/components/ui/Collapsible';
import ConsentGate from '@/components/article/ConsentGate';
import ScrollTracker from '@/components/article/ScrollTracker';
import { getArticleBadge, getTickerBadgeStyle, getCategoryChipStyle } from '@/lib/badges';
import type { Metadata } from 'next';

function getScoreFromVerdict(verdict: string): number | null {
  // New system: look for "Score: 7/10" or "7/10" pattern
  const scoreMatch = verdict?.match(/\b(\d{1,2})\/10\b/);
  if (scoreMatch) {
    const n = parseInt(scoreMatch[1], 10);
    if (n >= 1 && n <= 10) return n;
  }
  return null;
}

function getGradeFromVerdict(verdict: string): string {
  // New 1-10 system
  const score = getScoreFromVerdict(verdict);
  if (score !== null) return String(score);
  // Legacy A-F for old articles
  const match = verdict?.match(/\b([ABCDF][+-]?)\b/);
  return match ? match[1][0] : 'C';
}

function getScoreColor(grade: string): string {
  const n = parseInt(grade, 10);
  if (!isNaN(n)) {
    if (n >= 8) return 'accent';
    if (n >= 6) return 'gold';
    if (n >= 4) return 'orange';
    return 'red';
  }
  // Legacy letter grades
  if (grade === 'A' || grade === 'B') return 'accent';
  if (grade === 'C') return 'gold';
  if (grade === 'D') return 'orange';
  return 'red';
}

/**
 * Generate an SEO-optimized title for search results.
 * Catchy headline stays as the on-page H1, but <title> targets search intent.
 */
function getSeoTitle(article: { type: string; ticker?: string; title: string; verdict?: string }): string {
  const ticker = article.ticker;
  const year = new Date().getFullYear();

  if (article.type === 'roast' && ticker) {
    // Extract grade for title
    const gradeMatch = article.verdict?.match(/\bGRADE:\s*([ABCDF][+-]?)\b/i);
    const scoreMatch = article.verdict?.match(/\b(\d{1,2})\/10\b/);
    const grade = scoreMatch ? `${scoreMatch[1]}/10` : gradeMatch ? gradeMatch[1] : null;
    return grade
      ? `${ticker} Stock Analysis ${year}: Rated ${grade} — Should You Buy?`
      : `${ticker} Stock Analysis ${year} — Should You Buy ${ticker}?`;
  }

  if (article.type === 'pick' && ticker) {
    return `${ticker} Stock Review ${year} — AI Analysis & Rating`;
  }

  if (article.type === 'take') {
    return article.title; // Takes are already news-headline style
  }

  return article.title;
}

function getReadingTime(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  const isTake = article.type === 'take';
  const grade = isTake ? '' : getGradeFromVerdict(article.verdict || article.content?.finalVerdict || '');
  const seoTitle = getSeoTitle({ ...article, verdict: article.verdict || article.content?.finalVerdict });

  return {
    title: seoTitle,
    description: article.description,
    keywords: [
      article.ticker ? `${article.ticker} stock analysis` : '',
      article.ticker ? `should I buy ${article.ticker}` : '',
      'AI stock analysis',
      'stock pick review',
      ...article.tags,
    ].filter(Boolean),
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.date,
      authors: [siteConfig.displayName],
      tags: article.tags,
      images: [
        {
          url: `${siteConfig.url}/og?type=article&title=${encodeURIComponent(article.title)}&grade=${encodeURIComponent(grade)}&articleType=${article.type}&ticker=${encodeURIComponent(article.ticker || '')}`,
          width: 1200,
          height: 630,
          alt: `${article.title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [`${siteConfig.url}/og?type=article&title=${encodeURIComponent(article.title)}&grade=${encodeURIComponent(grade)}&articleType=${article.type}&ticker=${encodeURIComponent(article.ticker || '')}`],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const { content } = article;
  const isRoast = article.type === 'roast';
  const isTake = article.type === 'take';

  const faqQuestions = [
    {
      question: article.ticker
        ? `Should you buy ${article.ticker} stock?`
        : 'What stocks should you buy this week?',
      answer: content.finalVerdict,
    },
    ...(isRoast && content.foolClaim
      ? [{
          question: `Is the recommendation to buy ${article.ticker} a good idea?`,
          answer: content.summary,
        }]
      : []),
  ];

  const grade = isTake ? null : getGradeFromVerdict(article.verdict || content.finalVerdict);
  const readingTime = getReadingTime(content.analysis);

  // Build Review schema for graded articles (roasts/picks)
  const tickerInfo = article.ticker ? getTickerInfo(article.ticker) : null;
  const review = reviewSchema({
    ...article,
    verdict: article.verdict || content.finalVerdict,
    ...(tickerInfo ? { company: tickerInfo.company, exchange: tickerInfo.exchange } : {}),
  });
  const allArticles = getAllArticles();
  const currentIdx = allArticles.findIndex(a => a.slug === article.slug);
  const nextArticle = allArticles[currentIdx + 1] || allArticles[0];

  // Collect tickers mentioned in this article for efficient linkification
  const articleTickers = [
    article.ticker,
    ...(content.candidates?.map(c => c.ticker) || []),
  ].filter(Boolean) as string[];

  const dataPointCount = content.dataPoints?.length || 0;
  const riskCount = content.risks?.length || 0;
  const catalystCount = content.catalysts?.length || 0;
  const candidateCount = content.candidates?.length || 0;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      <ScrollTracker slug={article.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema({
          ...article,
          ...(tickerInfo ? { company: tickerInfo.company, exchange: tickerInfo.exchange } : {}),
        })) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqQuestions)) }}
      />
      {review && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(review) }}
        />
      )}

      {/* Breadcrumb */}
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: isRoast ? 'Roasts' : isTake ? 'News' : 'Picks', href: isRoast ? '/roasts' : isTake ? '/takes' : '/picks' },
        { label: article.ticker || article.slug },
      ]} />

      {/* Score + Header — always visible, this is the hook */}
      <div className="mb-8">
        <div className="flex items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
          {grade && (
            <div className="flex-shrink-0 hidden sm:block">
              <ScoreGauge score={grade} size="lg" />
            </div>
          )}
          {grade && (
            <div className="flex-shrink-0 sm:hidden">
              <ScoreGauge score={grade} size="md" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
              {(() => {
                const badge = getArticleBadge(article.type, article.category);
                return (
                  <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${badge.style}`}>
                    {badge.label}
                  </span>
                );
              })()}
              {article.category && isTake && (
                <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${getCategoryChipStyle(article.category)}`}>
                  {article.category}
                </span>
              )}
              {article.ticker && (
                <Link href={`/stock/${article.ticker.toLowerCase()}`} className={`text-sm px-2 py-1 rounded hover:opacity-80 transition-opacity ${getTickerBadgeStyle(article.ticker)}`}>
                  {article.ticker}
                </Link>
              )}
              <span className="text-xs text-muted-light ml-auto">
                {readingTime} min read
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight mb-2">
              {content.headline}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <time className="text-xs font-mono text-muted" dateTime={article.date}>
                {new Date(article.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
              {content.newsSource && (
                <span className="text-xs font-mono text-muted-light">
                  · Source: {content.newsUrl ? (
                    <a href={content.newsUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-dim underline">{content.newsSource}</a>
                  ) : (
                    <span className="text-foreground">{content.newsSource}</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-muted text-base sm:text-lg leading-relaxed"
          dangerouslySetInnerHTML={{ __html: linkifyTickers(content.summary || '', articleTickers) }}
        />
        <p className="text-xs text-muted-light mt-3 font-mono">
          Data sourced {new Date(article.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Verify current figures before making investment decisions.
        </p>
      </div>

      <ConsentGate articleType={article.type}>
      {/* Verdict — ALWAYS visible (the payoff, keeps them scrolling) */}
      <Verdict verdict={content.finalVerdict} />

      {/* What they claimed (Roast only) — visible, short */}
      {isRoast && content.foolClaim && (
        <section className="border-l-4 border-red bg-red/5 rounded-r-lg p-4 sm:p-6 mb-6">
          <p className="text-xs font-mono text-red font-bold mb-2">WHAT THEY SAID</p>
          <blockquote className="text-foreground italic leading-relaxed text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: `&quot;${linkifyTickers(content.foolClaim || '', articleTickers)}&quot;` }}
          />
          {content.foolSource && (
            <p className="text-muted text-xs mt-2">
              Source: {content.foolSource} {content.foolDate && `(${content.foolDate})`}
            </p>
          )}
        </section>
      )}

      {/* Tournament — collapsible */}
      {content.candidates && content.candidates.length > 0 && (
        <Collapsible
          title="The Tournament"
          badge={`${candidateCount} stocks`}
          defaultOpen={false}
          icon={<span className="text-accent text-sm">&#9733;</span>}
        >
          <p className="text-muted text-sm mb-4">
            {isRoast
              ? 'Stocks they should have considered instead:'
              : 'Every stock we evaluated, and why most didn\'t make the cut:'}
          </p>
          <Tournament candidates={content.candidates} isRoast={isRoast} inline />
        </Collapsible>
      )}

      {/* Full Analysis — collapsible (the deep dive) */}
      <Collapsible
        title="Full Analysis"
        badge={`${readingTime} min read`}
        defaultOpen={!isRoast}
        icon={<span className="text-accent font-mono text-sm font-bold">{"///"}</span>}
      >
        <div
          className="max-w-none"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(content.analysis, articleTickers) }}
        />
      </Collapsible>

      {/* Key Data — collapsible */}
      {content.dataPoints && content.dataPoints.length > 0 && (
        <Collapsible
          title="Key Data"
          badge={`${dataPointCount} points`}
          defaultOpen={false}
          icon={<span className="text-accent text-sm">&#9642;</span>}
        >
          <DataPoints dataPoints={content.dataPoints} inline provenance={{ type: article.type, newsSource: content.newsSource, newsUrl: content.newsUrl }} />
        </Collapsible>
      )}

      {/* Risks & Catalysts — collapsible */}
      {((content.risks && content.risks.length > 0) || (content.catalysts && content.catalysts.length > 0)) && (
        <Collapsible
          title="Risks & Catalysts"
          badge={`${riskCount + catalystCount} items`}
          defaultOpen={false}
          icon={<span className="text-yellow text-sm">&#9888;</span>}
        >
          <RisksAndCatalysts risks={content.risks} catalysts={content.catalysts} inline />
        </Collapsible>
      )}

      {/* Next Analysis */}
      {nextArticle && nextArticle.slug !== article.slug && (
        <section className="border-t border-card-border pt-6 sm:pt-8 mb-6 sm:mb-8">
          <Link
            href={`/article/${nextArticle.slug}`}
            className="flex items-center justify-between p-4 border border-card-border rounded-xl hover:border-accent/40 transition-colors group"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-light font-mono mb-1">NEXT ANALYSIS</p>
              <p className="font-semibold group-hover:text-accent transition-colors truncate">
                {nextArticle.content.headline}
              </p>
            </div>
            <span className="text-accent text-2xl ml-3 shrink-0">&rarr;</span>
          </Link>
        </section>
      )}

      {/* Subscribe CTA */}
      <section className="text-center py-6 sm:py-8">
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
          Want more analysis like this?
        </h3>
        <p className="text-muted mb-4 sm:mb-6 text-sm sm:text-base">
          Get AI-driven stock analysis in your inbox every week. Free.
        </p>
        <div className="flex justify-center">
          <SubscribeForm />
        </div>
      </section>
      </ConsentGate>
    </div>
  );
}
