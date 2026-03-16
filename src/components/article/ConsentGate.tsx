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
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, ts: Date.now() }));
    setAccepted(true);
  }

  if (hasConsent || accepted) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div className="blur-sm pointer-events-none select-none max-h-[400px] overflow-hidden" aria-hidden="true">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-start justify-center pt-12 bg-background/80 backdrop-blur-sm z-10">
        <div className="bg-card-bg border border-card-border rounded-xl p-6 sm:p-8 max-w-md mx-4 text-center shadow-xl">
          <p className="text-xs font-mono text-accent tracking-wider mb-3">AI EDITORIAL OPINION</p>
          <h3 className="text-lg font-bold mb-3">Before you read</h3>
          <p className="text-sm text-muted leading-relaxed mb-2">
            This analysis is <strong>AI-generated opinion</strong>, not financial advice.
          </p>
          <p className="text-sm text-muted leading-relaxed mb-6">
            Always do your own research before making investment decisions.
          </p>
          <button
            onClick={handleAccept}
            className="w-full bg-accent hover:bg-accent-dim text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm"
          >
            I understand, show the analysis
          </button>
          <p className="text-[10px] text-muted-light mt-3">
            You won&apos;t see this again for 30 days.
          </p>
        </div>
      </div>
    </div>
  );
}
