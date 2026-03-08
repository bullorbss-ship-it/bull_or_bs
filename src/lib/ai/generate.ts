import Anthropic from '@anthropic-ai/sdk';
import { ArticleContent } from '@/lib/types';
import { ROAST_PROMPT, PICK_PROMPT } from './prompts';
import { extractText, parseArticleContent } from './parse';

export async function generateRoast(
  claim: string,
  ticker: string,
  source: string
): Promise<ArticleContent> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
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

Return ONLY valid JSON.`,
    }],
  });

  const text = extractText(response);
  return parseArticleContent(text);
}

export async function generatePick(): Promise<ArticleContent> {
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

Return ONLY valid JSON.`,
    }],
  });

  const text = extractText(response);
  return parseArticleContent(text);
}
