import { getAllArticles } from '@/lib/content';
import ArticleCard from '@/components/article/ArticleCard';
import SubscribeForm from '@/components/forms/SubscribeForm';
import Link from 'next/link';

export default function Home() {
  const articles = getAllArticles();
  const roasts = articles.filter(a => a.type === 'roast');
  const picks = articles.filter(a => a.type === 'pick');

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-semibold text-accent bg-accent-light px-3 py-1 rounded-full">
              AI-Powered
            </span>
            <span className="text-xs text-muted">
              Made in Canada
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            Stock analysis that shows
            <br />
            <span className="text-accent">every reason why.</span>
          </h1>
          <p className="text-muted text-lg mt-6 leading-relaxed max-w-xl">
            AI audits popular stock recommendations, shows what they got wrong,
            and publishes better alternatives with full data. Free. Every week.
          </p>
          <div className="mt-8" id="subscribe">
            <SubscribeForm />
            <p className="text-muted-light text-xs mt-3">
              Free weekly analysis. No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-8 border-y border-card-border">
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted">
          <span>US &amp; Canadian Markets</span>
          <span className="text-card-border">|</span>
          <span>Full Reasoning Published</span>
          <span className="text-card-border">|</span>
          <span>AI-Generated &amp; Transparent</span>
          <span className="text-card-border">|</span>
          <span>100% Free</span>
        </div>
      </section>

      {/* The Roast */}
      <section id="roasts" className="py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">The Roast</h2>
              <span className="text-xs font-semibold text-red bg-red-light px-2.5 py-1 rounded-full">
                Audit
              </span>
            </div>
            <p className="text-muted max-w-lg">
              Popular stock picks, fact-checked by AI. What did they get right?
              What did they miss? What should you have bought instead?
            </p>
          </div>
        </div>
        {roasts.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {roasts.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-card-border rounded-xl p-10 text-center">
            <p className="text-muted text-sm">First roast dropping soon. Subscribe to get it first.</p>
          </div>
        )}
      </section>

      {/* AI Picks */}
      <section id="picks" className="py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">AI Picks</h2>
              <span className="text-xs font-semibold text-accent bg-accent-light px-2.5 py-1 rounded-full">
                Weekly
              </span>
            </div>
            <p className="text-muted max-w-lg">
              Every week our AI evaluates 10-15 stocks, eliminates them one by one,
              and shows the full tournament. You see every cut and every reason.
            </p>
          </div>
        </div>
        {picks.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {picks.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-card-border rounded-xl p-10 text-center">
            <p className="text-muted text-sm">First AI pick analysis coming soon.</p>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="py-14">
        <h2 className="text-2xl font-bold mb-2">How It Works</h2>
        <p className="text-muted mb-8">Three steps. Full transparency. No black boxes.</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-card-border rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-accent-light text-accent font-bold flex items-center justify-center mb-4">1</div>
            <h3 className="font-semibold mb-2">AI Scans Markets</h3>
            <p className="text-muted text-sm leading-relaxed">
              Searches pre-market movers, earnings, analyst reports, and news
              across NYSE, NASDAQ, and TSX.
            </p>
          </div>
          <div className="border border-card-border rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-accent-light text-accent font-bold flex items-center justify-center mb-4">2</div>
            <h3 className="font-semibold mb-2">Elimination Tournament</h3>
            <p className="text-muted text-sm leading-relaxed">
              10-15 candidates scored on valuation, catalysts, risk, and momentum.
              Each elimination is explained.
            </p>
          </div>
          <div className="border border-card-border rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-accent-light text-accent font-bold flex items-center justify-center mb-4">3</div>
            <h3 className="font-semibold mb-2">Full Reasoning Published</h3>
            <p className="text-muted text-sm leading-relaxed">
              Every data point, every source, every reason.
              No &quot;trust us&quot; &mdash; just analysis you can verify.
            </p>
          </div>
        </div>
      </section>

      {/* Stock Coverage CTA */}
      <section className="py-14">
        <div className="bg-card-bg border border-card-border rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">
            Browse Stock Analysis
          </h2>
          <p className="text-muted mb-6 max-w-lg mx-auto">
            AI-generated analysis for hundreds of TSX and US stocks.
            Search any ticker to see what the AI thinks.
          </p>
          <Link
            href="/stock"
            className="inline-block bg-accent text-white font-semibold px-8 py-3 rounded-lg hover:bg-accent-dim transition-colors"
          >
            Explore All Stocks
          </Link>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold mb-3">
          Get smarter stock analysis. Free.
        </h2>
        <p className="text-muted mb-8 max-w-md mx-auto">
          AI-driven research delivered to your inbox every week.
          Full reasoning. No paywall. Made in Canada.
        </p>
        <div className="flex justify-center">
          <SubscribeForm />
        </div>
      </section>
    </div>
  );
}
