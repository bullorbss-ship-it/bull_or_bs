import { getAllArticles } from '@/lib/content';
import SubscribeForm from '@/components/forms/SubscribeForm';
import ArticleStream from '@/components/article/ArticleStream';
import Link from 'next/link';
import { getAllTickersExpanded } from '@/lib/ticker-registry';
import { getArticleBadge, getTickerBadgeStyle, getCategoryChipStyle } from '@/lib/badges';
import { Article } from '@/lib/types';
import { siteConfig } from '@/config/site';

/** Get display image: heroImage → OG image fallback */
function getArticleImage(article: Article): string {
  if (article.heroImage?.url) return article.heroImage.url;
  const grade = article.type === 'take' ? '' : (article.verdict?.match(/\b(\d{1,2})\/10\b/)?.[1] || '');
  return `${siteConfig.url}/og?type=article&title=${encodeURIComponent(article.title)}&grade=${encodeURIComponent(grade)}&articleType=${article.type}&ticker=${encodeURIComponent(article.ticker || '')}&source=${encodeURIComponent(article.content?.newsSource || '')}&v=${encodeURIComponent(article.date || '1')}`;
}

function formatDate(date: string, short = false) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(short ? {} : { year: 'numeric' }),
  });
}

export default function Home() {
  const articles = getAllArticles();
  const featured = articles[0];
  const midFeature = articles[1];
  const midHeadlines = articles.slice(2, 7);
  const latestHeadlines = articles.slice(7, 14);
  const totalStocks = getAllTickersExpanded().length;

  return (
    <div>
      {/* Tagline */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-muted-light mb-3">
            AI-POWERED STOCK ANALYSIS &middot; CANADA &amp; US
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight">
            <span className="text-foreground">Call the Bull.</span>{' '}
            <span className="text-accent">Expose the BS.</span>
          </h1>
          <p className="text-muted text-sm sm:text-base mt-3 leading-relaxed max-w-xl mx-auto">
            AI audits popular stock picks and scores them 1&ndash;10.
            Every claim checked. Every source cited. No paywall.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-5">
            <Link href="/picks" className="text-sm font-semibold text-accent hover:text-accent-dim transition-colors">Picks &rarr;</Link>
            <Link href="/roasts" className="text-sm font-semibold text-red hover:text-red/70 transition-colors">Roasts &rarr;</Link>
            <Link href="/takes" className="text-sm font-semibold text-gold hover:text-gold/70 transition-colors">News &rarr;</Link>
            <Link href="/stock" className="text-sm font-semibold text-muted hover:text-foreground transition-colors">{totalStocks}+ Stocks &rarr;</Link>
          </div>
        </div>

        {/* Desktop: 3-column grid | Mobile: just featured hero */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          {/* LEFT — Featured hero (all screens) */}
          <div className="lg:col-span-5">
            {featured && (() => {
              const badge = getArticleBadge(featured.type, featured.category);
              const hasPhoto = !!featured.heroImage?.url;
              return (
                <Link
                  href={`/article/${featured.slug}`}
                  className="block rounded-2xl overflow-hidden hover:shadow-xl transition-all group lg:h-full"
                >
                  {hasPhoto ? (
                    <div className="relative h-[220px] sm:h-[320px] lg:h-full lg:min-h-[420px] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featured.heroImage!.url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                          <span className="text-[10px] sm:text-xs font-bold font-mono px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-sm text-white border border-white/20">
                            {badge.label}
                          </span>
                          {featured.category && featured.type === 'take' && (
                            <span className="text-[10px] sm:text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-sm text-white border border-white/20">
                              {featured.category.toUpperCase()}
                            </span>
                          )}
                          {featured.ticker && (
                            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-white/15 backdrop-blur-sm text-white font-mono border border-white/20">
                              {featured.ticker}
                            </span>
                          )}
                          <span className="text-[10px] sm:text-xs font-mono text-white/60 ml-auto">
                            {formatDate(featured.date)}
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-snug">
                          {featured.title}
                        </h2>
                        <p className="text-white/75 text-sm sm:text-base mt-2 line-clamp-2 max-w-2xl">
                          {featured.description}
                        </p>
                        <span className="inline-block text-accent text-sm font-semibold mt-3 group-hover:translate-x-1 transition-transform">
                          Read analysis &rarr;
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-[220px] sm:h-[320px] lg:h-full lg:min-h-[420px] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/hero-default.svg"
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                          <span className="text-[10px] sm:text-xs font-bold font-mono px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-sm text-white border border-white/20">
                            {badge.label}
                          </span>
                          {featured.category && featured.type === 'take' && (
                            <span className="text-[10px] sm:text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-sm text-white border border-white/20">
                              {featured.category.toUpperCase()}
                            </span>
                          )}
                          {featured.ticker && (
                            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-white/15 backdrop-blur-sm text-white font-mono border border-white/20">
                              {featured.ticker}
                            </span>
                          )}
                          <span className="text-[10px] sm:text-xs font-mono text-white/60 ml-auto">
                            {formatDate(featured.date)}
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-snug">
                          {featured.title}
                        </h2>
                        <p className="text-white/75 text-sm sm:text-base mt-2 line-clamp-2 max-w-2xl">
                          {featured.description}
                        </p>
                        <span className="inline-block text-accent text-sm font-semibold mt-3 group-hover:translate-x-1 transition-transform">
                          Read analysis &rarr;
                        </span>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })()}
          </div>

          {/* MIDDLE — Image card + text headlines (desktop only) */}
          <div className="hidden lg:flex lg:flex-col lg:col-span-4">
            {/* Top article with column-width image */}
            {midFeature && (() => {
              const badge = getArticleBadge(midFeature.type, midFeature.category);
              return (
                <Link href={`/article/${midFeature.slug}`} className="block pb-3 mb-1 border-b border-card-border group">
                  <div className="w-full h-[160px] rounded-lg overflow-hidden mb-2.5 bg-card-border/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getArticleImage(midFeature)}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-snug line-clamp-2">
                    {midFeature.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${badge.style}`}>{badge.label}</span>
                    <span className="text-[9px] font-mono text-muted-light">&middot; {formatDate(midFeature.date, true)}</span>
                    {midFeature.ticker && (
                      <span className={`text-[9px] px-1 py-0.5 rounded ${getTickerBadgeStyle(midFeature.ticker)}`}>{midFeature.ticker}</span>
                    )}
                  </div>
                </Link>
              );
            })()}

            {/* Text-only headlines */}
            {midHeadlines.map((article) => {
              const badge = getArticleBadge(article.type, article.category);
              return (
                <Link key={article.slug} href={`/article/${article.slug}`} className="block py-2.5 border-b border-card-border last:border-b-0 group">
                  <h3 className="text-[13px] font-semibold text-foreground group-hover:text-accent transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${badge.style}`}>{badge.label}</span>
                    <span className="text-[9px] font-mono text-muted-light">&middot; {formatDate(article.date, true)}</span>
                    {article.ticker && (
                      <span className={`text-[9px] px-1 py-0.5 rounded ${getTickerBadgeStyle(article.ticker)}`}>{article.ticker}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* RIGHT — Latest headlines (desktop only) */}
          <div className="hidden lg:block lg:col-span-3">
            <h3 className="text-sm font-bold mb-3">Latest</h3>
            {latestHeadlines.map((article) => {
              const badge = getArticleBadge(article.type, article.category);
              return (
                <Link key={article.slug} href={`/article/${article.slug}`} className="block py-2.5 border-b border-card-border last:border-b-0 group">
                  <h3 className="text-[13px] font-semibold text-foreground group-hover:text-accent transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${badge.style}`}>{badge.label}</span>
                    <span className="text-[9px] font-mono text-muted-light">&middot; {formatDate(article.date, true)}</span>
                    {article.ticker && (
                      <span className={`text-[9px] px-1 py-0.5 rounded ${getTickerBadgeStyle(article.ticker)}`}>{article.ticker}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Article stream — horizontal cards */}
      <div className="border-t border-card-border" />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* "Latest" heading only on mobile (desktop grid already shows it) */}
        <div className="flex items-baseline justify-between mb-5 lg:hidden">
          <h2 className="text-lg sm:text-xl font-bold">Latest</h2>
          <Link href="#subscribe" className="text-xs font-mono text-accent hover:text-accent-dim transition-colors">
            GET UPDATES &rarr;
          </Link>
        </div>

        <ArticleStream
          articles={articles.slice(1)}
          desktopGridCount={13}
        />
      </section>

      {/* How It Works */}
      <section className="border-t border-card-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-12">
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
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20 text-center" id="subscribe">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Smarter analysis, every week.</h2>
        <p className="text-muted mb-6 max-w-md mx-auto text-sm">AI-driven research delivered free. Full reasoning, no paywall.</p>
        <div className="flex justify-center">
          <SubscribeForm />
        </div>
        <p className="text-muted-light text-xs mt-4">No spam. Unsubscribe anytime.</p>
      </section>
    </div>
  );
}
