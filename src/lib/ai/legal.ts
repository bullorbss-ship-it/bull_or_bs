/**
 * Legal compliance audit — runs on every generated article.
 * Scrubs competitor trademarks from headlines/summaries/verdicts,
 * replaces with generic references. Names OK in analysis body only.
 */

import { ArticleContent } from '@/lib/types';

// Competitor names that must NOT appear in headlines, summaries, or verdicts
const COMPETITOR_NAMES = [
  'Motley Fool',
  'The Motley Fool',
  'Fool\\.ca',
  'Seeking Alpha',
  'Zacks',
  'Globe and Mail',
  'The Globe and Mail',
  'BNN Bloomberg',
  'Barron\'s',
  'MarketWatch',
  'Jim Cramer',
  'Mad Money',
  'CNBC Stock Picks',
];

const COMPETITOR_REGEX = new RegExp(
  `\\b(${COMPETITOR_NAMES.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
  'gi'
);

const GENERIC_REPLACEMENTS: Record<string, string> = {
  'motley fool': 'a popular financial newsletter',
  'the motley fool': 'a popular financial newsletter',
  'fool.ca': 'a popular financial newsletter',
  'seeking alpha': 'a financial publication',
  'zacks': 'a financial research firm',
  'globe and mail': 'a national financial newspaper',
  'the globe and mail': 'a national financial newspaper',
  'bnn bloomberg': 'a financial news network',
  "barron's": 'a financial publication',
  'marketwatch': 'a financial news site',
  'jim cramer': 'a popular TV stock commentator',
  'mad money': 'a popular stock TV show',
  'cnbc stock picks': 'a financial news network',
};

function scrubCompetitorNames(text: string): string {
  if (!text) return text;
  return text.replace(COMPETITOR_REGEX, (match) => {
    return GENERIC_REPLACEMENTS[match.toLowerCase()] || 'a financial publication';
  });
}

export interface LegalAuditResult {
  passed: boolean;
  violations: string[];
  scrubbed: boolean;
}

/**
 * Audit and scrub an article for legal compliance.
 * - Headlines, summaries, verdicts: competitor names replaced with generic
 * - Analysis body: competitor names allowed (fair-use commentary)
 * - foolClaim: scrubbed (should be paraphrased, not attributed)
 */
export function auditAndScrub(content: ArticleContent): { content: ArticleContent; audit: LegalAuditResult } {
  const violations: string[] = [];
  let scrubbed = false;

  // Fields that MUST NOT contain competitor names
  const protectedFields: (keyof ArticleContent)[] = ['headline', 'summary', 'finalVerdict', 'foolClaim'];

  const cleaned = { ...content };

  for (const field of protectedFields) {
    const val = cleaned[field];
    if (typeof val !== 'string') continue;

    if (COMPETITOR_REGEX.test(val)) {
      violations.push(`${field}: contains competitor name`);
      (cleaned as Record<string, unknown>)[field] = scrubCompetitorNames(val);
      scrubbed = true;
      // Reset regex lastIndex
      COMPETITOR_REGEX.lastIndex = 0;
    }
    COMPETITOR_REGEX.lastIndex = 0;
  }

  // Audit analysis body — log but don't scrub (fair use in editorial)
  if (typeof cleaned.analysis === 'string' && COMPETITOR_REGEX.test(cleaned.analysis)) {
    // Allowed in analysis body — just note it
    COMPETITOR_REGEX.lastIndex = 0;
  }

  return {
    content: cleaned,
    audit: {
      passed: violations.length === 0,
      violations,
      scrubbed,
    },
  };
}
