import { notFound } from 'next/navigation';
import { tickerToSlug, slugToTicker, getTickerInfo, getTickersBySector } from '@/lib/tickers';
import { getAllTickersExpanded } from '@/lib/ticker-registry';
import { getAllArticles } from '@/lib/content';
import { getStockData } from '@/lib/stock-data';
import { siteConfig } from '@/config/site';
import { faqSchema, breadcrumbSchema, corporationSchema } from '@/config/seo';
import ArticleCard from '@/components/article/ArticleCard';
import SubscribeForm from '@/components/forms/SubscribeForm';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Collapsible from '@/components/ui/Collapsible';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ ticker: string }>;
}

export async function generateStaticParams() {
  return getAllTickersExpanded().map(t => ({ ticker: tickerToSlug(t.ticker) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker: slug } = await params;
  const ticker = slugToTicker(slug);
  const info = getTickerInfo(ticker);
  if (!info) return {};

  const stockData = getStockData(info.ticker);
  const title = `${info.ticker} Stock Analysis — ${info.company} | ${siteConfig.name}`;
  const description = stockData?.seoDescription || `AI-powered analysis of ${info.company} (${info.exchange}:${info.ticker}). Full reasoning, data points, and transparent AI research. Should you buy ${info.ticker}?`;

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

  const stockData = getStockData(info.ticker);

  const sectorPeers = getTickersBySector(info.sector)
    .filter(t => t.ticker !== info.ticker)
    .slice(0, 6);

  const faqItems = [
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
    {
      question: `What are ${info.ticker} alternatives?`,
      answer: `${info.sector} sector peers include ${sectorPeers.slice(0, 3).map(p => `${p.company} (${p.ticker})`).join(', ')}. Our AI runs elimination tournaments comparing these stocks head-to-head on valuation, catalysts, risk, and momentum.`,
    },
    {
      question: `Does ${info.company} pay dividends?`,
      answer: `${stockData?.keyMetrics?.dividendYield && stockData.keyMetrics.dividendYield !== 'N/A' ? `${info.company} has an approximate dividend yield of ${stockData.keyMetrics.dividendYield}.` : `Check your brokerage for the latest ${info.ticker} dividend information.`} ${siteConfig.name} focuses on AI-driven fundamental analysis rather than real-time financial data.`,
    },
    {
      question: `What is ${info.ticker}'s P/E ratio?`,
      answer: `${stockData?.keyMetrics?.peRatio && stockData.keyMetrics.peRatio !== 'N/A' ? `${info.company} has an approximate P/E ratio of ${stockData.keyMetrics.peRatio}.` : `Check a financial data provider for the latest ${info.ticker} P/E ratio.`} Visit this page for full AI-driven analysis including valuation metrics.`,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Schema.org — FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqItems)) }}
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
      <div className="mb-8">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Stocks', href: '/stock' },
          { label: `${info.ticker} — ${info.company}` },
        ]} />
        <div className="flex flex-wrap items-center gap-3 mb-3">
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

      {/* About — always visible (short, sets context) */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-2">About {info.company}</h2>
        <p className="text-muted leading-relaxed text-sm sm:text-base">
          {stockData?.overview || `${info.company} (${info.exchange}:${info.ticker}) is a ${info.country === 'CA' ? 'Canadian' : 'US'} company in the ${info.sector} sector, listed on the ${info.exchange}. Our AI analyzes ${info.ticker} as part of our regular stock coverage.`}
        </p>
      </section>

      {/* Key Metrics — always visible (quick scan, high value) */}
      {stockData && (
        <section className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border border-card-border rounded-xl p-3 sm:p-4 text-center">
              <p className="text-[10px] sm:text-xs text-muted-light uppercase tracking-wide">Market Cap</p>
              <p className="font-bold text-sm sm:text-base mt-1">{stockData.keyMetrics.marketCap}</p>
            </div>
            <div className="border border-card-border rounded-xl p-3 sm:p-4 text-center">
              <p className="text-[10px] sm:text-xs text-muted-light uppercase tracking-wide">P/E Ratio</p>
              <p className="font-bold text-sm sm:text-base mt-1">{stockData.keyMetrics.peRatio}</p>
            </div>
            <div className="border border-card-border rounded-xl p-3 sm:p-4 text-center">
              <p className="text-[10px] sm:text-xs text-muted-light uppercase tracking-wide">Dividend Yield</p>
              <p className="font-bold text-sm sm:text-base mt-1">{stockData.keyMetrics.dividendYield}</p>
            </div>
            <div className="border border-card-border rounded-xl p-3 sm:p-4 text-center">
              <p className="text-[10px] sm:text-xs text-muted-light uppercase tracking-wide">Sector</p>
              <p className="font-bold text-sm sm:text-base mt-1">{stockData.keyMetrics.sector}</p>
            </div>
          </div>
        </section>
      )}

      {/* Bull/Bear — collapsible (progressive disclosure) */}
      {stockData && (
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <Collapsible
            title="Bull Case"
            defaultOpen={false}
            icon={<span className="text-green text-sm font-bold">+</span>}
            variant="accent"
          >
            <ul className="space-y-2">
              {stockData.bullCase.map((point, i) => (
                <li key={i} className="text-sm text-muted flex gap-2">
                  <span className="text-green mt-0.5 shrink-0">+</span>
                  {point}
                </li>
              ))}
            </ul>
          </Collapsible>
          <Collapsible
            title="Bear Case"
            defaultOpen={false}
            icon={<span className="text-red text-sm font-bold">-</span>}
          >
            <ul className="space-y-2">
              {stockData.bearCase.map((point, i) => (
                <li key={i} className="text-sm text-muted flex gap-2">
                  <span className="text-red mt-0.5 shrink-0">-</span>
                  {point}
                </li>
              ))}
            </ul>
          </Collapsible>
        </div>
      )}

      {/* Analyst Summary — collapsible */}
      {stockData?.analystSummary && (
        <Collapsible
          title="Analyst Summary"
          defaultOpen={false}
          icon={<span className="text-accent text-sm">&#9679;</span>}
        >
          <p className="text-muted leading-relaxed text-sm">{stockData.analystSummary}</p>
        </Collapsible>
      )}

      {/* AI Analysis */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-3">AI Analysis for {info.ticker}</h2>
        {articles.length > 0 ? (
          <div className="grid gap-3">
            {articles.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-card-border rounded-xl p-6 sm:p-8 text-center">
            <p className="text-muted mb-2 text-sm">No analysis published yet for {info.ticker}.</p>
            <p className="text-xs text-muted-light">Subscribe to get notified when we cover this stock.</p>
          </div>
        )}
      </section>

      {/* FAQ — accordion style */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-3">Frequently Asked Questions</h2>
        {faqItems.slice(0, 7).map((faq, i) => (
          <Collapsible
            key={i}
            title={faq.question}
            defaultOpen={i === 0}
            variant="subtle"
          >
            <p className="text-sm text-muted leading-relaxed">{faq.answer}</p>
          </Collapsible>
        ))}
      </section>

      {/* Sector Peers */}
      {sectorPeers.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3">{info.sector} Sector Peers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sectorPeers.map(peer => (
              <Link
                key={peer.ticker}
                href={`/stock/${tickerToSlug(peer.ticker)}`}
                className="border border-card-border rounded-xl p-3 sm:p-4 hover:border-accent/30 hover:shadow-md transition-all group"
              >
                <p className="font-mono font-bold text-foreground group-hover:text-accent transition-colors text-sm sm:text-base">
                  {peer.ticker}
                </p>
                <p className="text-xs text-accent group-hover:underline mt-1">{peer.company}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-card-bg border border-card-border rounded-2xl p-6 sm:p-8 text-center">
        <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">
          Get AI analysis of {info.ticker} in your inbox
        </h3>
        <p className="text-muted text-sm mb-4 sm:mb-6">
          When our AI covers {info.company}, you&apos;ll be the first to know.
        </p>
        <div className="flex justify-center">
          <SubscribeForm />
        </div>
      </section>

      {/* Disclaimer */}
      <p className="text-xs text-muted-light mt-6 leading-relaxed">
        This page is AI-generated for educational purposes only. Not financial advice.
        {siteConfig.name} is not affiliated with {info.company} or any financial institution.
        Always do your own research.
      </p>
    </div>
  );
}
