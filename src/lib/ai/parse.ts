import { ArticleContent } from '@/lib/types';
import { tickerToSlug } from '@/lib/tickers';
import { getAllTickersExpanded } from '@/lib/ticker-registry';

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
export function linkifyTickers(html: string, tickerHints?: string[]): string {
  const allTickers = getAllTickersExpanded();

  // If hints provided, only link those tickers (much faster for large articles)
  const entries = (tickerHints && tickerHints.length > 0
    ? allTickers.filter(t => tickerHints.some(h => h.toUpperCase() === t.ticker.toUpperCase()))
    : allTickers.slice(0, 20) // fallback: limit to first 20 to avoid perf issues
  )
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
    if (ticker.length >= 2) {
      const tickerRegex = new RegExp(`(?<![<\\w/=""])\\b(${ticker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b(?![^<]*>)`, 'g');
      result = result.replace(tickerRegex, `<a href="${href}" class="${linkClass}">$1</a>`);
    }
  }

  return result;
}

export function formatMarkdown(text: string, tickerHints?: string[]): string {
  if (!text) return '';

  const lines = text.split('\n');
  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Horizontal rule
    if (/^-{3,}$/.test(line.trim()) || /^\*{3,}$/.test(line.trim())) {
      blocks.push('<hr class="my-6 border-card-border">');
      i++;
      continue;
    }

    // Table: detect header row with pipes
    if (line.includes('|') && i + 1 < lines.length && /^[\s|:-]+$/.test(lines[i + 1])) {
      const tableLines: string[] = [line];
      i++; // skip separator
      i++;
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push(buildTable(tableLines));
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      blocks.push(`<h3 class="text-base font-mono font-bold text-foreground mt-6 mb-2">${inlineFormat(line.slice(4))}</h3>`);
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(`<h2 class="text-lg font-mono font-bold text-foreground mt-8 mb-3">${inlineFormat(line.slice(3))}</h2>`);
      i++;
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
        // Collect continuation lines (indented or non-empty, not a new list item/heading/table)
        while (i < lines.length && lines[i].trim() !== '' && !/^\d+\.\s/.test(lines[i].trim()) && !lines[i].startsWith('#') && !lines[i].includes('|')) {
          items[items.length - 1] += ' ' + lines[i].trim();
          i++;
        }
        // Skip blank lines between items
        while (i < lines.length && lines[i].trim() === '') i++;
      }
      blocks.push('<ol class="list-decimal list-outside ml-6 my-4 space-y-3 text-muted">' +
        items.map(item => `<li class="pl-1 leading-relaxed">${inlineFormat(item)}</li>`).join('') +
        '</ol>');
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s/, ''));
        i++;
      }
      blocks.push('<ul class="list-disc list-outside ml-6 my-4 space-y-2 text-muted">' +
        items.map(item => `<li class="pl-1 leading-relaxed">${inlineFormat(item)}</li>`).join('') +
        '</ul>');
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph: collect consecutive non-empty, non-special lines
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('#') && !/^\d+\.\s/.test(lines[i].trim()) && !/^[-*]\s/.test(lines[i].trim()) && !(lines[i].includes('|') && i + 1 < lines.length && lines[i + 1] && /^[\s|:-]+$/.test(lines[i + 1]))) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(`<p class="text-muted leading-relaxed mb-4">${inlineFormat(paraLines.join(' '))}</p>`);
    }
  }

  return linkifyTickers(blocks.join('\n'), tickerHints);
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

function buildTable(rows: string[]): string {
  const parseRow = (row: string) =>
    row.split('|').map(c => c.trim()).filter(c => c !== '');

  const header = parseRow(rows[0]);
  const bodyRows = rows.slice(1).map(parseRow);

  const thCells = header.map((h, i) =>
    `<th class="px-3 py-2.5 text-left text-xs font-mono font-bold uppercase tracking-wider ${i === 0 ? 'text-foreground' : 'text-accent'}">${inlineFormat(h)}</th>`
  ).join('');

  const bodyHtml = bodyRows.map((cells, rowIdx) => {
    const rowClass = rowIdx % 2 === 0 ? 'bg-card-bg' : '';
    const tdCells = cells.map((c, i) =>
      `<td class="px-3 py-2.5 text-sm ${i === 0 ? 'font-medium text-foreground' : 'text-muted'}">${inlineFormat(c)}</td>`
    ).join('');
    return `<tr class="${rowClass}">${tdCells}</tr>`;
  }).join('');

  return `<div class="my-6 overflow-x-auto rounded-xl border border-card-border">
    <table class="w-full border-collapse">
      <thead><tr class="border-b border-card-border bg-accent/5">${thCells}</tr></thead>
      <tbody class="divide-y divide-card-border">${bodyHtml}</tbody>
    </table>
  </div>`;
}
