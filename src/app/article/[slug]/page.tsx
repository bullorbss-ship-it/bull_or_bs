import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllArticles, getArticleBySlug } from '@/lib/content';
import { siteConfig } from '@/config/site';
import { articleSchema, faqSchema } from '@/config/seo';
import { formatMarkdown } from '@/lib/ai/parse';
import Tournament from '@/components/article/Tournament';
import DataPoints from '@/components/article/DataPoints';
import RisksAndCatalysts from '@/components/article/RisksAndCatalysts';
import Verdict from '@/components/article/Verdict';
import SubscribeForm from '@/components/forms/SubscribeForm';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import type { Metadata } from 'next';

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
      images: [
        {
          url: `${siteConfig.url}/og?type=article&title=${encodeURIComponent(article.title)}&grade=${encodeURIComponent(article.verdict || '')}&articleType=${encodeURIComponent(article.type)}`,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [`${siteConfig.url}/og?type=article&title=${encodeURIComponent(article.title)}&grade=${encodeURIComponent(article.verdict || '')}&articleType=${encodeURIComponent(article.type)}`],
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

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
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

      {/* Grade Badge + Header */}
      <div className="mb-10">
        <div className="flex items-start gap-6 mb-6">
          <div className={`grade-badge grade-badge-xl grade-${grade} flex-shrink-0`}>
            {grade}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
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
            <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
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
        <p className="text-muted text-lg leading-relaxed">
          {content.summary}
        </p>
      </div>

      {/* What they claimed (Roast only) */}
      {isRoast && content.foolClaim && (
        <section className="border-l-4 border-red bg-red/5 rounded-r-lg p-6 mb-8">
          <p className="text-xs font-mono text-red font-bold mb-2">WHAT THEY SAID</p>
          <blockquote className="text-foreground italic leading-relaxed">
            &quot;{content.foolClaim}&quot;
          </blockquote>
          {content.foolSource && (
            <p className="text-muted text-xs mt-2">
              Source: {content.foolSource} {content.foolDate && `(${content.foolDate})`}
            </p>
          )}
        </section>
      )}

      <Tournament candidates={content.candidates} isRoast={isRoast} />

      {/* Full Analysis */}
      <section className="mb-10">
        <h2 className="text-xl font-bold font-mono mb-4 flex items-center gap-2">
          <span className="text-accent">///</span> Full Analysis
        </h2>
        <div
          className="prose prose-invert prose-sm max-w-none leading-relaxed
            prose-headings:font-mono prose-headings:text-foreground
            prose-a:text-accent prose-strong:text-foreground
            prose-p:text-muted"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(content.analysis) }}
        />
      </section>

      <DataPoints dataPoints={content.dataPoints} />
      <RisksAndCatalysts risks={content.risks} catalysts={content.catalysts} />
      <Verdict verdict={content.finalVerdict} />

      {/* Next Analysis */}
      {nextArticle && nextArticle.slug !== article.slug && (
        <section className="border-t border-card-border pt-8 mb-8">
          <Link
            href={`/article/${nextArticle.slug}`}
            className="flex items-center justify-between p-4 border border-card-border rounded-xl hover:border-accent/40 transition-colors group"
          >
            <div>
              <p className="text-xs text-muted-light font-mono mb-1">NEXT ANALYSIS</p>
              <p className="font-semibold group-hover:text-accent transition-colors">
                {nextArticle.content.headline}
              </p>
            </div>
            <span className="text-accent text-2xl">→</span>
          </Link>
        </section>
      )}

      {/* Subscribe CTA */}
      <section className="text-center py-8">
        <h3 className="text-xl font-bold mb-4">
          Want more analysis like this?
        </h3>
        <p className="text-muted mb-6">
          Get AI-driven stock analysis in your inbox every week. Free.
        </p>
        <div className="flex justify-center">
          <SubscribeForm />
        </div>
      </section>
    </div>
  );
}
