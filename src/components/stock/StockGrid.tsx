'use client';

import { useState } from 'react';
import Link from 'next/link';

interface StockItem {
  ticker: string;
  company: string;
  slug: string;
  sector: string;
}

interface StockGridProps {
  sectors: string[];
  canadian: StockItem[];
  us: StockItem[];
}

export default function StockGrid({ sectors, canadian, us }: StockGridProps) {
  const [activeSector, setActiveSector] = useState<string | null>(null);

  const filteredCanadian = activeSector
    ? canadian.filter(s => s.sector === activeSector)
    : canadian;

  const filteredUs = activeSector
    ? us.filter(s => s.sector === activeSector)
    : us;

  return (
    <>
      {/* Sector filters — sticky at top */}
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-mono text-muted-light mb-3 uppercase tracking-wide">Filter by sector</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSector(null)}
            className={`rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              activeSector === null
                ? 'bg-accent text-white'
                : 'border border-card-border text-muted hover:text-foreground hover:border-accent/30'
            }`}
          >
            All ({canadian.length + us.length})
          </button>
          {sectors.map(sector => {
            const count = canadian.filter(s => s.sector === sector).length +
              us.filter(s => s.sector === sector).length;
            return (
              <button
                key={sector}
                onClick={() => setActiveSector(activeSector === sector ? null : sector)}
                className={`rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                  activeSector === sector
                    ? 'bg-accent text-white'
                    : 'border border-card-border text-muted hover:text-foreground hover:border-accent/30'
                }`}
              >
                {sector} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Canadian Stocks */}
      {filteredCanadian.length > 0 && (
        <section className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Canadian Stocks</h2>
            <span className="text-[10px] sm:text-xs font-semibold text-red bg-red-light px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">TSX</span>
            {activeSector && (
              <span className="text-xs text-muted">
                {filteredCanadian.length} in {activeSector}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {filteredCanadian.map(stock => (
              <Link
                key={stock.ticker}
                href={`/stock/${stock.slug}`}
                className="border border-card-border rounded-xl p-3 sm:p-4 hover:border-accent/30 hover:shadow-md transition-all group active:scale-[0.98]"
              >
                <p className="font-mono font-bold text-sm sm:text-base text-foreground group-hover:text-accent transition-colors">
                  {stock.ticker}
                </p>
                <p className="text-[10px] sm:text-xs text-accent group-hover:underline mt-0.5 sm:mt-1 line-clamp-1">{stock.company}</p>
                <p className="text-[10px] sm:text-xs text-muted-light mt-0.5 sm:mt-1">{stock.sector}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* US Stocks */}
      {filteredUs.length > 0 && (
        <section className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">US Stocks</h2>
            <span className="text-[10px] sm:text-xs font-semibold text-accent bg-accent-light px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">NYSE / NASDAQ</span>
            {activeSector && (
              <span className="text-xs text-muted">
                {filteredUs.length} in {activeSector}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {filteredUs.map(stock => (
              <Link
                key={stock.ticker}
                href={`/stock/${stock.slug}`}
                className="border border-card-border rounded-xl p-3 sm:p-4 hover:border-accent/30 hover:shadow-md transition-all group active:scale-[0.98]"
              >
                <p className="font-mono font-bold text-sm sm:text-base text-foreground group-hover:text-accent transition-colors">
                  {stock.ticker}
                </p>
                <p className="text-[10px] sm:text-xs text-accent group-hover:underline mt-0.5 sm:mt-1 line-clamp-1">{stock.company}</p>
                <p className="text-[10px] sm:text-xs text-muted-light mt-0.5 sm:mt-1">{stock.sector}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state when filter matches nothing */}
      {filteredCanadian.length === 0 && filteredUs.length === 0 && activeSector && (
        <div className="text-center py-12">
          <p className="text-muted text-sm mb-3">No stocks found in {activeSector}.</p>
          <button
            onClick={() => setActiveSector(null)}
            className="text-accent text-sm underline underline-offset-4 hover:text-accent/80"
          >
            Clear filter
          </button>
        </div>
      )}
    </>
  );
}
