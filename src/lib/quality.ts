import { Article, EditorialDraft, QualityResult } from './types';
import { TSX_TICKERS, US_TICKERS } from './tickers';
import { getDynamicTickers } from './ticker-registry';

const VALID_TICKERS = new Set([
  ...TSX_TICKERS.map(t => t.ticker),
  ...US_TICKERS.map(t => t.ticker),
  ...getDynamicTickers().map(t => t.ticker),
]);

const VALID_GRADES = ['A', 'B', 'C', 'D', 'F'];

export function validateArticle(article: Article): QualityResult {
  const issues: string[] = [];
  let score = 100;

  // 1. Valid JSON structure
  if (!article.slug || !article.type || !article.title || !article.date) {
    issues.push('Missing required fields (slug, type, title, or date)');
    score -= 20;
  }

  // 2. Content exists
  if (!article.content) {
    issues.push('Missing content object');
    return { score: 0, issues, passed: false };
  }

  const { content } = article;

  // 3. Headline and summary
  if (!content.headline || content.headline.length < 10) {
    issues.push('Headline missing or too short (min 10 chars)');
    score -= 10;
  }
  if (!content.summary || content.summary.length < 20) {
    issues.push('Summary missing or too short (min 20 chars)');
    score -= 10;
  }

  // 4. Data points (min 3 with verifiable sources)
  const dataPoints = content.dataPoints || [];
  if (dataPoints.length < 3) {
    issues.push(`Only ${dataPoints.length} data points (min 3 required)`);
    score -= 15;
  }
  const sourcedPoints = dataPoints.filter(d => d.source && isHttpUrl(d.sourceUrl));
  if (sourcedPoints.length < dataPoints.length) {
    issues.push(`${dataPoints.length - sourcedPoints.length} data points missing source URLs`);
    score -= 10;
  }

  // 5. Risks and catalysts (min 3 each)
  const risks = content.risks || [];
  const catalysts = content.catalysts || [];
  if (risks.length < 3) {
    issues.push(`Only ${risks.length} risks (min 3 required)`);
    score -= 10;
  }
  if (catalysts.length < 3) {
    issues.push(`Only ${catalysts.length} catalysts (min 3 required)`);
    score -= 10;
  }

  // 6. Analysis word count (min 500)
  const wordCount = (content.analysis || '').split(/\s+/).filter(Boolean).length;
  if (wordCount < 500) {
    issues.push(`Analysis is ${wordCount} words (min 500 required)`);
    score -= 15;
  }

  // 7. Verdict present
  if (!content.finalVerdict || content.finalVerdict.length < 20) {
    issues.push('Final verdict missing or too short');
    score -= 10;
  }

  // 8. Candidates have scores (only graded comparison content needs them)
  const candidates = content.candidates || [];
  if (article.type !== 'take' && candidates.length === 0) {
    issues.push('No candidates in tournament');
    score -= 10;
  }
  const unscoredCandidates = candidates.filter(c => c.score === undefined);
  if (unscoredCandidates.length > 0) {
    issues.push(`${unscoredCandidates.length} candidates missing scores`);
    score -= 5;
  }

  // 9. No hallucinated tickers
  if (article.ticker && !VALID_TICKERS.has(article.ticker)) {
    issues.push(`Unknown ticker: ${article.ticker} (not in tickers.ts)`);
    score -= 10;
  }
  for (const c of candidates) {
    if (c.ticker && !VALID_TICKERS.has(c.ticker)) {
      issues.push(`Unknown candidate ticker: ${c.ticker}`);
      score -= 5;
    }
  }

  // 10. References must be complete and use crawlable HTTP(S) URLs.
  const references = content.references || [];
  if (references.length < 3) {
    issues.push(`Only ${references.length} references (min 3 required)`);
    score -= 15;
  }
  const invalidReferences = references.filter(r => !r.source || !isHttpUrl(r.url));
  if (invalidReferences.length > 0) {
    issues.push(`${invalidReferences.length} invalid references`);
    score -= 10;
  }

  // 11. Grade present (check for A-F letter grades OR 1-10 numeric scores)
  const hasLetterGrade = article.tags.some(t => VALID_GRADES.includes(t)) ||
    VALID_GRADES.some(g => content.headline?.includes(`Grade: ${g}`) || content.headline?.includes(`${g}+`) || content.headline?.includes(`${g}-`));
  const hasNumericScore = /\b\d{1,2}\/10\b/.test(content.finalVerdict || '') || /\b\d{1,2}\/10\b/.test(content.headline || '');
  if (!hasLetterGrade && !hasNumericScore && article.type === 'roast') {
    issues.push('No grade (A-F or 1-10) found in verdict or headline');
    score -= 5;
  }

  score = Math.max(0, score);

  return {
    score,
    issues,
    passed: score >= 80 && issues.length <= 2,
  };
}

function isHttpUrl(value?: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * New editorial drafts have a higher bar than legacy articles. This gate checks
 * the independent research packet and verifier output in addition to layout.
 */
export function validateEditorialDraft(
  draft: Pick<EditorialDraft, 'article' | 'research' | 'verification'>,
): QualityResult {
  const issues: string[] = [];
  const articleResult = validateArticle(draft.article);
  const primarySources = draft.research.sources.filter(s => s.sourceType === 'primary');
  const sourceUrls = new Set(draft.research.sources.map(s => s.url));
  const referenceUrls = draft.article.content.references || [];
  const researchCoverage = referenceUrls.filter(r => sourceUrls.has(r.url)).length;
  const breakdown = {
    evidence: 25,
    originality: 25,
    intent: 15,
    transparency: 15,
    freshness: 10,
    usability: 10,
  };

  if (draft.research.sources.length < 5) {
    issues.push(`Research packet has ${draft.research.sources.length} sources (need 5+)`);
    breakdown.evidence -= 10;
  }
  if (primarySources.length < 2) {
    issues.push(`Research packet has ${primarySources.length} primary sources (need 2+)`);
    breakdown.evidence -= 10;
  }
  if (researchCoverage < Math.min(3, draft.research.sources.length)) {
    issues.push('Article does not cite enough sources from its research packet');
    breakdown.evidence -= 5;
  }
  if (draft.research.comparisonDimensions.length < 4) {
    issues.push('Research lacks a substantial head-to-head comparison');
    breakdown.originality -= 15;
  }
  if (!draft.research.keyFindings.length || !draft.research.uncertainties.length) {
    issues.push('Research must document both findings and uncertainties');
    breakdown.transparency -= 8;
  }
  if (!draft.verification.passed || draft.verification.unsupportedClaims.length > 0) {
    issues.push(...draft.verification.issues, ...draft.verification.unsupportedClaims);
    breakdown.evidence = 0;
  }
  if (!draft.article.description || draft.article.description.length < 120) {
    issues.push('Search description is too thin');
    breakdown.intent -= 5;
  }
  if (!draft.article.content.analysis.includes('|')) {
    issues.push('Article is missing an original comparison table');
    breakdown.usability -= 5;
  }
  if (!articleResult.passed) {
    issues.push(...articleResult.issues);
    breakdown.usability = Math.max(0, breakdown.usability - 5);
  }

  const score = Object.values(breakdown).reduce((sum, value) => sum + Math.max(0, value), 0);
  return {
    score,
    breakdown,
    issues: [...new Set(issues)],
    passed: score >= 80 && draft.verification.passed && issues.length <= 3,
  };
}
