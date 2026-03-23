import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Editorial Standards',
  description:
    'How Bull Or BS produces AI-driven stock analysis. Our research methodology, fact-checking process, and correction policy.',
  alternates: { canonical: '/editorial' },
};

export default function EditorialPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Editorial Standards' },
      ]} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'Editorial Standards',
            description: 'How BullOrBS produces AI-driven stock analysis.',
            url: `${siteConfig.url}/editorial`,
            publisher: {
              '@type': 'Organization',
              name: siteConfig.name,
              url: siteConfig.url,
            },
          }),
        }}
      />

      <h1 className="text-3xl font-bold mb-3">Editorial Standards</h1>
      <p className="text-muted text-sm mb-10">
        How we produce stock analysis you can actually trust.
      </p>

      <div className="space-y-10 text-muted leading-relaxed text-sm">
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Our Research Process</h2>
          <p className="mb-3">
            Every article on {siteConfig.name} follows a structured research pipeline
            designed to minimize errors and maximize transparency:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>Data collection</strong> &mdash; We gather financial data from
              public filings (SEC/SEDAR), earnings reports, and verified financial
              databases. All data points are sourced from official documents.
            </li>
            <li>
              <strong>AI analysis</strong> &mdash; Our AI models analyze the data using
              structured prompts that enforce citation of sources. The AI cannot invent
              numbers &mdash; it can only work with the verified data provided.
            </li>
            <li>
              <strong>Fact-check review</strong> &mdash; Every article undergoes a
              secondary AI review specifically tasked with catching factual errors,
              outdated figures, and unsupported claims. Flagged items are manually
              verified against source documents.
            </li>
            <li>
              <strong>Publication</strong> &mdash; Only after passing all verification
              gates is an article published. Every article includes its data points
              with sources so readers can verify claims independently.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">What We Publish</h2>
          <p className="mb-3">{siteConfig.name} publishes three types of content:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Roasts</strong> &mdash; Audits of stock recommendations from
              popular financial newsletters. We grade the quality of the analysis,
              not the stock itself.
            </li>
            <li>
              <strong>AI Picks</strong> &mdash; Elimination tournaments where AI
              compares multiple stocks head-to-head on valuation, catalysts, risks,
              and momentum. Full reasoning is shown for every elimination.
            </li>
            <li>
              <strong>News Takes</strong> &mdash; Plain-English summaries of financial
              news, sourced from verified reporting. We restructure facts &mdash; we
              do not speculate or predict prices.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Data Standards</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>All financial figures (revenue, earnings, market cap) must come from
              official filings or verified financial data providers.</li>
            <li>We distinguish between trailing (TTM) and forward estimates and label
              each clearly.</li>
            <li>When data is approximate or dated, we say so explicitly.</li>
            <li>We do not use real-time stock prices. Our analysis is fundamental,
              not price-tracking.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">AI Transparency</h2>
          <p className="mb-3">
            We believe AI-generated content should be clearly labeled and its
            limitations acknowledged:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Every page on {siteConfig.name} is clearly marked as AI-generated.</li>
            <li>Our AI models are constrained to work only with verified data &mdash;
              they cannot browse the internet or access real-time information.</li>
            <li>We publish our{' '}
              <Link href="/methodology" className="text-accent hover:underline">full methodology</Link>
              {' '}so readers understand exactly how analysis is produced.</li>
            <li>AI limitations are disclosed: models can misinterpret context,
              and qualitative judgments are opinions, not facts.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Correction Policy</h2>
          <p className="mb-3">
            We take factual accuracy seriously. If we publish an error:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Corrections are made directly to the article as soon as the error
              is identified.</li>
            <li>Material corrections (wrong revenue figures, incorrect claims) are
              noted in the article.</li>
            <li>Minor corrections (typos, formatting) are made silently.</li>
            <li>If you spot an error, contact us at{' '}
              <span className="text-accent">hello@bullorbs.com</span> and we will
              investigate promptly.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Independence</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{siteConfig.name} is independently operated and not affiliated with
              any financial institution, brokerage, or newsletter.</li>
            <li>We do not accept payment for coverage or favorable analysis.</li>
            <li>We do not hold positions in stocks we cover at the time of publication.</li>
            <li>Our revenue comes from advertising and newsletter subscriptions &mdash;
              never from the companies we analyze.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Not Financial Advice</h2>
          <p>
            All content on {siteConfig.name} is for educational and informational
            purposes only. Nothing published here constitutes a recommendation to
            buy, sell, or hold any security. Always consult a qualified financial
            advisor and do your own research before making investment decisions.
            See our{' '}
            <Link href="/disclaimer" className="text-accent hover:underline">full disclaimer</Link>.
          </p>
        </section>

        <div className="flex gap-4 pt-4 border-t border-card-border">
          <Link href="/methodology" className="text-accent hover:text-accent-dim font-medium text-xs">
            Methodology →
          </Link>
          <Link href="/disclaimer" className="text-accent hover:text-accent-dim font-medium text-xs">
            Disclaimer →
          </Link>
          <Link href="/privacy" className="text-accent hover:text-accent-dim font-medium text-xs">
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
