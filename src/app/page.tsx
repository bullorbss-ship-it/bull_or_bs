import { getAllArticles } from '@/lib/content';
import ArticleCard from '@/components/ArticleCard';
import SubscribeForm from '@/components/SubscribeForm';

export default function Home() {
  const articles = getAllArticles();
  const roasts = articles.filter(a => a.type === 'roast');
  const picks = articles.filter(a => a.type === 'pick');

  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero */}
      <section className="py-20 md:py-28">
        <p className="text-accent font-mono text-sm tracking-widest mb-4">
          AI-POWERED STOCK ANALYSIS
        </p>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight max-w-3xl">
          Stock picks shouldn&apos;t come from a{' '}
          <span className="text-accent">black box.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl mt-6 max-w-2xl leading-relaxed">
          We audit popular stock recommendations with AI, show every stock we considered,
          every stock we rejected, and exactly why. Full reasoning. No paywall.
        </p>
        <div className="mt-8" id="subscribe">
          <SubscribeForm />
          <p className="text-muted text-xs font-mono mt-3">
            Free weekly newsletter. Unsubscribe anytime. We don&apos;t sell your data.
          </p>
        </div>
      </section>

      {/* The Roast */}
      <section id="roasts" className="py-12">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-bold font-mono">The Roast</h2>
          <span className="text-xs font-mono text-red bg-red/10 px-2 py-1 rounded">
            AUDIT
          </span>
        </div>
        <p className="text-muted mb-8 max-w-2xl">
          We take popular stock recommendations and put them through an AI-powered audit.
          What did they get right? What did they miss? What should they have recommended instead?
        </p>
        {roasts.length > 0 ? (
          <div className="grid gap-6">
            {roasts.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-card-border rounded-lg p-8 text-center">
            <p className="text-muted font-mono text-sm">First roast dropping soon. Subscribe to get it first.</p>
          </div>
        )}
      </section>

      {/* AI Picks */}
      <section id="picks" className="py-12">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-bold font-mono">AI Picks</h2>
          <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
            ANALYSIS
          </span>
        </div>
        <p className="text-muted mb-8 max-w-2xl">
          Our AI scans US and Canadian markets, evaluates 10-15 candidates,
          eliminates them one by one, and shows you the full tournament.
          Every stock. Every reason. Every time.
        </p>
        {picks.length > 0 ? (
          <div className="grid gap-6">
            {picks.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-card-border rounded-lg p-8 text-center">
            <p className="text-muted font-mono text-sm">First AI pick analysis coming soon.</p>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="py-12">
        <h2 className="text-2xl font-bold font-mono mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-card-border bg-card-bg rounded-lg p-6">
            <p className="text-accent font-mono font-bold text-3xl mb-3">01</p>
            <h3 className="font-semibold mb-2">AI Scans Markets</h3>
            <p className="text-muted text-sm leading-relaxed">
              Our AI searches pre-market movers, news, sector trends, earnings,
              and analyst reports across US and Canadian markets.
            </p>
          </div>
          <div className="border border-card-border bg-card-bg rounded-lg p-6">
            <p className="text-accent font-mono font-bold text-3xl mb-3">02</p>
            <h3 className="font-semibold mb-2">Elimination Tournament</h3>
            <p className="text-muted text-sm leading-relaxed">
              10-15 candidates enter. Each one is scored on valuation, catalysts,
              risk, volume, and momentum. You see every elimination and why.
            </p>
          </div>
          <div className="border border-card-border bg-card-bg rounded-lg p-6">
            <p className="text-accent font-mono font-bold text-3xl mb-3">03</p>
            <h3 className="font-semibold mb-2">Full Reasoning Published</h3>
            <p className="text-muted text-sm leading-relaxed">
              The winner (or &quot;no pick&quot;) is published with the complete
              reasoning chain. No black box. No &quot;trust us.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Stop paying for stock picks from a <span className="text-accent">black box.</span>
        </h2>
        <p className="text-muted mb-8 max-w-lg mx-auto">
          Get AI-driven analysis that shows its work. Every week. For free.
        </p>
        <div className="flex justify-center">
          <SubscribeForm />
        </div>
      </section>
    </div>
  );
}
