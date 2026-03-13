import { getTickerInfo } from './tickers';

// ─── News category colors ──────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  geopolitics: { text: 'text-rose', bg: 'bg-rose/10', border: 'border-rose/20' },
  defense:     { text: 'text-rose', bg: 'bg-rose/10', border: 'border-rose/20' },
  tech:        { text: 'text-purple', bg: 'bg-purple/10', border: 'border-purple/20' },
  'm&a':       { text: 'text-blue', bg: 'bg-blue/10', border: 'border-blue/20' },
  earnings:    { text: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
  macro:       { text: 'text-sky', bg: 'bg-sky/10', border: 'border-sky/20' },
  energy:      { text: 'text-orange', bg: 'bg-orange/10', border: 'border-orange/20' },
  commodities: { text: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20' },
  crypto:      { text: 'text-purple', bg: 'bg-purple/10', border: 'border-purple/20' },
  banking:     { text: 'text-blue', bg: 'bg-blue/10', border: 'border-blue/20' },
  policy:      { text: 'text-sky', bg: 'bg-sky/10', border: 'border-sky/20' },
  climate:     { text: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/20' },
  infrastructure: { text: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/20' },
};

const DEFAULT_NEWS = { text: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20' };

function getCategoryColor(category?: string) {
  if (!category) return DEFAULT_NEWS;
  return CATEGORY_COLORS[category.toLowerCase()] || DEFAULT_NEWS;
}

export function getArticleBadge(type: string, category?: string): { style: string; label: string } {
  if (type === 'roast') {
    return { style: 'bg-red/10 text-red border border-red/20', label: 'ROAST' };
  }
  if (type === 'take') {
    const c = getCategoryColor(category);
    const label = category ? `NEWS · ${category.toUpperCase()}` : 'NEWS';
    return { style: `${c.bg} ${c.text} border ${c.border}`, label };
  }
  return { style: 'bg-accent/10 text-accent border border-accent/20', label: 'PICK' };
}

// ─── Category chip (for takes listing page) ────────────────────────────────
export function getCategoryChipStyle(category: string): string {
  const c = CATEGORY_COLORS[category.toLowerCase()] || DEFAULT_NEWS;
  return `${c.bg} ${c.text} border ${c.border}`;
}

// ─── Ticker badge colors ───────────────────────────────────────────────────
export function getTickerBadgeStyle(ticker: string): string {
  const info = getTickerInfo(ticker);
  if (info?.sector === 'ETF') {
    return 'text-purple font-mono bg-purple/10 border border-purple/20';
  }
  return 'text-sky font-mono bg-sky/10 border border-sky/20';
}
