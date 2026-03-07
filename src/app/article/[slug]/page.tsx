import { notFound } from 'next/navigation';
import { getAllArticles, getArticleBySlug } from '@/lib/content';
import SubscribeForm from '@/components/SubscribeForm';
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

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Schema.org Article structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.description,
            datePublished: article.date,
            author: { '@type': 'Organization', name: 'NotSoFoolAI' },
            publisher: {
              '@type': 'Organization',
              name: 'NotSoFoolAI',
              url: 'https://notsofoolai.com',
            },
            mainEntityOfPage: `https://notsofoolai.com/article/${article.slug}`,
          }),
        }}
      />

      {/* FAQ structured data for AIO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: article.ticker
                  ? `Should you buy ${article.ticker} stock?`
                  : 'What stocks should you buy this week?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: content.finalVerdict,
                },
              },
              ...(isRoast && content.foolClaim
                ? [{
                    '@type': 'Question',
                    name: `Is the recommendation to buy ${article.ticker} a good idea?`,
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: content.summary,
                    },
                  }]
                : []),
            ],
          }),
        }}
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

      {/* Elimination Tournament */}
      {content.candidates && content.candidates.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold font-mono mb-4 flex items-center gap-2">
            <span className="text-accent">///</span> The Tournament
          </h2>
          <p className="text-muted text-sm mb-6">
            {isRoast
              ? 'Stocks they should have considered instead:'
              : 'Every stock we evaluated, and why most didn\'t make the cut:'}
          </p>
          <div className="space-y-3">
            {content.candidates.map((c, i) => (
              <div
                key={i}
                className={`border rounded-lg p-4 ${
                  c.status === 'selected'
                    ? 'border-accent bg-accent/5'
                    : c.status === 'eliminated'
                    ? 'border-card-border bg-card-bg opacity-70'
                    : 'border-card-border bg-card-bg'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      c.status === 'selected'
                        ? 'bg-accent/20 text-accent'
                        : c.status === 'eliminated'
                        ? 'bg-red/20 text-red'
                        : 'bg-yellow/20 text-yellow'
                    }`}>
                      {c.status === 'selected' ? 'SELECTED' : c.status === 'eliminated' ? 'CUT' : 'CONSIDERED'}
                    </span>
                    <span className="font-mono font-bold">${c.ticker}</span>
                    <span className="text-muted text-sm">{c.company}</span>
                  </div>
                  {c.score && (
                    <span className="text-xs font-mono text-muted">
                      Score: {c.score}/10
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  {c.status === 'eliminated' ? c.reasonEliminated : c.reasonConsidered}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

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

      {/* Data Points */}
      {content.dataPoints && content.dataPoints.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold font-mono mb-4 flex items-center gap-2">
            <span className="text-accent">///</span> Key Data
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {content.dataPoints.map((dp, i) => (
              <div key={i} className="border border-card-border bg-card-bg rounded-lg p-4">
                <p className="text-xs font-mono text-muted mb-1">{dp.label}</p>
                <p className="text-lg font-bold text-foreground">{dp.value}</p>
                {dp.source && (
                  <p className="text-xs text-muted mt-1">{dp.source}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Risks & Catalysts */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {content.risks && content.risks.length > 0 && (
          <div className="border border-card-border bg-card-bg rounded-lg p-6">
            <h3 className="text-sm font-mono font-bold text-red mb-3">RISKS</h3>
            <ul className="space-y-2">
              {content.risks.map((r, i) => (
                <li key={i} className="text-sm text-muted flex gap-2">
                  <span className="text-red shrink-0">&bull;</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
        {content.catalysts && content.catalysts.length > 0 && (
          <div className="border border-card-border bg-card-bg rounded-lg p-6">
            <h3 className="text-sm font-mono font-bold text-accent mb-3">CATALYSTS</h3>
            <ul className="space-y-2">
              {content.catalysts.map((c, i) => (
                <li key={i} className="text-sm text-muted flex gap-2">
                  <span className="text-accent shrink-0">&bull;</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Verdict */}
      <section className="border border-accent bg-accent/5 rounded-lg p-8 mb-10">
        <h2 className="text-sm font-mono font-bold text-accent mb-3">THE VERDICT</h2>
        <p className="text-foreground text-lg leading-relaxed">
          {content.finalVerdict}
        </p>
      </section>

      {/* Disclaimer */}
      <div className="border border-card-border bg-card-bg rounded-lg p-6 mb-10 text-xs text-muted leading-relaxed">
        <p className="font-mono font-bold text-foreground mb-2">DISCLAIMER</p>
        <p>
          This analysis is AI-generated by NotSoFoolAI for educational and entertainment
          purposes only. It is not financial advice. NotSoFoolAI is not affiliated with
          The Motley Fool or any financial institution. Always do your own research and
          consult a qualified financial advisor before making investment decisions.
        </p>
      </div>

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

function formatMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>')
    .replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.*)$/, '<p>$1</p>');
}
