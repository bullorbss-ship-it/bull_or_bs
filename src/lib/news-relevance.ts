import Anthropic from '@anthropic-ai/sdk';

/**
 * Lightweight Haiku gate that rejects stories that aren't finance-,
 * markets-, AI/tech-business-, or geopolitics-relevant.
 *
 * Filters out the class of noise that slips through broader RSS feeds:
 * celebrity lawsuits, political theatre, sports, entertainment.
 *
 * Cost: ~$0.0005 per call. We call it on up to ~5 candidates per slot,
 * so adds ~$0.01/day max across the whole briefing.
 */

const SYSTEM = `You filter news for a finance/investing site that covers stocks, markets, AI/tech business, and geopolitics-that-moves-markets.

For each headline, decide: is this primarily about any of:
- Financial markets, stocks, earnings, M&A, IPOs, central banks, monetary/fiscal policy, macro
- AI or tech companies' strategy, funding, regulation, product launches, infrastructure (NOT: game reviews, consumer gadget unboxings, app tutorials)
- War, sanctions, trade conflict, energy/commodity-moving geopolitics
- Canadian markets or TSX-listed companies

REJECT (answer "no"): celebrity gossip, entertainment industry drama unless it drives a stock move, pure political theatre / social-media antics, sports, local crime, human-interest features, lifestyle.

Respond with EXACTLY one word: yes or no. No punctuation, no explanation.`;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

export async function classifyRelevance(
  headline: string,
  description = '',
): Promise<boolean> {
  const input = `HEADLINE: ${headline}\n\n${description ? `LEAD: ${description.slice(0, 400)}` : ''}`.trim();
  try {
    const res = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4,
      system: SYSTEM,
      messages: [{ role: 'user', content: input }],
    });
    const text = res.content[0].type === 'text' ? res.content[0].text.trim().toLowerCase() : '';
    return text.startsWith('yes');
  } catch {
    // Fail open rather than rejecting everything on a transient error.
    return true;
  }
}
