import { getAllArticles } from '@/lib/content';
import SubscribeForm from '@/components/forms/SubscribeForm';
import Link from 'next/link';
import { getAllTickersExpanded } from '@/lib/ticker-registry';
import { getArticleBadge, getTickerBadgeStyle, getArticleGradient, getCategoryChipStyle } from '@/lib/badges';
import { Article } from '@/lib/types';

/** Pull the first interesting data point from an article (the eye-catching number). */
function getKeyStat(article: Article): { label: string; value: string } | null {
  const dp = article.content?.dataPoints;
  if (!dp || dp.length === 0) return null;
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
          const stat = getKeyStat(featured);
          return (
            <Link
              href={`/article/${featured.slug}`}
              className="block border border-card-border rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-xl transition-all group bg-card-bg"
            >
              {/* Gradient visual strip */}
              <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`text-[10px] sm:text-xs font-bold font-mono px-2.5 py-1 rounded-md ${badge.style}`}>
                    {badge.label}
                  </span>
                  {featured.category && featured.type === 'take' && (
                    <span className={`text-[10px] sm:text-xs font-bold font-mono px-2 py-0.5 rounded-md ${getCategoryChipStyle(featured.category)}`}>
                      {featured.category.toUpperCase()}
                    </span>
                  )}
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
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${badge.style}`}>
                      {badge.label}
                    </span>
                    {article.category && article.type === 'take' && (
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${getCategoryChipStyle(article.category)}`}>
                        {article.category.toUpperCase()}
                      </span>
                    )}
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

      {/* How It Works — compact, on-brand */}
      <section className="border-t border-card-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-12">
          <p className="text-xs font-mono tracking-[0.2em] text-muted-light mb-6 text-center">HOW WE CALL BS</p>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
            {[
              { num: '01', title: 'We Read It', desc: 'Someone says "buy this stock." We pull the receipts.' },
              { num: '02', title: 'We Test It', desc: 'AI runs the numbers. Every claim gets fact-checked.' },
              { num: '03', title: 'You Decide', desc: 'Full reasoning published. No paywall. No "trust me bro."' },
            ].map((step) => (
              <div key={step.num} className="p-3 sm:p-4">
                <p className="text-2xl font-bold font-mono text-accent/30 mb-2">{step.num}</p>
                <h3 className="font-bold text-xs sm:text-sm mb-1">{step.title}</h3>
                <p className="text-muted text-[10px] sm:text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-14 sm:py-20 text-center" id="subscribe">
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
