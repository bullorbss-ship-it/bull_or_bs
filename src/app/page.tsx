import { getAllArticles } from '@/lib/content';
import ArticleCard from '@/components/article/ArticleCard';
import SubscribeForm from '@/components/forms/SubscribeForm';
import Link from 'next/link';
import { TSX_TICKERS, US_TICKERS } from '@/lib/tickers';

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
            Popular stock picks,
            <br />
            <span className="text-accent">fact-checked by AI.</span>
          </h1>
          <p className="text-muted text-sm sm:text-base mt-4 sm:mt-6 leading-relaxed max-w-xl">
            We audit recommendations from Motley Fool, Seeking Alpha, and others.
            Every claim checked. Every grade earned.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="#latest"
              className="inline-flex items-center justify-center bg-accent text-white font-semibold px-6 py-3 rounded-lg hover:bg-accent-dim transition-colors text-sm"
            >
              See Latest Analysis
            </Link>
            <Link
              href="#subscribe"
              className="inline-flex items-center justify-center border border-card-border text-foreground font-semibold px-6 py-3 rounded-lg hover:bg-card-bg transition-colors text-sm"
            >
              Get Free Weekly Email
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
        <div id="roasts" className="mb-10 sm:mb-12">
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
            <div className="space-y-3">
              {roasts.slice(0, 3).map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-card-border rounded-xl p-6 text-center">
              <p className="text-muted text-sm">First roast dropping soon.</p>
            </div>
          )}
        </div>

        <div id="picks">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gold-light text-gold font-bold font-mono flex items-center justify-center text-sm sm:text-lg">
                A
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">AI Picks</h2>
                <p className="text-[10px] sm:text-xs text-muted">Weekly elimination tournament</p>
              </div>
            </div>
          </div>
          {picks.length > 0 ? (
            <div className="space-y-3">
              {picks.slice(0, 3).map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-card-border rounded-xl p-6 text-center">
              <p className="text-muted text-sm">First AI pick coming soon.</p>
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

      {/* Popular stocks — pushed lower (browse, not the hook) */}
      <section className="py-10 sm:py-14">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Browse Stocks</h2>
          <Link href="/stock" className="text-sm text-accent hover:text-accent-dim font-medium">
            All {totalStocks}+ &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
          {[...TSX_TICKERS.slice(0, 6), ...US_TICKERS.slice(0, 6)].map(stock => (
            <Link
              key={stock.ticker}
              href={`/stock/${stock.ticker.toLowerCase()}`}
              className="border border-card-border rounded-lg p-3 sm:p-4 hover:border-accent/40 hover:shadow-sm transition-all text-center group"
            >
              <p className="font-mono font-bold text-sm sm:text-base text-foreground group-hover:text-accent transition-colors">
                {stock.ticker}
              </p>
              <p className="text-[10px] sm:text-xs text-muted mt-0.5 truncate">{stock.company}</p>
            </Link>
          ))}
        </div>
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
