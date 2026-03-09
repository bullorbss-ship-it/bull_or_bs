import { getAllSectors, getTickersByCountry, tickerToSlug } from '@/lib/tickers';
import { getAllTickersExpanded } from '@/lib/ticker-registry';
import type { Metadata } from 'next';
import SubscribeForm from '@/components/forms/SubscribeForm';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import StockGrid from '@/components/stock/StockGrid';

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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Stocks' },
      ]} />
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">Stock Analysis</h1>
      <p className="text-muted text-sm sm:text-lg mb-6 sm:mb-8 max-w-2xl">
        AI-generated analysis for {getAllTickersExpanded().length}+ stocks across TSX, NYSE, and NASDAQ.
        Every analysis shows its full reasoning chain.
      </p>

      <StockGrid
        sectors={sectors}
        canadian={canadianStocks.map(s => ({ ticker: s.ticker, company: s.company, slug: tickerToSlug(s.ticker), sector: s.sector }))}
        us={usStocks.map(s => ({ ticker: s.ticker, company: s.company, slug: tickerToSlug(s.ticker), sector: s.sector }))}
      />

      {/* CTA */}
      <section className="bg-card-bg border border-card-border rounded-2xl p-6 sm:p-10 text-center">
        <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Get weekly stock analysis in your inbox</h2>
        <p className="text-muted text-sm mb-4 sm:mb-6">AI-driven research. Full reasoning. Free.</p>
        <div className="flex justify-center">
          <SubscribeForm />
        </div>
      </section>
    </div>
  );
}
