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
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-mono font-semibold text-accent bg-accent-light px-3 py-1.5 rounded-full tracking-wide">
              AI-POWERED
            </span>
            <span className="text-xs font-mono text-muted-light tracking-wide">
              MADE IN CANADA
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight">
            Popular stock picks,
            <br />
            <span className="text-accent">fact-checked by AI.</span>
          </h1>
          <p className="text-muted text-lg mt-6 leading-relaxed max-w-xl">
            We audit recommendations from Motley Fool, Seeking Alpha, and others.
            Every claim checked. Every grade earned. Full reasoning published.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/stock"
              className="inline-flex items-center justify-center bg-accent text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-accent-dim transition-colors text-sm"
            >
              Browse {totalStocks}+ Stock Analyses
            </Link>
            <Link
              href="#subscribe"
              className="inline-flex items-center justify-center border border-card-border text-foreground font-semibold px-8 py-3.5 rounded-lg hover:bg-card-bg transition-colors text-sm"
            >
              Get Free Weekly Analysis
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-6 border-y border-card-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold font-mono text-accent">{totalStocks}+</p>
            <p className="text-xs text-muted mt-1">Stocks Covered</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-foreground">TSX + US</p>
            <p className="text-xs text-muted mt-1">Markets Analyzed</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-foreground">A-F</p>
            <p className="text-xs text-muted mt-1">Grade Every Pick</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-accent">100%</p>
            <p className="text-xs text-muted mt-1">Free &amp; Transparent</p>
          </div>
        </div>
      </section>

      {/* What We Do — two columns */}
      <section id="roasts" className="py-14">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Roast card */}
          <div className="border border-card-border rounded-2xl p-8 hover:border-red/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-lg bg-red-light text-red font-bold font-mono flex items-center justify-center text-lg">
                F
              </span>
              <div>
                <h2 className="text-xl font-bold">The Roast</h2>
                <p className="text-xs text-muted">Auditing popular recommendations</p>
              </div>
            </div>
            <p className="text-muted text-sm leading-relaxed mb-6">
              Someone recommended a stock? We fact-check every claim, grade it A-F,
              and show what they missed. No sacred cows.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-accent">&#10003;</span>
                <span className="text-muted">Data points verified against real sources</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-accent">&#10003;</span>
                <span className="text-muted">Risks the recommender didn&apos;t mention</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-accent">&#10003;</span>
                <span className="text-muted">Better alternatives compared head-to-head</span>
              </div>
            </div>
            {roasts.length > 0 ? (
              <div className="space-y-3">
                {roasts.slice(0, 2).map(article => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-card-border rounded-xl p-6 text-center">
                <p className="text-muted text-sm">First roast dropping soon.</p>
              </div>
            )}
          </div>

          {/* Pick card */}
          <div id="picks" className="border border-card-border rounded-2xl p-8 hover:border-accent/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-lg bg-gold-light text-gold font-bold font-mono flex items-center justify-center text-lg">
                A
              </span>
              <div>
                <h2 className="text-xl font-bold">AI Picks</h2>
                <p className="text-xs text-muted">Weekly elimination tournament</p>
              </div>
            </div>
            <p className="text-muted text-sm leading-relaxed mb-6">
              Every week: 10-15 candidates enter, 1 survives. Scored on valuation,
              catalysts, risk, and momentum. You see every cut.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-accent">&#10003;</span>
                <span className="text-muted">10-15 stocks evaluated each week</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-accent">&#10003;</span>
                <span className="text-muted">Elimination reasoning for every cut</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-accent">&#10003;</span>
                <span className="text-muted">Winner scored with full data breakdown</span>
              </div>
            </div>
            {picks.length > 0 ? (
              <div className="space-y-3">
                {picks.slice(0, 2).map(article => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-card-border rounded-xl p-6 text-center">
                <p className="text-muted text-sm">First AI pick coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">How It Works</h2>
          <p className="text-muted max-w-lg mx-auto">
            Three steps. Full transparency. No black boxes.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-card-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-accent-light text-accent font-bold font-mono flex items-center justify-center mx-auto mb-4 text-lg">
              1
            </div>
            <h3 className="font-semibold mb-2">AI Scans Markets</h3>
            <p className="text-muted text-sm leading-relaxed">
              Searches pre-market movers, earnings, analyst reports, and news
              across NYSE, NASDAQ, and TSX.
            </p>
          </div>
          <div className="border border-card-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-accent-light text-accent font-bold font-mono flex items-center justify-center mx-auto mb-4 text-lg">
              2
            </div>
            <h3 className="font-semibold mb-2">Elimination Tournament</h3>
            <p className="text-muted text-sm leading-relaxed">
              10-15 candidates scored on valuation, catalysts, risk, and momentum.
              Each elimination is explained.
            </p>
          </div>
          <div className="border border-card-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-accent-light text-accent font-bold font-mono flex items-center justify-center mx-auto mb-4 text-lg">
              3
            </div>
            <h3 className="font-semibold mb-2">Full Reasoning Published</h3>
            <p className="text-muted text-sm leading-relaxed">
              Every data point, every source, every reason.
              No &quot;trust us&quot; &mdash; just analysis you can verify.
            </p>
          </div>
        </div>
      </section>

      {/* Featured tickers */}
      <section className="py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Popular Analysis</h2>
          <Link href="/stock" className="text-sm text-accent hover:text-accent-dim font-medium">
            View all {totalStocks}+ stocks &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...TSX_TICKERS.slice(0, 6), ...US_TICKERS.slice(0, 6)].map(stock => (
            <Link
              key={stock.ticker}
              href={`/stock/${stock.ticker.toLowerCase()}`}
              className="border border-card-border rounded-lg p-4 hover:border-accent/40 hover:shadow-sm transition-all text-center group"
            >
              <p className="font-mono font-bold text-foreground group-hover:text-accent transition-colors">
                {stock.ticker}
              </p>
              <p className="text-xs text-muted mt-1 truncate">{stock.company}</p>
              <p className="text-[10px] text-muted-light mt-1 font-mono">{stock.exchange}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Why different */}
      <section className="py-14">
        <div className="bg-card-bg border border-card-border rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Why We&apos;re Different</h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="flex gap-4">
              <span className="text-red text-lg mt-0.5">&#10007;</span>
              <div>
                <p className="font-semibold text-sm">Others: &quot;Buy this stock!&quot;</p>
                <p className="text-muted text-sm">No data, no reasoning, just hype.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-accent text-lg mt-0.5">&#10003;</span>
              <div>
                <p className="font-semibold text-sm">Us: Full analysis with sources</p>
                <p className="text-muted text-sm">Every claim backed by verifiable data.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-red text-lg mt-0.5">&#10007;</span>
              <div>
                <p className="font-semibold text-sm">Others: Hidden conflicts of interest</p>
                <p className="text-muted text-sm">Sponsored content disguised as advice.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-accent text-lg mt-0.5">&#10003;</span>
              <div>
                <p className="font-semibold text-sm">Us: No sponsors, no affiliate bias</p>
                <p className="text-muted text-sm">AI doesn&apos;t have a portfolio to pump.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-red text-lg mt-0.5">&#10007;</span>
              <div>
                <p className="font-semibold text-sm">Others: $299/year paywall</p>
                <p className="text-muted text-sm">Pay before you can judge the quality.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-accent text-lg mt-0.5">&#10003;</span>
              <div>
                <p className="font-semibold text-sm">Us: 100% free, forever</p>
                <p className="text-muted text-sm">All analysis public. No paywall. No tricks.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="py-16 text-center" id="subscribe">
        <h2 className="text-3xl font-bold mb-3">
          Smarter stock analysis, every week.
        </h2>
        <p className="text-muted mb-8 max-w-md mx-auto">
          AI-driven research delivered to your inbox. Full reasoning.
          No paywall. Made in Canada.
        </p>
        <div className="flex justify-center">
          <SubscribeForm />
        </div>
        <p className="text-muted-light text-xs mt-4">
          Free weekly analysis. No spam. Unsubscribe anytime.
        </p>
      </section>
    </div>
  );
}
