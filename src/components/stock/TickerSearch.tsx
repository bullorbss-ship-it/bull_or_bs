'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';

interface TickerEntry {
  ticker: string;
  company: string;
  articleCount: number;
}

interface ArticleResult {
  slug: string;
  title: string;
  type: 'roast' | 'pick' | 'take';
  date: string;
  description: string;
}

interface TickerSearchProps {
  tickers: TickerEntry[];
  articles: ArticleResult[];
  /** Map of uppercase ticker → array of article slugs (includes candidate mentions) */
  tickerToSlugs: Record<string, string[]>;
}

const MAX_QUERY_LENGTH = 20;

export default function TickerSearch({ tickers, articles, tickerToSlugs }: TickerSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sanitize and limit input
  const handleInput = (value: string) => {
    const sanitized = value.slice(0, MAX_QUERY_LENGTH);
    setQuery(sanitized);
    setIsOpen(true);
  };

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toUpperCase();
    return tickers
      .filter(t => t.ticker.includes(q) || t.company.toUpperCase().includes(q))
      .slice(0, 8);
  }, [query, tickers]);

  const selectedTicker = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toUpperCase();
    return tickers.find(t => t.ticker === q) || null;
  }, [query, tickers]);

  const articleMap = useMemo(() => {
    const map = new Map<string, ArticleResult>();
    for (const a of articles) map.set(a.slug, a);
    return map;
  }, [articles]);

  const matchingArticles = useMemo(() => {
    if (!selectedTicker) return [];
    const slugs = tickerToSlugs[selectedTicker.ticker] || [];
    return slugs.map(s => articleMap.get(s)).filter((a): a is ArticleResult => !!a);
  }, [selectedTicker, tickerToSlugs, articleMap]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const badgeStyle = (type: string) =>
    type === 'roast'
      ? 'bg-red-light text-red'
      : type === 'take'
      ? 'bg-card-bg text-muted border border-card-border'
      : 'bg-accent-light text-accent';

  const badgeLabel = (type: string) =>
    type === 'roast' ? 'Roast' : type === 'take' ? 'News' : 'AI Pick';

  return (
    <div ref={containerRef} className="relative mb-6 sm:mb-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by ticker or company name..."
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          maxLength={MAX_QUERY_LENGTH}
          className="w-full border border-card-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-light focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
        />
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Dropdown suggestions */}
      {isOpen && results.length > 0 && !selectedTicker && (
        <div className="absolute z-20 w-full mt-1 border border-card-border rounded-xl bg-background shadow-lg overflow-hidden">
          {results.map(t => (
            <button
              key={t.ticker}
              onClick={() => {
                setQuery(t.ticker);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-card-bg transition-colors flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <span className="font-mono font-bold text-sm text-foreground">{t.ticker}</span>
                <span className="text-xs text-muted ml-2 truncate">{t.company}</span>
              </div>
              <span className="text-[10px] text-muted-light shrink-0">
                {t.articleCount} {t.articleCount === 1 ? 'article' : 'articles'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Results for selected ticker */}
      {selectedTicker && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h3 className="text-sm font-bold text-foreground">
              {matchingArticles.length} {matchingArticles.length === 1 ? 'article' : 'articles'} mentioning{' '}
              <span className="font-mono text-accent">{selectedTicker.ticker}</span>
            </h3>
            <Link
              href={`/stock/${selectedTicker.ticker.toLowerCase().replace(/\./g, '-')}`}
              className="text-xs text-accent hover:underline"
            >
              View stock page &rarr;
            </Link>
            <button
              onClick={() => { setQuery(''); setIsOpen(false); }}
              className="text-xs text-muted hover:text-foreground ml-auto"
            >
              Clear
            </button>
          </div>
          {matchingArticles.length > 0 ? (
            <div className="grid gap-2">
              {matchingArticles.map(a => (
                <Link key={a.slug} href={`/article/${a.slug}`} className="block group">
                  <div className="border border-card-border rounded-xl p-3 sm:p-4 hover:border-accent/30 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeStyle(a.type)}`}>
                        {badgeLabel(a.type)}
                      </span>
                      <span className="text-[10px] text-muted-light ml-auto">
                        {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-snug">
                      {a.title}
                    </p>
                    <p className="text-xs text-muted mt-1 line-clamp-1">{a.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted">
              No articles found for {selectedTicker.ticker}.{' '}
              <Link href={`/stock/${selectedTicker.ticker.toLowerCase().replace(/\./g, '-')}`} className="text-accent hover:underline">
                View stock page
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
