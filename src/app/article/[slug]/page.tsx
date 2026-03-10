import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllArticles, getArticleBySlug } from '@/lib/content';
import { siteConfig } from '@/config/site';
import { articleSchema, faqSchema } from '@/config/seo';
import { formatMarkdown, linkifyTickers } from '@/lib/ai/parse';
import Tournament from '@/components/article/Tournament';
import DataPoints from '@/components/article/DataPoints';
import RisksAndCatalysts from '@/components/article/RisksAndCatalysts';
import Verdict from '@/components/article/Verdict';
import SubscribeForm from '@/components/forms/SubscribeForm';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Collapsible from '@/components/ui/Collapsible';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

function getGradeFromVerdict(verdict: string): string {
  const match = verdict?.match(/\b([ABCDF][+-]?)\b/);
  return match ? match[1][0] : 'C';
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

  return {
    title: article.title,
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
      authors: [siteConfig.name],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const { content } = article;
  const isRoast = article.type === 'roast';

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

  const grade = getGradeFromVerdict(article.verdict || content.finalVerdict);
  const readingTime = getReadingTime(content.analysis);
  const allArticles = getAllArticles();
  const currentIdx = allArticles.findIndex(a => a.slug === article.slug);
  const nextArticle = allArticles[currentIdx + 1] || allArticles[0];

  const dataPointCount = content.dataPoints?.length || 0;
  const riskCount = content.risks?.length || 0;
  const catalystCount = content.catalysts?.length || 0;
  const candidateCount = content.candidates?.length || 0;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema(article)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqQuestions)) }}
      />

      {/* Breadcrumb */}
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: isRoast ? 'Roasts' : 'Picks', href: isRoast ? '/#roasts' : '/#picks' },
        { label: article.ticker || article.slug },
      ]} />

      {/* Grade Badge + Header — always visible, this is the hook */}
      <div className="mb-8">
        <div className="flex items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className={`grade-badge grade-badge-responsive grade-${grade} flex-shrink-0`}>
            {grade}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
              <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                isRoast ? 'bg-red-light text-red' : 'bg-accent-light text-accent'
              }`}>
                {isRoast ? 'THE ROAST' : 'AI PICK'}
              </span>
              {article.ticker && (
                <Link href={`/stock/${article.ticker.toLowerCase()}`} className="text-sm font-mono text-accent border border-accent/30 px-2 py-1 rounded hover:bg-accent-light transition-colors">
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
            <time className="text-xs font-mono text-muted" dateTime={article.date}>
              {new Date(article.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </div>
        </div>
        <p className="text-muted text-base sm:text-lg leading-relaxed"
          dangerouslySetInnerHTML={{ __html: linkifyTickers(content.summary || '') }}
        />
        <p className="text-xs text-muted-light mt-3 font-mono">
          Data sourced {new Date(article.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Verify current figures before making investment decisions.
        </p>
      </div>

      {/* Verdict — ALWAYS visible (the payoff, keeps them scrolling) */}
      <Verdict verdict={content.finalVerdict} />

      {/* What they claimed (Roast only) — visible, short */}
      {isRoast && content.foolClaim && (
        <section className="border-l-4 border-red bg-red/5 rounded-r-lg p-4 sm:p-6 mb-6">
          <p className="text-xs font-mono text-red font-bold mb-2">WHAT THEY SAID</p>
          <blockquote className="text-foreground italic leading-relaxed text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: `&quot;${linkifyTickers(content.foolClaim || '')}&quot;` }}
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
          dangerouslySetInnerHTML={{ __html: formatMarkdown(content.analysis) }}
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
          <DataPoints dataPoints={content.dataPoints} inline />
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
    </div>
  );
}
