'use client';

import { siteConfig } from '@/config/site';

interface AffiliateCTAProps {
  ticker?: string;
  placement: 'mid' | 'bottom';
}

const PARTNERS = [
  {
    name: 'Wealthsimple',
    description: 'Commission-free trading for Canadian stocks and ETFs. No minimums.',
    cta: 'Start trading free',
    url: 'https://www.wealthsimple.com/en-ca',
    tag: 'COMMISSION-FREE',
  },
  {
    name: 'Questrade',
    description: 'Buy ETFs commission-free. Low-cost stock trades from $4.95.',
    cta: 'Open an account',
    url: 'https://www.questrade.com',
    tag: 'LOW-COST',
  },
];

export default function AffiliateCTA({ ticker, placement }: AffiliateCTAProps) {
  // Show different partner based on placement to avoid repetition
  const partner = PARTNERS[placement === 'mid' ? 0 : 1];

  return (
    <div className="border border-card-border rounded-xl p-4 sm:p-5 my-6 bg-card-bg/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] font-mono text-muted-light tracking-wider">PARTNER</span>
            <span className="text-[9px] font-mono font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
              {partner.tag}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">
            {ticker
              ? `Want to act on this ${ticker} analysis?`
              : 'Ready to start investing?'}
          </p>
          <p className="text-xs text-muted leading-relaxed">
            {partner.description}
          </p>
        </div>
        <a
          href={partner.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="shrink-0 bg-accent text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-accent-dim transition-colors whitespace-nowrap"
          onClick={() => {
            // GA4 event for affiliate click tracking
            if (typeof window !== 'undefined' && 'gtag' in window) {
              (window as Record<string, unknown> & { gtag: (...args: unknown[]) => void }).gtag('event', 'affiliate_click', {
                partner: partner.name,
                ticker: ticker || 'none',
                placement,
              });
            }
          }}
        >
          {partner.cta}
        </a>
      </div>
      <p className="text-[9px] text-muted-light mt-2">
        {siteConfig.name} may earn a commission. This does not affect our analysis.
      </p>
    </div>
  );
}
