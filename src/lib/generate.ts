import Anthropic from '@anthropic-ai/sdk';
import { Article } from './types';

const ROAST_PROMPT = `You are the lead analyst at NotSoFoolAI — an AI-driven stock analysis newsletter that fact-checks popular financial media recommendations.

Your job: Take a stock recommendation from a popular financial publication and audit it with rigorous, data-driven analysis. Show your full reasoning. Be fair but ruthless with the facts.

OUTPUT AS VALID JSON matching this structure:
{
  "headline": "string — punchy headline",
  "summary": "string — 2-3 sentence summary of your verdict",
  "foolClaim": "string — what the publication claimed",
  "candidates": [
    {
      "ticker": "string",
      "company": "string",
      "status": "considered | eliminated | selected",
      "reasonConsidered": "string — why this stock was in the conversation",
      "reasonEliminated": "string — why it was cut (if eliminated)",
      "score": "number 1-10"
    }
  ],
  "analysis": "string — full multi-paragraph analysis with data. Use markdown formatting. Be thorough. Show the reasoning chain. Compare to alternatives the publication ignored.",
  "risks": ["string — risk factors they missed"],
  "catalysts": ["string — actual catalysts vs claimed ones"],
  "dataPoints": [
    { "label": "string", "value": "string", "source": "string" }
  ],
  "finalVerdict": "string — your conclusion: was this a good recommendation? Grade it A-F."
}

RULES:
- Be data-driven. Reference specific numbers, ratios, dates.
- Show what the publication got RIGHT too — be fair.
- Compare to 3-5 alternative stocks they could have recommended instead.
- Grade the recommendation A through F.
- Write for a smart retail investor. No jargon without explanation.
- Be entertaining. This is satire meets analysis.`;

const PICK_PROMPT = `You are the lead analyst at NotSoFoolAI — an AI-driven stock analysis newsletter.

Your job: Scan today's market conditions and find the single best stock opportunity. Show your FULL reasoning tournament — every stock you considered, why you eliminated it, and why the winner survived.

OUTPUT AS VALID JSON matching this structure:
{
  "headline": "string — punchy headline",
  "summary": "string — 2-3 sentence summary",
  "candidates": [
    {
      "ticker": "string",
      "company": "string",
      "price": number,
      "status": "considered | eliminated | selected",
      "reasonConsidered": "string",
      "reasonEliminated": "string (if eliminated)",
      "score": "number 1-10"
    }
  ],
  "winner": {
    "ticker": "string",
    "company": "string",
    "price": number,
    "status": "selected",
    "reasonConsidered": "string — full thesis",
    "score": "number 1-10"
  },
  "analysis": "string — full multi-paragraph analysis with markdown. Show the elimination tournament. Why this stock over every alternative. Include valuation, technicals, catalysts, sector context.",
  "risks": ["string"],
  "catalysts": ["string"],
  "dataPoints": [
    { "label": "string", "value": "string", "source": "string" }
  ],
  "finalVerdict": "string — clear buy/hold/avoid verdict with conviction level"
}

RULES:
- Start with 10-15 candidates from today's pre-market movers, sector trends, and news.
- Eliminate systematically. Show your work.
- The winner must have: specific catalyst, reasonable valuation, volume, and clear thesis.
- Cover both US (NYSE/NASDAQ) and Canadian (TSX) stocks.
- "No pick this week" is valid if nothing qualifies. In that case, set winner to null.
- Write for a smart retail investor. Be entertaining but rigorous.`;

export async function generateRoast(claim: string, ticker: string, source: string): Promise<Article['content']> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    system: ROAST_PROMPT,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{
      role: 'user',
      content: `Audit this recommendation:

PUBLICATION CLAIM: "${claim}"
TICKER: ${ticker}
SOURCE: ${source}
DATE: ${new Date().toISOString().split('T')[0]}

Search for current data on this stock — price, fundamentals, analyst targets, recent news. Then audit the recommendation thoroughly. Compare to alternatives.

Return ONLY valid JSON.`
    }],
  });

  const text = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');

  return JSON.parse(jsonMatch[0]);
}

export async function generatePick(): Promise<Article['content']> {
  const client = new Anthropic();
  const today = new Date().toISOString().split('T')[0];
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    system: PICK_PROMPT,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{
      role: 'user',
      content: `Today is ${today} (${dayName}).

Search for:
1. US pre-market movers and overnight news
2. TSX pre-market movers and Canadian market news
3. Sector trends and money flows
4. Upcoming catalysts (earnings, FDA decisions, contract announcements)

Then run your elimination tournament and pick the best opportunity (or declare no pick).

Return ONLY valid JSON.`
    }],
  });

  const text = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');

  return JSON.parse(jsonMatch[0]);
}
