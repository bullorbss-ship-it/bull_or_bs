import Anthropic from '@anthropic-ai/sdk';
import { ArticleContent } from '@/lib/types';
import { ROAST_PROMPT, PICK_PROMPT } from './prompts';
import { extractText, parseArticleContent } from './parse';
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
  const content = parseArticleContent(text);

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

export async function generatePick(): Promise<GenerateResult> {
  const start = Date.now();

  // 1. Fetch market movers with confidence tagging
  const moversData = await resolveMarketMovers();

  const today = new Date().toISOString().split('T')[0];
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // 2. Call Haiku with tagged data — NO web search
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

Run your elimination tournament using the data above (respecting confidence tags) and pick the best opportunity (or declare no pick).

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
  const content = parseArticleContent(text);

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
