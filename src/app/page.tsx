import { getAllArticles } from '@/lib/content';
import ArticleCard from '@/components/article/ArticleCard';
import SubscribeForm from '@/components/forms/SubscribeForm';
import Link from 'next/link';
import { TSX_TICKERS, US_TICKERS } from '@/lib/tickers';

export const dynamic = 'force-dynamic';

export default function Home() {
  const articles = getAllArticles();
  const roasts = articles.filter(a => a.type === 'roast');
  const picks = articles.filter(a => a.type === 'pick');
  const totalStocks = TSX_TICKERS.length + US_TICKERS.length;

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
            AI audits popular stock recommendations and grades them A through F.
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
            <p className="text-lg sm:text-2xl font-bold font-mono text-foreground">A-F</p>
            <p className="text-[10px] sm:text-xs text-muted mt-0.5">Graded</p>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold font-mono text-accent">Free</p>
            <p className="text-[10px] sm:text-xs text-muted mt-0.5">Always</p>
          </div>
        </div>
      </section>

      {/* Latest Analysis — THE CONTENT HOOK (shows immediately after hero) */}
      <section id="latest" className="py-10 sm:py-14">
        <div id="picks" className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gold-light text-gold font-bold font-mono flex items-center justify-center text-sm sm:text-lg">
                A
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">AI Picks</h2>
                <p className="text-[10px] sm:text-xs text-muted">Elimination tournament &mdash; only one survives</p>
              </div>
            </div>
          </div>
          {picks.length > 0 ? (
            <div className="relative">
              <div className="space-y-3">
                {picks.slice(0, 3).map((article, i) => (
                  <div key={article.slug} className={picks.length > 3 && i === 2 ? 'opacity-60' : ''}>
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
              {picks.length > 3 && (
                <div className="relative -mt-8 pt-12 bg-gradient-to-t from-background to-transparent text-center">
                  <Link
                    href="/picks"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
                  >
                    View all {picks.length} picks
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-card-border rounded-xl p-6 text-center">
              <p className="text-muted text-sm">First AI pick coming soon.</p>
            </div>
          )}
        </div>

        <div id="roasts">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-light text-red font-bold font-mono flex items-center justify-center text-sm sm:text-lg">
                F
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">The Roast</h2>
                <p className="text-[10px] sm:text-xs text-muted">Auditing popular recommendations</p>
              </div>
            </div>
          </div>
          {roasts.length > 0 ? (
            <div className="relative">
              <div className="space-y-3">
                {roasts.slice(0, 3).map((article, i) => (
                  <div key={article.slug} className={roasts.length > 3 && i === 2 ? 'opacity-60' : ''}>
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
              {roasts.length > 3 && (
                <div className="relative -mt-8 pt-12 bg-gradient-to-t from-background to-transparent text-center">
                  <Link
                    href="/roasts"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
                  >
                    View all {roasts.length} roasts
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-card-border rounded-xl p-6 text-center">
              <p className="text-muted text-sm">First roast dropping soon.</p>
            </div>
          )}
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

      {/* Why different — condensed */}
      <section className="py-10 sm:py-14">
        <div className="bg-card-bg border border-card-border rounded-2xl p-6 sm:p-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">Why We&apos;re Different</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-4 sm:gap-y-6">
            <div className="flex gap-3">
              <span className="text-red text-base mt-0.5 shrink-0">&#10007;</span>
              <div>
                <p className="font-semibold text-sm">&quot;Buy this stock!&quot;</p>
                <p className="text-muted text-xs sm:text-sm">No data, no reasoning, just hype.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-accent text-base mt-0.5 shrink-0">&#10003;</span>
              <div>
                <p className="font-semibold text-sm">Full analysis with sources</p>
                <p className="text-muted text-xs sm:text-sm">Every claim backed by verifiable data.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red text-base mt-0.5 shrink-0">&#10007;</span>
              <div>
                <p className="font-semibold text-sm">Hidden conflicts of interest</p>
                <p className="text-muted text-xs sm:text-sm">Sponsored content as advice.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-accent text-base mt-0.5 shrink-0">&#10003;</span>
              <div>
                <p className="font-semibold text-sm">No sponsors, no affiliate bias</p>
                <p className="text-muted text-xs sm:text-sm">AI doesn&apos;t have a portfolio to pump.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red text-base mt-0.5 shrink-0">&#10007;</span>
              <div>
                <p className="font-semibold text-sm">$299/year paywall</p>
                <p className="text-muted text-xs sm:text-sm">Pay before you can judge quality.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-accent text-base mt-0.5 shrink-0">&#10003;</span>
              <div>
                <p className="font-semibold text-sm">100% free, forever</p>
                <p className="text-muted text-xs sm:text-sm">No paywall. No tricks.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Stocks — split by country, grouped by sector */}
      <section className="py-10 sm:py-14">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold">Browse Stocks</h2>
          <p className="text-sm text-muted mt-1">AI analysis for {totalStocks}+ tickers across TSX &amp; US markets</p>
        </div>

        {[
          { tag: 'TSX', label: 'Canadian Markets', tickers: TSX_TICKERS, market: 'CA' },
          { tag: 'NYSE', label: 'US Markets', tickers: US_TICKERS, market: 'US' },
        ].map(({ tag, label, tickers, market }) => {
          const sectorMap = new Map<string, typeof tickers>();
          tickers.forEach(t => {
            const list = sectorMap.get(t.sector) || [];
            list.push(t);
            sectorMap.set(t.sector, list);
          });
          const sectors = [...sectorMap.entries()].sort((a, b) => b[1].length - a[1].length);
          const featured = sectors.flatMap(([, list]) => list.slice(0, 2)).slice(0, 6);

          return (
            <div key={market} className={market === 'CA' ? 'mb-10' : ''}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono font-bold text-accent bg-accent-light px-2 py-0.5 rounded">{tag}</span>
                <h3 className="font-bold text-base sm:text-lg">{label}</h3>
                <span className="text-xs text-muted font-mono ml-auto">{tickers.length} stocks</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                {sectors.map(([sector]) => (
                  <Link key={sector} href="/stock" className="text-[10px] sm:text-xs font-mono text-muted bg-card-bg px-2 py-0.5 rounded hover:text-accent hover:bg-accent-light transition-colors">
                    {sector}
                  </Link>
                ))}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                {featured.map((stock, i) => (
                  <Link
                    key={stock.ticker}
                    href={`/stock/${stock.ticker.toLowerCase()}`}
                    className={`border border-card-border rounded-lg p-3 sm:p-4 hover:border-accent/40 hover:shadow-sm transition-all text-center group ${i >= 4 ? 'opacity-50' : ''}`}
                  >
                    <p className="font-mono font-bold text-sm sm:text-base text-foreground group-hover:text-accent transition-colors">
                      {stock.ticker}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted mt-0.5 truncate">{stock.company}</p>
                    <p className="text-[9px] text-muted-light mt-0.5">{stock.sector}</p>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-4">
                <Link
                  href={`/stock?market=${market}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
                >
                  View all {tickers.length} {market === 'CA' ? 'Canadian' : 'US'} stocks
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          );
        })}
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
