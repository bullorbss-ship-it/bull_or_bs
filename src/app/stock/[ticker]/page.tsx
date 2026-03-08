import { notFound } from 'next/navigation';
import { ALL_TICKERS, tickerToSlug, slugToTicker, getTickerInfo, getTickersBySector } from '@/lib/tickers';
import { getAllArticles } from '@/lib/content';
import { siteConfig } from '@/config/site';
import { faqSchema, breadcrumbSchema, corporationSchema } from '@/config/seo';
import ArticleCard from '@/components/article/ArticleCard';
import SubscribeForm from '@/components/forms/SubscribeForm';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ ticker: string }>;
}

export async function generateStaticParams() {
  return ALL_TICKERS.map(t => ({ ticker: tickerToSlug(t.ticker) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker: slug } = await params;
  const ticker = slugToTicker(slug);
  const info = getTickerInfo(ticker);
  if (!info) return {};

  const title = `${info.ticker} Stock Analysis — ${info.company} | ${siteConfig.name}`;
  const description = `AI-powered analysis of ${info.company} (${info.exchange}:${info.ticker}). Full reasoning, data points, and transparent AI research. Should you buy ${info.ticker}?`;

  return {
    title,
    description,
    keywords: [
      `${info.ticker} stock analysis`,
      `should I buy ${info.ticker}`,
      `${info.company} stock`,
      `${info.ticker} stock price`,
      `${info.exchange} ${info.ticker}`,
      info.country === 'CA' ? 'Canadian stock analysis' : 'US stock analysis',
      `${info.sector} stocks`,
      'AI stock analysis',
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og?type=stock&ticker=${encodeURIComponent(info.ticker)}&company=${encodeURIComponent(info.company)}&exchange=${encodeURIComponent(info.exchange)}`,
          width: 1200,
          height: 630,
          alt: `${info.ticker} — ${info.company} Stock Analysis`,
        },
      ],
    },
  };
}

export default async function StockPage({ params }: PageProps) {
  const { ticker: slug } = await params;
  const ticker = slugToTicker(slug);
  const info = getTickerInfo(ticker);
  if (!info) notFound();

  const articles = getAllArticles().filter(
    a => a.ticker?.toUpperCase() === info.ticker.toUpperCase()
  );

  const sectorPeers = getTickersBySector(info.sector)
    .filter(t => t.ticker !== info.ticker)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Schema.org — FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema([
            {
              question: `Should you buy ${info.ticker} stock?`,
              answer: `${info.company} (${info.exchange}:${info.ticker}) is a ${info.sector} stock. Visit this page for the latest AI-generated analysis with full reasoning, data points, and transparent research from ${siteConfig.name}.`,
            },
            {
              question: `Is ${info.company} a good investment?`,
              answer: `Our AI analyzes ${info.ticker} regularly as part of our stock research coverage. Each analysis includes a full elimination tournament comparing ${info.ticker} against sector peers, with detailed reasoning for every conclusion. Check our latest analysis below.`,
            },
            {
              question: `What is ${info.company}'s stock price today?`,
              answer: `${siteConfig.name} does not provide real-time stock prices. For the latest ${info.ticker} price, check your brokerage or a financial data provider. Our focus is AI-driven fundamental analysis, not price tracking.`,
            },
            {
              question: `Is ${info.ticker} a good investment?`,
              answer: `Whether ${info.ticker} is a good investment depends on your goals, risk tolerance, and time horizon. Our AI evaluates ${info.company} on valuation, catalysts, risks, and momentum relative to ${info.sector} sector peers.`,
            },
            {
              question: `What sector is ${info.ticker} in?`,
              answer: `${info.company} (${info.ticker}) operates in the ${info.sector} sector and is listed on the ${info.exchange}.`,
            },
            {
              question: `Where is ${info.ticker} listed?`,
              answer: `${info.ticker} is listed on the ${info.exchange}. ${info.company} is a ${info.country === 'CA' ? 'Canadian' : 'US'}-listed company.`,
            },
            {
              question: `What does ${info.company} do?`,
              answer: `${info.company} is a ${info.country === 'CA' ? 'Canadian' : 'US'} company in the ${info.sector} sector, trading under the ticker ${info.ticker} on the ${info.exchange}. For detailed AI analysis of their business and stock, see our latest coverage on this page.`,
            },
          ])),
        }}
      />
      {/* Schema.org — Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: 'Home', url: siteConfig.url },
            { name: 'Stocks', url: `${siteConfig.url}/stock` },
            { name: `${info.ticker} — ${info.company}`, url: `${siteConfig.url}/stock/${tickerToSlug(info.ticker)}` },
          ])),
        }}
      />
      {/* Schema.org — Corporation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(corporationSchema(info.ticker, info.company, info.exchange)),
        }}
      />

      {/* Header */}
      <div className="mb-10">
        <Link href="/stock" className="text-sm text-accent hover:underline mb-4 inline-block">
          &larr; All Stocks
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl md:text-4xl font-bold">{info.ticker}</h1>
          <span className="text-sm font-mono text-muted bg-card-bg px-3 py-1 rounded-lg border border-card-border">
            {info.exchange}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            info.country === 'CA' ? 'bg-red-light text-red' : 'bg-accent-light text-accent'
          }`}>
            {info.country === 'CA' ? 'Canadian' : 'US'}
          </span>
        </div>
        <p className="text-xl text-muted">{info.company}</p>
        <p className="text-sm text-muted-light mt-1">Sector: {info.sector}</p>
      </div>

      {/* About */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">About {info.company}</h2>
        <p className="text-muted leading-relaxed">
          {info.company} ({info.exchange}:{info.ticker}) is a {info.country === 'CA' ? 'Canadian' : 'US'} company
          in the {info.sector} sector, listed on the {info.exchange}. Our AI analyzes {info.ticker} as
          part of our regular stock coverage, comparing it against sector peers and evaluating
          it on valuation, catalysts, risks, and momentum.
        </p>
      </section>

      {/* AI Analysis */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">AI Analysis for {info.ticker}</h2>
        {articles.length > 0 ? (
          <div className="grid gap-4">
            {articles.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-card-border rounded-xl p-8 text-center">
            <p className="text-muted mb-2">No analysis published yet for {info.ticker}.</p>
            <p className="text-sm text-muted-light">Subscribe to get notified when we cover this stock.</p>
          </div>
        )}
      </section>

      {/* Key Questions (SEO) */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="border border-card-border rounded-xl p-5">
            <h3 className="font-semibold mb-2">Should you buy {info.ticker} stock?</h3>
            <p className="text-sm text-muted leading-relaxed">
              Whether {info.ticker} is a good buy depends on your investment goals, risk tolerance,
              and current market conditions. Our AI evaluates {info.company} against sector peers
              using valuation metrics, catalyst analysis, and risk assessment. Subscribe to our
              newsletter for the latest AI-generated analysis.
            </p>
          </div>
          <div className="border border-card-border rounded-xl p-5">
            <h3 className="font-semibold mb-2">Is {info.company} a good long-term investment?</h3>
            <p className="text-sm text-muted leading-relaxed">
              {info.company} operates in the {info.sector} sector on the {info.exchange}.
              Long-term potential depends on industry trends, competitive positioning, and
              financial health. Our AI analysis provides data-driven insights with full
              reasoning — no black boxes.
            </p>
          </div>
          <div className="border border-card-border rounded-xl p-5">
            <h3 className="font-semibold mb-2">What is {info.company}&apos;s stock price today?</h3>
            <p className="text-sm text-muted leading-relaxed">
              {siteConfig.name} does not provide real-time stock prices. For the latest {info.ticker} price,
              check your brokerage or a financial data provider. Our focus is AI-driven fundamental
              analysis, not price tracking.
            </p>
          </div>
          <div className="border border-card-border rounded-xl p-5">
            <h3 className="font-semibold mb-2">What sector is {info.ticker} in?</h3>
            <p className="text-sm text-muted leading-relaxed">
              {info.company} ({info.ticker}) operates in the {info.sector} sector and is listed on
              the {info.exchange}.
            </p>
          </div>
          <div className="border border-card-border rounded-xl p-5">
            <h3 className="font-semibold mb-2">Where is {info.ticker} listed?</h3>
            <p className="text-sm text-muted leading-relaxed">
              {info.ticker} is listed on the {info.exchange}. {info.company} is
              a {info.country === 'CA' ? 'Canadian' : 'US'}-listed company.
            </p>
          </div>
          <div className="border border-card-border rounded-xl p-5">
            <h3 className="font-semibold mb-2">What does {info.company} do?</h3>
            <p className="text-sm text-muted leading-relaxed">
              {info.company} is a {info.country === 'CA' ? 'Canadian' : 'US'} company in
              the {info.sector} sector, trading under the ticker {info.ticker} on the {info.exchange}.
              For detailed AI analysis of their business and stock, see our latest coverage on this page.
            </p>
          </div>
          <div className="border border-card-border rounded-xl p-5">
            <h3 className="font-semibold mb-2">What are alternatives to {info.ticker}?</h3>
            <p className="text-sm text-muted leading-relaxed">
              Sector peers in {info.sector} include{' '}
              {sectorPeers.slice(0, 3).map(p => p.ticker).join(', ')}.
              Our AI elimination tournament compares these stocks head-to-head,
              scoring each on valuation, catalysts, risk, and momentum.
            </p>
          </div>
        </div>
      </section>

      {/* Sector Peers */}
      {sectorPeers.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">{info.sector} Sector Peers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sectorPeers.map(peer => (
              <Link
                key={peer.ticker}
                href={`/stock/${tickerToSlug(peer.ticker)}`}
                className="border border-card-border rounded-xl p-4 hover:border-accent/30 hover:shadow-md transition-all group"
              >
                <p className="font-mono font-bold text-foreground group-hover:text-accent transition-colors">
                  {peer.ticker}
                </p>
                <p className="text-xs text-muted mt-1">{peer.company}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-card-bg border border-card-border rounded-2xl p-8 text-center">
        <h3 className="text-lg font-bold mb-3">
          Get AI analysis of {info.ticker} in your inbox
        </h3>
        <p className="text-muted text-sm mb-6">
          When our AI covers {info.company}, you&apos;ll be the first to know.
        </p>
        <div className="flex justify-center">
          <SubscribeForm />
        </div>
      </section>

      {/* Disclaimer */}
      <p className="text-xs text-muted-light mt-8 leading-relaxed">
        This page is AI-generated for educational purposes only. Not financial advice.
        {siteConfig.name} is not affiliated with {info.company} or any financial institution.
        Always do your own research.
      </p>
    </div>
  );
}
