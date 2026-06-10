'use client';

import { useState, useSyncExternalStore, ReactNode, useCallback } from 'react';

const CONSENT_KEY = 'bullorbs_ai_consent';
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function checkConsent(articleType: string): boolean {
  if (articleType === 'take') return true;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.accepted && Date.now() - data.ts < THIRTY_DAYS) return true;
    }
  } catch { /* fall through */ }
  return false;
}

interface ConsentGateProps {
  articleType: string;
  children: ReactNode;
}

/**
 * Inline AI-disclosure banner. Previously a blur-gate that hid content behind an
 * "I understand" click — that stacked with the newsletter popup for first-time
 * social visitors and drove bounce. Content is now always readable; the
 * disclaimer stays prominent until acknowledged (remembered for 30 days).
 */
export default function ConsentGate({ articleType, children }: ConsentGateProps) {
  // Subscribe to localStorage for consent state
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener('storage', cb);
    return () => window.removeEventListener('storage', cb);
  }, []);
  const hasConsent = useSyncExternalStore(
    subscribe,
    () => checkConsent(articleType),
    () => true // SSR: crawlers see content
  );

  const [accepted, setAccepted] = useState(false);

  function handleAccept() {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, ts: Date.now() }));
    } catch { /* localStorage unavailable */ }
    setAccepted(true);
  }

  if (hasConsent || accepted) return <>{children}</>;

  return (
    <>
      <aside
        className="border border-gold/30 bg-gold-light rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3"
        aria-label="AI content disclosure"
      >
        <div className="flex-1">
          <p className="text-xs font-mono font-bold text-gold-strong tracking-wider mb-1">AI EDITORIAL OPINION</p>
          <p className="text-sm text-foreground/90 leading-relaxed">
            This analysis is <strong>AI-generated opinion</strong>, not financial advice.
            Always do your own research before making investment decisions.
          </p>
        </div>
        <button
          onClick={handleAccept}
          className="shrink-0 bg-accent hover:bg-accent-dim text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Got it
        </button>
      </aside>
      {children}
    </>
  );
}
