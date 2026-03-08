import { Article } from './types';
import { TSX_TICKERS, US_TICKERS } from './tickers';

interface QualityResult {
  score: number; // 0-100
  issues: string[];
  passed: boolean;
}

const VALID_TICKERS = new Set([
  ...TSX_TICKERS.map(t => t.ticker),
  ...US_TICKERS.map(t => t.ticker),
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

  // 4. Data points (min 3 with sources)
  const dataPoints = content.dataPoints || [];
  if (dataPoints.length < 3) {
    issues.push(`Only ${dataPoints.length} data points (min 3 required)`);
    score -= 15;
  }
  const sourcedPoints = dataPoints.filter(d => d.source);
  if (sourcedPoints.length < dataPoints.length) {
    issues.push(`${dataPoints.length - sourcedPoints.length} data points missing sources`);
    score -= 5;
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

  // 8. Candidates have scores
  const candidates = content.candidates || [];
  if (candidates.length === 0) {
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
    if (!VALID_TICKERS.has(c.ticker)) {
      issues.push(`Unknown candidate ticker: ${c.ticker}`);
      score -= 5;
    }
  }

  // 10. Grade present (check tags or content for A-F)
  const hasGrade = article.tags.some(t => VALID_GRADES.includes(t)) ||
    VALID_GRADES.some(g => content.headline?.includes(`Grade: ${g}`) || content.headline?.includes(`${g}+`) || content.headline?.includes(`${g}-`));
  if (!hasGrade && article.type === 'roast') {
    issues.push('No grade (A-F) found in tags or headline');
    score -= 5;
  }

  score = Math.max(0, score);

  return {
    score,
    issues,
    passed: score >= 70 && issues.length <= 3,
  };
}
