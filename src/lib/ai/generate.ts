import { ArticleContent } from '@/lib/types';
import { ROAST_PROMPT, PICK_PROMPT, SCREENSHOT_ROAST_PROMPT, SCREENSHOT_PICK_PROMPT } from './prompts';
import { parseArticleContent } from './parse';
import { auditAndScrub } from './legal';
import { resolveStockData, resolveMarketMovers } from '@/lib/fmp';
import { logCost } from '@/lib/costs';
import { callAI } from './providers';
import { buildTickerReferenceSheet, getTickerProfile } from './ticker-profiles';
import { refreshProfile, ProfileChange } from './refresh-profile';

export interface ProfileWarning {
  ticker: string;
  changes: ProfileChange[];
}

export interface GenerateResult {
  content: ArticleContent;
  costUsd: number;
  inputTokens: number;
  outputTokens: number;
  apiCalls: number;
  durationMs: number;
  dataConfidence: string;
  model: string;
  provider: string;
  profileWarnings: ProfileWarning[];
}

export async function generateRoast(
  claim: string,
  ticker: string,
  source: string
): Promise<GenerateResult> {
  const start = Date.now();

  // 1. Refresh profile via Gemini web search (free, ~2s)
  const profileWarnings: ProfileWarning[] = [];
  try {
    const refresh = await refreshProfile(ticker, true);
    if (refresh.changes.length > 0) {
      profileWarnings.push({ ticker, changes: refresh.changes });
      console.log(`[Generate] Refreshed ${ticker}: ${refresh.changes.length} profile updates`);
    }
  } catch (err) {
    console.log(`[Generate] Profile refresh failed for ${ticker}, continuing with local data`);
  }

  // 2. Resolve market data with confidence tagging
  const stockData = await resolveStockData(ticker);

  // 3. Inject ticker profile so model can't hallucinate identity
  const tickerProfile = getTickerProfile(ticker) || '';
  const referenceSheet = buildTickerReferenceSheet();

  // 4. Call AI provider (OpenRouter free → Anthropic fallback)
  const userMessage = `Audit this recommendation:

PUBLICATION CLAIM: "${claim}"
TICKER: ${ticker}
SOURCE: ${source}
DATE: ${new Date().toISOString().split('T')[0]}

=== MARKET DATA ===
${stockData.context}

${tickerProfile ? `=== TICKER PROFILE (verified) ===\n${tickerProfile}\n` : ''}
${referenceSheet ? `=== ALL KNOWN TICKERS ===\n${referenceSheet}\n` : ''}
Audit the recommendation thoroughly using the data above (respecting confidence tags). Compare to alternatives. When referencing any ticker, use the identity from the reference sheet above — do NOT guess what a ticker represents.

Return ONLY valid JSON.`;

  const response = await callAI(ROAST_PROMPT, userMessage);

  const durationMs = Date.now() - start;

  logCost({
    date: new Date().toISOString().split('T')[0],
    type: 'roast',
    ticker,
    model: response.model,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    costUsd: response.costUsd,
    fmpCalls: stockData.apiCalls,
    durationMs,
  });

  const rawContent = parseArticleContent(response.text);

  // Legal audit: scrub competitor names from headlines/summaries/verdicts
  const { content, audit } = auditAndScrub(rawContent);
  if (audit.violations.length > 0) {
    console.log(`[LEGAL AUDIT] Roast ${ticker}: scrubbed ${audit.violations.length} violations:`, audit.violations);
  }

  return {
    content,
    costUsd: response.costUsd,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    apiCalls: stockData.apiCalls,
    durationMs,
    dataConfidence: stockData.confidence,
    model: response.model,
    provider: response.provider,
    profileWarnings,
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

  // 3. Inject ticker reference sheet so model can't hallucinate identities
  const referenceSheet = buildTickerReferenceSheet();

  // 4. Call AI provider (OpenRouter free → Anthropic fallback)
  const userMessage = `Today is ${today} (${dayName}).

=== MARKET DATA ===
${moversData.context}

${referenceSheet ? `${referenceSheet}\n` : ''}
${topicInstruction}

Run your elimination tournament${topic ? ` focused on: "${topic}". Use your knowledge of this sector to identify candidates even if real-time data is limited` : ' using the data above'} (respecting confidence tags where available) and pick the best opportunity (or declare no pick only if you truly cannot evaluate any candidates).

CRITICAL: When discussing any ticker from the reference sheet above, you MUST use the correct identity. For example, if the sheet says "PSA.TO — Purpose High Interest Savings ETF", do NOT call it a bond fund. If you reference a ticker NOT in the sheet, clearly state you are using training knowledge.

Return ONLY valid JSON.`;

  const response = await callAI(PICK_PROMPT, userMessage);

  const durationMs = Date.now() - start;

  logCost({
    date: today,
    type: 'pick',
    model: response.model,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    costUsd: response.costUsd,
    fmpCalls: moversData.apiCalls,
    durationMs,
  });

  const rawContent = parseArticleContent(response.text);

  // Legal audit: scrub competitor names from headlines/summaries/verdicts
  const { content, audit } = auditAndScrub(rawContent);
  if (audit.violations.length > 0) {
    console.log(`[LEGAL AUDIT] Pick: scrubbed ${audit.violations.length} violations:`, audit.violations);
  }

  // Post-generation: refresh winner + candidates to flag stale profile data
  const profileWarnings: ProfileWarning[] = [];
  try {
    const tickers = (content.candidates || [])
      .map((c: { ticker?: string }) => c.ticker?.replace('.TO', '').replace('.', '-'))
      .filter(Boolean) as string[];
    const unique = Array.from(new Set(tickers)).slice(0, 20);
    if (unique.length > 0) {
      console.log(`[Generate] Post-pick refresh: checking ${unique.length} candidate profiles...`);
      for (const t of unique) {
        const refresh = await refreshProfile(t, true);
        if (refresh.changes.length > 0) {
          profileWarnings.push({ ticker: t, changes: refresh.changes });
          console.log(`[Generate] ⚠ ${t}: ${refresh.changes.map(c => `${c.field}: "${c.oldValue}" → "${c.newValue}"`).join(', ')}`);
        }
      }
    }
  } catch (err) {
    console.log(`[Generate] Post-pick refresh failed, article still valid`);
  }

  return {
    content,
    costUsd: response.costUsd,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    apiCalls: moversData.apiCalls,
    durationMs,
    dataConfidence: moversData.confidence,
    model: response.model,
    provider: response.provider,
    profileWarnings,
  };
}

// ─── Screenshot-based generation ──────────────────────────────────────────────

export async function generateScreenshotRoast(
  media: string[],
  source?: string,
  textData?: string,
): Promise<GenerateResult> {
  const start = Date.now();
  const today = new Date().toISOString().split('T')[0];

  const referenceSheet = buildTickerReferenceSheet();

  const textDataBlock = textData
    ? `\n=== PASTED DATA (treat as ground truth) ===\n${textData}\n`
    : '';

  const userMessage = `Analyze the provided data about this financial article/recommendation.

SOURCE: ${source || 'Financial publication (extract from provided data)'}
DATE: ${today}

${referenceSheet ? `=== KNOWN TICKERS (for identity verification) ===\n${referenceSheet}\n` : ''}
${textDataBlock}
Extract ALL data from the screenshots/documents/pasted text. Roast the methodology and framing — the numbers provided are your ground truth.

Return ONLY valid JSON.`;

  const response = await callAI(SCREENSHOT_ROAST_PROMPT, userMessage, 8000, media.length > 0 ? media : undefined);

  const durationMs = Date.now() - start;

  logCost({
    date: today,
    type: 'screenshot-roast',
    model: response.model,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    costUsd: response.costUsd,
    fmpCalls: 0,
    durationMs,
  });

  const rawContent = parseArticleContent(response.text);

  const { content, audit } = auditAndScrub(rawContent);
  if (audit.violations.length > 0) {
    console.log(`[LEGAL AUDIT] Screenshot roast: scrubbed ${audit.violations.length} violations:`, audit.violations);
  }

  return {
    content,
    costUsd: response.costUsd,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    apiCalls: 0,
    durationMs,
    dataConfidence: 'screenshot',
    model: response.model,
    provider: response.provider,
    profileWarnings: [],
  };
}

export async function generateScreenshotPick(
  media: string[],
  topic?: string,
  textData?: string,
): Promise<GenerateResult> {
  const start = Date.now();
  const today = new Date().toISOString().split('T')[0];

  const referenceSheet = buildTickerReferenceSheet();

  const topicLine = topic ? `\nTOPIC CONTEXT: "${topic}"\n` : '';

  const textDataBlock = textData
    ? `\n=== PASTED DATA (treat as ground truth) ===\n${textData}\n`
    : '';

  const inputCount = media.length + (textData ? 1 : 0);

  const userMessage = `Compare the stocks from the provided data (${inputCount} source${inputCount !== 1 ? 's' : ''}).

DATE: ${today}
${topicLine}
${referenceSheet ? `=== KNOWN TICKERS (for identity verification) ===\n${referenceSheet}\n` : ''}
${textDataBlock}
Extract ALL data from screenshots/documents/pasted text. Compare ONLY these stocks — do NOT add stocks that aren't shown.
Include a comparison table in your analysis.

Return ONLY valid JSON.`;

  const response = await callAI(SCREENSHOT_PICK_PROMPT, userMessage, 8000, media.length > 0 ? media : undefined);

  const durationMs = Date.now() - start;

  logCost({
    date: today,
    type: 'screenshot-pick',
    model: response.model,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    costUsd: response.costUsd,
    fmpCalls: 0,
    durationMs,
  });

  const rawContent = parseArticleContent(response.text);

  const { content, audit } = auditAndScrub(rawContent);
  if (audit.violations.length > 0) {
    console.log(`[LEGAL AUDIT] Screenshot pick: scrubbed ${audit.violations.length} violations:`, audit.violations);
  }

  return {
    content,
    costUsd: response.costUsd,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    apiCalls: 0,
    durationMs,
    dataConfidence: 'screenshot',
    model: response.model,
    provider: response.provider,
    profileWarnings: [],
  };
}
