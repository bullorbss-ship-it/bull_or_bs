import { notFound } from 'next/navigation';
import { getAllArticles, getArticleBySlug } from '@/lib/content';
import { articleSchema, faqSchema } from '@/config/seo';
import { formatMarkdown } from '@/lib/ai/parse';
import Tournament from '@/components/article/Tournament';
import DataPoints from '@/components/article/DataPoints';
import RisksAndCatalysts from '@/components/article/RisksAndCatalysts';
import Verdict from '@/components/article/Verdict';
import SubscribeForm from '@/components/forms/SubscribeForm';
import type { Metadata } from 'next';

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
      authors: ['NotSoFoolAI'],
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

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${
            isRoast ? 'bg-red/20 text-red' : 'bg-accent/20 text-accent'
          }`}>
            {isRoast ? 'THE ROAST' : 'AI PICK'}
          </span>
          {article.ticker && (
            <span className="text-sm font-mono text-muted border border-card-border px-2 py-1 rounded">
              ${article.ticker}
            </span>
          )}
          <time className="text-xs font-mono text-muted ml-auto" dateTime={article.date}>
            {new Date(article.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
          {content.headline}
        </h1>
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
