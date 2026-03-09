import { ArticleContent } from '@/lib/types';
import { tickerToSlug } from '@/lib/tickers';
import { getAllTickersExpanded } from '@/lib/ticker-registry';
import Anthropic from '@anthropic-ai/sdk';

export function extractText(response: Anthropic.Message): string {
  return response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');
}

function repairJson(raw: string): string {
  let s = raw;
  // Remove trailing commas before ] or }
  s = s.replace(/,\s*([}\]])/g, '$1');
  // Escape unescaped control characters inside strings
  s = s.replace(/(["'])(?:(?=(\\?))\2[\s\S])*?\1/g, (match) => {
    return match.replace(/[\n\r\t]/g, (ch) => {
      if (ch === '\n') return '\\n';
      if (ch === '\r') return '\\r';
      if (ch === '\t') return '\\t';
      return ch;
    });
  });
  // Remove any remaining raw control chars outside strings
  s = s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
  return s;
}

export function parseArticleContent(text: string): ArticleContent {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response as JSON');
  }

  // Try raw first
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    // Try repaired
    const repaired = repairJson(jsonMatch[0]);
    try {
      return JSON.parse(repaired);
    } catch (e) {
      // Last resort: try to find the outermost balanced braces
      let depth = 0;
      let start = -1;
      let end = -1;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') { if (start === -1) start = i; depth++; }
        if (text[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
      }
      if (start >= 0 && end > start) {
        return JSON.parse(repairJson(text.slice(start, end)));
      }
      throw e;
    }
  }
}

/**
 * Auto-link ticker symbols and company names to their stock pages.
 * Only links text outside of existing HTML tags.
 */
export function linkifyTickers(html: string): string {
  // Build lookup: sort by company name length (longest first) to avoid partial matches
  const entries = getAllTickersExpanded()
    .map(t => ({ ticker: t.ticker, company: t.company, slug: tickerToSlug(t.ticker) }))
    .sort((a, b) => b.company.length - a.company.length);

  let result = html;

  for (const { ticker, company, slug } of entries) {
    const href = `/stock/${slug}`;
    const linkClass = 'text-accent underline underline-offset-2 hover:text-accent/80';

    // Link company names (outside existing tags/links)
    const companyRegex = new RegExp(`(?<![<\\w/])(?<!href=")\\b(${company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b(?![^<]*>)`, 'g');
    result = result.replace(companyRegex, `<a href="${href}" class="${linkClass}">$1</a>`);

    // Link ticker symbols (uppercase, word boundary, not already inside a tag/link)
    // Avoid matching single-letter tickers that are common words (T, V, L)
    if (ticker.length >= 2) {
      const tickerRegex = new RegExp(`(?<![<\\w/=""])\\b(${ticker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b(?![^<]*>)`, 'g');
      result = result.replace(tickerRegex, `<a href="${href}" class="${linkClass}">$1</a>`);
    }
  }

  return result;
}

export function formatMarkdown(text: string): string {
  if (!text) return '';
  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>')
    .replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.*)$/, '<p>$1</p>');
  return linkifyTickers(html);
}
