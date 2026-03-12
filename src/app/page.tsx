import { getAllArticles } from '@/lib/content';
import SubscribeForm from '@/components/forms/SubscribeForm';
import Link from 'next/link';
import { getAllTickersExpanded } from '@/lib/ticker-registry';

export default function Home() {
  const articles = getAllArticles();
  const latest = articles.slice(0, 4);
  const totalStocks = getAllTickersExpanded().length;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero — condensed on mobile, punchy */}
      <section className="py-10 sm:py-16 md:py-20">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] sm:text-xs font-mono font-semibold text-accent bg-accent-light px-2.5 py-1 rounded-full tracking-wide">
              AI-POWERED
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-muted-light tracking-wide">
              MADE IN CANADA
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight">
            Call the <span className="text-foreground">Bull.</span>
            <br />
            Expose the <span className="text-accent">BS.</span>
          </h1>
          <p className="text-muted text-sm sm:text-base mt-4 sm:mt-6 leading-relaxed max-w-xl">
            AI audits popular stock recommendations and scores them 1 to 10.
            Every claim checked. Every source cited. No paywall. No mercy.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="#latest"
              className="inline-flex items-center justify-center bg-accent text-white font-semibold px-6 py-3 rounded-lg hover:bg-accent-dim transition-colors text-sm"
            >
              See Who Failed
            </Link>
            <Link
              href="#subscribe"
              className="inline-flex items-center justify-center border border-card-border text-foreground font-semibold px-6 py-3 rounded-lg hover:bg-card-bg transition-colors text-sm"
            >
              Get the Verdicts Free
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar — compact */}
      <section className="py-4 border-y border-card-border">
        <div className="grid grid-cols-4 gap-3 sm:gap-6 text-center">
          <div>
            <p className="text-lg sm:text-2xl font-bold font-mono text-accent">{totalStocks}+</p>
            <p className="text-[10px] sm:text-xs text-muted mt-0.5">Stocks</p>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold font-mono text-foreground">TSX+US</p>
            <p className="text-[10px] sm:text-xs text-muted mt-0.5">Markets</p>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold font-mono text-foreground">1-10</p>
            <p className="text-[10px] sm:text-xs text-muted mt-0.5">Scored</p>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold font-mono text-accent">Free</p>
            <p className="text-[10px] sm:text-xs text-muted mt-0.5">While it lasts</p>
          </div>
        </div>
      </section>

      {/* Latest Analysis — compact mini cards */}
      <section id="latest" className="py-10 sm:py-14">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Latest Analysis</h2>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {latest.map((article) => {
            const isRoast = article.type === 'roast';
            const isTake = article.type === 'take';
            const badgeStyle = isRoast
              ? 'bg-red-light text-red'
              : isTake
              ? 'bg-card-bg text-muted border border-card-border'
              : 'bg-accent-light text-accent';
            const badgeLabel = isRoast ? 'Roast' : isTake ? 'News' : 'AI Pick';

            return (
              <Link
                key={article.slug}
                href={`/article/${article.slug}`}
                className="block border border-card-border rounded-xl p-4 hover:border-accent/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeStyle}`}>
                    {badgeLabel}
                  </span>
                  {article.ticker && (
                    <span className="text-[10px] font-mono text-muted bg-card-bg px-1.5 py-0.5 rounded">
                      {article.ticker}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-light ml-auto">
                    {new Date(article.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-snug line-clamp-1">
                  {article.title}
                </p>
              </Link>
            );
          })}
        </div>
        <div className="text-center mt-6">
          <Link
            href="/picks"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
          >
            View all {articles.length} articles
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* How it works — simplified for mobile */}
      <section className="py-10 sm:py-14">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="border border-card-border rounded-xl p-5 sm:p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-accent-light text-accent font-bold font-mono flex items-center justify-center mx-auto mb-3 text-base">
              1
            </div>
            <h3 className="font-semibold mb-1.5 text-sm sm:text-base">AI Scans Markets</h3>
            <p className="text-muted text-xs sm:text-sm leading-relaxed">
              Searches movers, earnings, analyst reports across NYSE, NASDAQ, and TSX.
            </p>
          </div>
          <div className="border border-card-border rounded-xl p-5 sm:p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-accent-light text-accent font-bold font-mono flex items-center justify-center mx-auto mb-3 text-base">
              2
            </div>
            <h3 className="font-semibold mb-1.5 text-sm sm:text-base">Elimination Tournament</h3>
            <p className="text-muted text-xs sm:text-sm leading-relaxed">
              10-15 candidates scored on valuation, catalysts, risk, and momentum.
            </p>
          </div>
          <div className="border border-card-border rounded-xl p-5 sm:p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-accent-light text-accent font-bold font-mono flex items-center justify-center mx-auto mb-3 text-base">
              3
            </div>
            <h3 className="font-semibold mb-1.5 text-sm sm:text-base">Full Reasoning Published</h3>
            <p className="text-muted text-xs sm:text-sm leading-relaxed">
              Every data point, every source. No &quot;trust us&quot; &mdash; just verifiable analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Browse Stocks CTA — compact one-liner */}
      <section className="py-6 sm:py-8">
        <Link
          href="/stock"
          className="flex items-center justify-between border border-card-border rounded-xl p-5 sm:p-6 hover:border-accent/40 hover:shadow-md transition-all group"
        >
          <div>
            <h3 className="font-bold text-base sm:text-lg group-hover:text-accent transition-colors">
              Browse {totalStocks}+ Stock Pages
            </h3>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              AI analysis for every ticker across TSX &amp; US markets
            </p>
          </div>
          <span className="text-accent text-2xl shrink-0 ml-4">&rarr;</span>
        </Link>
      </section>

      {/* Subscribe CTA */}
      <section className="py-10 sm:py-16 text-center" id="subscribe">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
          Smarter stock analysis, every week.
        </h2>
        <p className="text-muted mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
          AI-driven research delivered to your inbox. Full reasoning.
          No paywall. Made in Canada.
        </p>
        <div className="flex justify-center">
          <SubscribeForm />
        </div>
        <p className="text-muted-light text-xs mt-3">
          Free weekly analysis. No spam. Unsubscribe anytime.
        </p>
      </section>
    </div>
  );
}
