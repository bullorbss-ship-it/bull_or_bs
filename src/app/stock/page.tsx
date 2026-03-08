import { ALL_TICKERS, getAllSectors, getTickersByCountry, tickerToSlug } from '@/lib/tickers';
import Link from 'next/link';
import type { Metadata } from 'next';
import SubscribeForm from '@/components/forms/SubscribeForm';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Stock Analysis — TSX & US Stocks',
  description:
    'AI-powered analysis for Canadian TSX and US stocks. Browse stock analysis, compare tickers, and get transparent AI-driven research on any stock.',
  keywords: [
    'TSX stock analysis',
    'Canadian stock analysis',
    'US stock analysis',
    'AI stock picks',
    'best Canadian stocks',
    'stock research Canada',
  ],
};

export default function StockIndexPage() {
  const canadianStocks = getTickersByCountry('CA');
  const usStocks = getTickersByCountry('US');
  const sectors = getAllSectors();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Stocks' },
      ]} />
      <h1 className="text-3xl md:text-4xl font-bold mb-3">Stock Analysis</h1>
      <p className="text-muted text-lg mb-10 max-w-2xl">
        AI-generated analysis for {ALL_TICKERS.length}+ stocks across TSX, NYSE, and NASDAQ.
        Every analysis shows its full reasoning chain.
      </p>

      {/* Canadian Stocks */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold">Canadian Stocks</h2>
          <span className="text-xs font-semibold text-red bg-red-light px-2.5 py-1 rounded-full">TSX</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {canadianStocks.map(stock => (
            <Link
              key={stock.ticker}
              href={`/stock/${tickerToSlug(stock.ticker)}`}
              className="border border-card-border rounded-xl p-4 hover:border-accent/30 hover:shadow-md transition-all group"
            >
              <p className="font-mono font-bold text-foreground group-hover:text-accent transition-colors">
                {stock.ticker}
              </p>
              <p className="text-xs text-accent group-hover:underline mt-1 line-clamp-1">{stock.company}</p>
              <p className="text-xs text-muted-light mt-1">{stock.sector}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* US Stocks */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold">US Stocks</h2>
          <span className="text-xs font-semibold text-accent bg-accent-light px-2.5 py-1 rounded-full">NYSE / NASDAQ</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {usStocks.map(stock => (
            <Link
              key={stock.ticker}
              href={`/stock/${tickerToSlug(stock.ticker)}`}
              className="border border-card-border rounded-xl p-4 hover:border-accent/30 hover:shadow-md transition-all group"
            >
              <p className="font-mono font-bold text-foreground group-hover:text-accent transition-colors">
                {stock.ticker}
              </p>
              <p className="text-xs text-accent group-hover:underline mt-1 line-clamp-1">{stock.company}</p>
              <p className="text-xs text-muted-light mt-1">{stock.sector}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Sectors */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-6">Browse by Sector</h2>
        <div className="flex flex-wrap gap-3">
          {sectors.map(sector => (
            <span
              key={sector}
              className="border border-card-border rounded-full px-4 py-2 text-sm text-muted hover:text-foreground hover:border-accent/30 transition-colors"
            >
              {sector}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-card-bg border border-card-border rounded-2xl p-10 text-center">
        <h2 className="text-xl font-bold mb-3">Get weekly stock analysis in your inbox</h2>
        <p className="text-muted mb-6">AI-driven research. Full reasoning. Free.</p>
        <div className="flex justify-center">
          <SubscribeForm />
        </div>
      </section>
    </div>
  );
}
