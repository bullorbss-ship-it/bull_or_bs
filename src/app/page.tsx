import { getAllArticles } from '@/lib/content';
import SubscribeForm from '@/components/forms/SubscribeForm';
import Link from 'next/link';
import { getAllTickersExpanded } from '@/lib/ticker-registry';

export default function Home() {
  const articles = getAllArticles();
  const latest = articles.slice(0, 5);
  const totalStocks = getAllTickersExpanded().length;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      {/* Hero */}
      <section className="py-12 sm:py-20 text-center">
        <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-widest mb-6">
          <span className="text-accent font-semibold">AI-POWERED</span>
          <span className="text-muted-light">&middot;</span>
          <span className="text-muted-light">MADE IN CANADA</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
          <span className="text-muted-light">Call the Bull.</span>
          <br />
          <span className="text-accent">Expose the BS.</span>
        </h1>
        <p className="text-muted text-sm sm:text-base mt-6 leading-relaxed max-w-lg mx-auto">
          AI audits popular stock picks and scores them 1&ndash;10. Every
          claim checked. Every source cited. No paywall.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="#subscribe"
            className="inline-flex items-center justify-center bg-accent text-white font-bold px-8 py-3.5 rounded-lg hover:bg-accent-dim transition-colors text-sm"
          >
            Get Free Analysis
          </Link>
          <Link
            href="#latest"
            className="inline-flex items-center justify-center border border-card-border text-foreground font-semibold px-8 py-3.5 rounded-lg hover:bg-card-bg transition-colors text-sm"
          >
            See Latest &rarr;
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-5 border-y border-card-border">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-accent">{totalStocks}+</p>
            <p className="text-[10px] sm:text-xs text-muted font-mono tracking-wide mt-1">STOCKS</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">TSX + US</p>
            <p className="text-[10px] sm:text-xs text-muted font-mono tracking-wide mt-1">MARKETS</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">1&ndash;10</p>
            <p className="text-[10px] sm:text-xs text-muted font-mono tracking-wide mt-1">SCORED</p>
          </div>
        </div>
      </section>

      {/* Latest Analysis */}
      <section id="latest" className="py-12 sm:py-16">
        <div className="mb-8">
          <p className="text-xs font-mono font-semibold text-accent tracking-widest mb-2">LATEST ANALYSIS</p>
          <h2 className="text-2xl sm:text-3xl font-bold">Fresh off the line</h2>
          <p className="text-sm text-muted mt-1">Picks, roasts, and news &mdash; all in one place</p>
        </div>

        <div className="space-y-3">
          {latest.map((article) => {
            const isRoast = article.type === 'roast';
            const isTake = article.type === 'take';

            // Color-coded badges — distinct for each type
            const badgeStyle = isRoast
              ? 'bg-red/10 text-red border border-red/20'
              : isTake
              ? 'bg-gold/10 text-gold border border-gold/20'
              : 'bg-accent/10 text-accent border border-accent/20';
            const badgeLabel = isRoast ? 'ROAST' : isTake ? 'NEWS' : 'PICK';

            return (
              <Link
                key={article.slug}
                href={`/article/${article.slug}`}
                className="flex items-start gap-4 border border-card-border rounded-xl p-4 sm:p-5 hover:border-accent/40 hover:shadow-lg transition-all group"
              >
                <span className={`text-[10px] sm:text-xs font-bold font-mono px-2.5 py-1 rounded-md shrink-0 mt-0.5 ${badgeStyle}`}>
                  {badgeLabel}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-foreground group-hover:text-accent transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </p>
                  <p className="text-xs font-mono text-muted-light mt-1.5">
                    {new Date(article.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Link href="/picks" className="text-sm font-semibold text-accent hover:text-accent-dim transition-colors">
            All Picks &rarr;
          </Link>
          <Link href="/roasts" className="text-sm font-semibold text-red hover:text-red/70 transition-colors">
            All Roasts &rarr;
          </Link>
          <Link href="/takes" className="text-sm font-semibold text-gold hover:text-gold/70 transition-colors">
            All News &rarr;
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-mono font-semibold text-accent tracking-widest mb-2">HOW IT WORKS</p>
          <h2 className="text-2xl sm:text-3xl font-bold">Transparent by design</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { num: '01', title: 'AI Scans Markets', desc: 'Movers, earnings, and analyst reports across TSX and US markets — daily.' },
            { num: '02', title: 'Elimination Tournament', desc: '10–15 candidates scored on valuation, catalysts, risk, and momentum.' },
            { num: '03', title: 'Full Reasoning Published', desc: 'Every data point sourced. No "trust us" — just verifiable analysis.' },
          ].map((step) => (
            <div key={step.num} className="border border-card-border rounded-xl p-6 sm:p-8 text-center">
              <p className="text-3xl sm:text-4xl font-bold font-mono text-accent/30 mb-4">{step.num}</p>
              <h3 className="font-bold text-sm sm:text-base mb-2">{step.title}</h3>
              <p className="text-muted text-xs sm:text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="py-12 sm:py-20 text-center" id="subscribe">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">
          Smarter analysis, every week.
        </h2>
        <p className="text-muted mb-8 max-w-md mx-auto text-sm sm:text-base">
          AI-driven research delivered to your inbox. Full reasoning, no paywall.
        </p>
        <div className="flex justify-center">
          <SubscribeForm />
        </div>
        <p className="text-muted-light text-xs mt-4">
          No spam. Unsubscribe anytime. Free while it lasts.
        </p>
      </section>
    </div>
  );
}
