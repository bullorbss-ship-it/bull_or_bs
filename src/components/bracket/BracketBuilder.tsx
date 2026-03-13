'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArticleContent } from '@/lib/types';
import Tournament from '@/components/article/Tournament';
import DataPoints from '@/components/article/DataPoints';

type Phase = 'input' | 'loading' | 'results' | 'error';

export default function BracketBuilder() {
  const searchParams = useSearchParams();
  const initialTickers = searchParams.get('tickers')?.split(',').filter(Boolean) || [];

  const [tickers, setTickers] = useState<string[]>(initialTickers);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>(initialTickers.length >= 2 ? 'input' : 'input');
  const [result, setResult] = useState<ArticleContent | null>(null);
  const [error, setError] = useState('');

  const addTicker = useCallback(() => {
    const cleaned = input.trim().toUpperCase().replace(/[^A-Z0-9.\-]/g, '');
    if (!cleaned || cleaned.length > 12) return;
    if (tickers.includes(cleaned)) { setInput(''); return; }
    if (tickers.length >= 16) return;
    setTickers(prev => [...prev, cleaned]);
    setInput('');
  }, [input, tickers]);

  const removeTicker = (t: string) => {
    setTickers(prev => prev.filter(x => x !== t));
  };

  const generate = async () => {
    if (tickers.length < 2) return;
    setPhase('loading');
    setError('');

    try {
      const res = await fetch('/api/bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation failed');
      }

      const data = await res.json();
      setResult(data.content);
      setPhase('results');

      // Update URL for sharing
      const url = new URL(window.location.href);
      url.searchParams.set('tickers', tickers.join(','));
      window.history.replaceState({}, '', url.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setPhase('error');
    }
  };

  const reset = () => {
    setPhase('input');
    setResult(null);
    setError('');
  };

  // ─── Input Phase ──────────────────────────────────────────────────
  if (phase === 'input' || phase === 'error') {
    return (
      <div>
        {/* Ticker input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTicker(); } }}
            placeholder="Enter ticker (e.g. AAPL, SHOP.TO)"
            className="flex-1 border border-card-border bg-card-bg rounded-lg px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-light focus:outline-none focus:border-accent"
            maxLength={12}
          />
          <button
            onClick={addTicker}
            disabled={!input.trim() || tickers.length >= 16}
            className="px-4 py-2.5 bg-accent hover:bg-accent-dim disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Add
          </button>
        </div>

        {/* Ticker chips */}
        {tickers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tickers.map(t => (
              <span key={t} className="inline-flex items-center gap-1.5 bg-card-bg border border-card-border rounded-full px-3 py-1 text-sm font-mono">
                {t}
                <button
                  onClick={() => removeTicker(t)}
                  className="text-muted-light hover:text-red transition-colors text-xs"
                  aria-label={`Remove ${t}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-light mb-4">
          {tickers.length}/16 tickers {tickers.length < 2 && '(minimum 2)'}
        </p>

        {error && (
          <div className="bg-red/10 border border-red/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-red">{error}</p>
          </div>
        )}

        <button
          onClick={generate}
          disabled={tickers.length < 2}
          className="w-full bg-accent hover:bg-accent-dim disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors text-sm"
        >
          Run the Bracket ({tickers.length} stocks)
        </button>
      </div>
    );
  }

  // ─── Loading Phase ────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted font-mono text-sm">Running the tournament...</p>
        <p className="text-muted-light text-xs mt-2">Comparing {tickers.length} stocks head-to-head</p>
      </div>
    );
  }

  // ─── Results Phase ────────────────────────────────────────────────
  if (phase === 'results' && result) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">{result.headline}</h2>
          <p className="text-muted text-sm leading-relaxed">{result.summary}</p>
        </div>

        {/* Verdict */}
        {result.finalVerdict && (
          <div className="border-l-4 border-accent bg-accent-light rounded-r-lg p-4 sm:p-6 mb-6">
            <p className="text-xs font-mono text-accent font-bold mb-2">THE VERDICT</p>
            <p className="text-foreground leading-relaxed text-sm sm:text-base">{result.finalVerdict}</p>
          </div>
        )}

        {/* Tournament */}
        {result.candidates && result.candidates.length > 0 && (
          <Tournament candidates={result.candidates} isRoast={false} />
        )}

        {/* Data Points */}
        {result.dataPoints && result.dataPoints.length > 0 && (
          <DataPoints dataPoints={result.dataPoints} provenance={{ type: 'pick' }} />
        )}

        {/* Share link */}
        <div className="border-t border-card-border pt-6 mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="flex-1 border border-card-border hover:border-accent/40 rounded-lg py-2.5 px-4 text-sm font-mono text-muted hover:text-accent transition-colors"
          >
            Copy share link
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-accent hover:bg-accent-dim text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
          >
            New bracket
          </button>
        </div>
      </div>
    );
  }

  return null;
}
