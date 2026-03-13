import { getTickerInfo } from './tickers';

// ─── News category colors ──────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string; icon: string; gradient: string }> = {
  geopolitics:    { text: 'text-rose', bg: 'bg-rose/10', border: 'border-rose/20', icon: '🌍', gradient: 'from-rose/20 to-transparent' },
  defense:        { text: 'text-rose', bg: 'bg-rose/10', border: 'border-rose/20', icon: '🛡️', gradient: 'from-rose/20 to-transparent' },
  tech:           { text: 'text-purple', bg: 'bg-purple/10', border: 'border-purple/20', icon: '⚡', gradient: 'from-purple/20 to-transparent' },
  'm&a':          { text: 'text-blue', bg: 'bg-blue/10', border: 'border-blue/20', icon: '🤝', gradient: 'from-blue/20 to-transparent' },
  earnings:       { text: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', icon: '📊', gradient: 'from-accent/20 to-transparent' },
  macro:          { text: 'text-sky', bg: 'bg-sky/10', border: 'border-sky/20', icon: '🏛️', gradient: 'from-sky/20 to-transparent' },
  energy:         { text: 'text-orange', bg: 'bg-orange/10', border: 'border-orange/20', icon: '🛢️', gradient: 'from-orange/20 to-transparent' },
  commodities:    { text: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20', icon: '🥇', gradient: 'from-gold/20 to-transparent' },
  crypto:         { text: 'text-purple', bg: 'bg-purple/10', border: 'border-purple/20', icon: '₿', gradient: 'from-purple/20 to-transparent' },
  banking:        { text: 'text-blue', bg: 'bg-blue/10', border: 'border-blue/20', icon: '🏦', gradient: 'from-blue/20 to-transparent' },
  policy:         { text: 'text-sky', bg: 'bg-sky/10', border: 'border-sky/20', icon: '📜', gradient: 'from-sky/20 to-transparent' },
  climate:        { text: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/20', icon: '🌱', gradient: 'from-teal/20 to-transparent' },
  infrastructure: { text: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/20', icon: '🏗️', gradient: 'from-teal/20 to-transparent' },
};

const DEFAULT_NEWS = { text: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20', icon: '📰', gradient: 'from-gold/20 to-transparent' };

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

// ─── Visual helpers (icons, gradients) ──────────────────────────────────────
export function getArticleIcon(type: string, category?: string): string {
  if (type === 'roast') return '🔥';
  if (type === 'pick') return '🎯';
  const c = category ? CATEGORY_COLORS[category.toLowerCase()] : null;
  return c?.icon || DEFAULT_NEWS.icon;
}

export function getArticleGradient(type: string, category?: string): string {
  if (type === 'roast') return 'from-red/20 to-transparent';
  if (type === 'pick') return 'from-accent/20 to-transparent';
  const c = category ? CATEGORY_COLORS[category.toLowerCase()] : null;
  return c?.gradient || DEFAULT_NEWS.gradient;
}

// ─── Ticker badge colors ───────────────────────────────────────────────────
export function getTickerBadgeStyle(ticker: string): string {
  const info = getTickerInfo(ticker);
  if (info?.sector === 'ETF') {
    return 'text-purple font-mono bg-purple/10 border border-purple/20';
  }
  return 'text-sky font-mono bg-sky/10 border border-sky/20';
}
