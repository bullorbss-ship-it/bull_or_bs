import Anthropic from '@anthropic-ai/sdk';
import { ArticleContent } from '@/lib/types';
import { ROAST_PROMPT, PICK_PROMPT } from './prompts';
import { extractText, parseArticleContent } from './parse';
import { auditAndScrub } from './legal';
import { resolveStockData, resolveMarketMovers } from '@/lib/fmp';
import { calculateCost, logCost } from '@/lib/costs';

const MODEL = 'claude-haiku-4-5-20251001';

export interface GenerateResult {
  content: ArticleContent;
  costUsd: number;
  inputTokens: number;
  outputTokens: number;
  apiCalls: number;
  durationMs: number;
  dataConfidence: string;
}

export async function generateRoast(
  claim: string,
  ticker: string,
  source: string
): Promise<GenerateResult> {
  const start = Date.now();

  // 1. Resolve market data with confidence tagging
  const stockData = await resolveStockData(ticker);

  // 2. Call Haiku with tagged data — NO web search
  const client = new Anthropic();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: ROAST_PROMPT,
    messages: [{
      role: 'user',
      content: `Audit this recommendation:

PUBLICATION CLAIM: "${claim}"
TICKER: ${ticker}
SOURCE: ${source}
DATE: ${new Date().toISOString().split('T')[0]}

=== MARKET DATA ===
${stockData.context}

Audit the recommendation thoroughly using the data above (respecting confidence tags). Compare to alternatives.

Return ONLY valid JSON.`,
    }],
  });

  const durationMs = Date.now() - start;
  const { input_tokens, output_tokens } = response.usage;
  const costUsd = calculateCost(MODEL, input_tokens, output_tokens);

  logCost({
    date: new Date().toISOString().split('T')[0],
    type: 'roast',
    ticker,
    model: MODEL,
    inputTokens: input_tokens,
    outputTokens: output_tokens,
    costUsd,
    fmpCalls: stockData.apiCalls,
    durationMs,
  });

  const text = extractText(response);
  const rawContent = parseArticleContent(text);

  // Legal audit: scrub competitor names from headlines/summaries/verdicts
  const { content, audit } = auditAndScrub(rawContent);
  if (audit.violations.length > 0) {
    console.log(`[LEGAL AUDIT] Roast ${ticker}: scrubbed ${audit.violations.length} violations:`, audit.violations);
  }

  return {
    content,
    costUsd,
    inputTokens: input_tokens,
    outputTokens: output_tokens,
    apiCalls: stockData.apiCalls,
    durationMs,
    dataConfidence: stockData.confidence,
  };
}

export async function generatePick(topic?: string): Promise<GenerateResult> {
  const start = Date.now();

  // 1. Fetch market movers with confidence tagging
  const moversData = await resolveMarketMovers();

  const today = new Date().toISOString().split('T')[0];
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // 2. Build user message — inject topic constraint if provided
  const topicInstruction = topic
    ? `\n\nTOPIC FOCUS: "${topic}"
You MUST focus your tournament exclusively on stocks related to this topic. Select 10-15 candidates that fit this theme using your training knowledge + any relevant market data above.
Do NOT pick stocks outside this theme.
IMPORTANT: When a specific topic is provided, you ARE allowed to use your training knowledge to identify and analyze companies in this sector even if real-time market data is unavailable. Use qualitative analysis (business model, competitive position, sector trends, management quality) as your primary framework. For any specific numbers (price, P/E, market cap), say "approximately" or "as of last available data" — never state them as current verified facts. Do NOT refuse to pick just because real-time data is unavailable.`
    : '';

  // 3. Call Haiku with tagged data — NO web search
  const client = new Anthropic();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: PICK_PROMPT,
    messages: [{
      role: 'user',
      content: `Today is ${today} (${dayName}).

=== MARKET DATA ===
${moversData.context}
${topicInstruction}

Run your elimination tournament${topic ? ` focused on: "${topic}". Use your knowledge of this sector to identify candidates even if real-time data is limited` : ' using the data above'} (respecting confidence tags where available) and pick the best opportunity (or declare no pick only if you truly cannot evaluate any candidates).

Return ONLY valid JSON.`,
    }],
  });

  const durationMs = Date.now() - start;
  const { input_tokens, output_tokens } = response.usage;
  const costUsd = calculateCost(MODEL, input_tokens, output_tokens);

  logCost({
    date: today,
    type: 'pick',
    model: MODEL,
    inputTokens: input_tokens,
    outputTokens: output_tokens,
    costUsd,
    fmpCalls: moversData.apiCalls,
    durationMs,
  });

  const text = extractText(response);
  const rawContent = parseArticleContent(text);

  // Legal audit: scrub competitor names from headlines/summaries/verdicts
  const { content, audit } = auditAndScrub(rawContent);
  if (audit.violations.length > 0) {
    console.log(`[LEGAL AUDIT] Pick: scrubbed ${audit.violations.length} violations:`, audit.violations);
  }

  return {
    content,
    costUsd,
    inputTokens: input_tokens,
    outputTokens: output_tokens,
    apiCalls: moversData.apiCalls,
    durationMs,
    dataConfidence: moversData.confidence,
  };
}
