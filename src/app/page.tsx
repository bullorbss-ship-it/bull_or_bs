import { getAllArticles } from '@/lib/content';
import SubscribeForm from '@/components/forms/SubscribeForm';
import Link from 'next/link';
import { getAllTickersExpanded } from '@/lib/ticker-registry';
import { getArticleBadge, getTickerBadgeStyle, getArticleIcon, getArticleGradient } from '@/lib/badges';
import { SketchReader, SketchAnalyzer, SketchPresenter, SketchBullDetective, SketchTarget, SketchNewspaper } from '@/components/ui/Sketches';
import { Article } from '@/lib/types';

/** Pick the right sketch for an article type */
function ArticleSketch({ type, category }: { type: string; category?: string }) {
  if (type === 'roast') return <SketchBullDetective className="text-red opacity-60" size={56} />;
  if (type === 'pick') return <SketchTarget className="text-accent opacity-60" size={56} />;
  return <SketchNewspaper className="text-gold opacity-60" size={56} />;
}

/** Pull the first interesting data point from an article (the eye-catching number). */
function getKeyStat(article: Article): { label: string; value: string } | null {
  const dp = article.content?.dataPoints;
  if (!dp || dp.length === 0) return null;
  // Prefer data points with $ or % in the value — those pop visually
  const money = dp.find(d => /[\$%]/.test(d.value));
  return money || dp[0];
}

export default function Home() {
  const articles = getAllArticles();
  const featured = articles[0];
  const rest = articles.slice(1, 7);
  const totalStocks = getAllTickersExpanded().length;

  return (
    <div>
      {/* Hero — tight, newspaper-style */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-10 sm:pt-16 pb-8 sm:pb-12">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-muted-light mb-4">
            AI-POWERED STOCK ANALYSIS &middot; CANADA &amp; US
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight">
            <span className="text-foreground">Call the Bull.</span>{' '}
            <span className="text-accent">Expose the BS.</span>
          </h1>
          <p className="text-muted text-sm sm:text-base mt-4 leading-relaxed max-w-xl mx-auto">
            AI audits popular stock picks and scores them 1&ndash;10.
            Every claim checked. Every source cited. No paywall.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <Link href="/picks" className="text-sm font-semibold text-accent hover:text-accent-dim transition-colors">
              Picks &rarr;
            </Link>
            <Link href="/roasts" className="text-sm font-semibold text-red hover:text-red/70 transition-colors">
              Roasts &rarr;
            </Link>
            <Link href="/takes" className="text-sm font-semibold text-gold hover:text-gold/70 transition-colors">
              News &rarr;
            </Link>
            <Link href="/stock" className="text-sm font-semibold text-muted hover:text-foreground transition-colors">
              {totalStocks}+ Stocks &rarr;
            </Link>
          </div>
        </div>

        {/* Featured article — large card with gradient strip */}
        {featured && (() => {
          const badge = getArticleBadge(featured.type, featured.category);
          const gradient = getArticleGradient(featured.type, featured.category);
          const icon = getArticleIcon(featured.type, featured.category);
          const stat = getKeyStat(featured);
          return (
            <Link
              href={`/article/${featured.slug}`}
              className="block border border-card-border rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-xl transition-all group bg-card-bg"
            >
              {/* Gradient visual strip */}
              <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  {/* Sketch illustration */}
                  <div className="hidden sm:block flex-shrink-0 mt-1">
                    <ArticleSketch type={featured.type} category={featured.category} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg" aria-hidden="true">{icon}</span>
                      <span className={`text-[10px] sm:text-xs font-bold font-mono px-2.5 py-1 rounded-md ${badge.style}`}>
                        {badge.label}
                      </span>
                      {featured.ticker && (
                        <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded ${getTickerBadgeStyle(featured.ticker)}`}>{featured.ticker}</span>
                      )}
                      <span className="text-xs font-mono text-muted-light ml-auto">
                        {new Date(featured.date).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug group-hover:text-accent transition-colors mb-3">
                      {featured.title}
                    </h2>
                    <p className="text-muted text-sm sm:text-base leading-relaxed line-clamp-2">
                      {featured.description}
                    </p>
                    {/* Key stat callout */}
                    {stat && (
                      <div className="mt-4 inline-flex items-center gap-2 bg-card-border/30 rounded-lg px-3 py-1.5">
                        <span className="text-[10px] font-mono text-muted-light uppercase">{stat.label}</span>
                        <span className="text-sm font-bold font-mono text-foreground">{stat.value}</span>
                      </div>
                    )}
                    <p className="text-accent text-sm font-semibold mt-4">
                      Read analysis &rarr;
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })()}
      </section>

      {/* Divider */}
      <div className="border-t border-card-border" />

      {/* Article feed — tight, 2-col on desktop */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-bold">Latest</h2>
          <Link href="#subscribe" className="text-xs font-mono text-accent hover:text-accent-dim transition-colors">
            GET UPDATES &rarr;
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {rest.map((article) => {
            const badge = getArticleBadge(article.type, article.category);
            const gradient = getArticleGradient(article.type, article.category);
            const icon = getArticleIcon(article.type, article.category);
            const stat = getKeyStat(article);
            return (
              <Link
                key={article.slug}
                href={`/article/${article.slug}`}
                className="flex flex-col border border-card-border rounded-xl overflow-hidden hover:border-accent/40 hover:shadow-lg transition-all group"
              >
                {/* Gradient strip */}
                <div className={`h-1 bg-gradient-to-r ${gradient}`} />
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base" aria-hidden="true">{icon}</span>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${badge.style}`}>
                      {badge.label}
                    </span>
                    {article.ticker && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${getTickerBadgeStyle(article.ticker)}`}>{article.ticker}</span>
                    )}
                    <span className="text-[10px] font-mono text-muted-light ml-auto">
                      {new Date(article.date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-snug line-clamp-2 flex-1">
                    {article.title}
                  </p>
                  {/* Key stat — compact */}
                  {stat && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[9px] font-mono text-muted-light uppercase">{stat.label}:</span>
                      <span className="text-[11px] font-bold font-mono text-foreground">{stat.value}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How It Works — sketch illustrations */}
      <section className="border-t border-card-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-12">
          <p className="text-xs font-mono tracking-[0.2em] text-muted-light mb-8 text-center">HOW WE CALL BS</p>
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <div className="flex flex-col items-center text-center">
              <SketchReader className="text-muted mb-3" size={56} />
              <h3 className="font-bold text-xs sm:text-sm mb-1">We Read It</h3>
              <p className="text-muted text-[10px] sm:text-xs leading-relaxed">Someone says &quot;buy this stock.&quot; We pull the receipts.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <SketchAnalyzer className="text-muted mb-3" size={56} />
              <h3 className="font-bold text-xs sm:text-sm mb-1">We Test It</h3>
              <p className="text-muted text-[10px] sm:text-xs leading-relaxed">AI runs the numbers. Every claim gets fact-checked.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <SketchPresenter className="text-muted mb-3" size={56} />
              <h3 className="font-bold text-xs sm:text-sm mb-1">You Decide</h3>
              <p className="text-muted text-[10px] sm:text-xs leading-relaxed">Full reasoning published. No paywall. No &quot;trust me bro.&quot;</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-14 sm:py-20 text-center" id="subscribe">
        <div className="flex justify-center mb-4">
          <SketchBullDetective className="text-accent opacity-50" size={48} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">
          Smarter analysis, every week.
        </h2>
        <p className="text-muted mb-6 max-w-md mx-auto text-sm">
          AI-driven research delivered free. Full reasoning, no paywall.
        </p>
        <div className="flex justify-center">
          <SubscribeForm />
        </div>
        <p className="text-muted-light text-xs mt-4">
          No spam. Unsubscribe anytime.
        </p>
      </section>
    </div>
  );
}
