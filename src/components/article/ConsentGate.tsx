'use client';

import { useState, useEffect, ReactNode } from 'react';

const CONSENT_KEY = 'bullorbs_ai_consent';
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

interface ConsentGateProps {
  articleType: string;
  children: ReactNode;
}

export default function ConsentGate({ articleType, children }: ConsentGateProps) {
  const [consented, setConsented] = useState(true); // default true for SSR (crawlers see content)

  useEffect(() => {
    // Takes skip the gate
    if (articleType === 'take') return;

    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.accepted && Date.now() - data.ts < THIRTY_DAYS) return;
      }
      setConsented(false);
    } catch {
      setConsented(false);
    }
  }, [articleType]);

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, ts: Date.now() }));
    setConsented(true);
  }

  if (consented) return <>{children}</>;

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
