import { callAI } from './ai/providers';
import { Article } from './types';
import { siteConfig } from '@/config/site';

export interface SocialCopy {
  reddit: { title: string; body: string; subreddits: string[] };
  twitter: string;
  instagram: string;
  articleUrl: string;
}

const SOCIAL_PROMPT = `You are a social media writer for a stock analysis site. Your audience is younger investors (20s-30s) who are tired of clickbait financial advice.

Your voice:
- Talk like a smart friend who happens to know finance, NOT a finance bro
- Plain English, zero jargon. Say "how much profit per share" not "EPS"
- Short, punchy, conversational. Like texting, not writing an essay
- Analytical but accessible — show you did the work without being boring
- Slightly skeptical/witty tone (you fact-check the "experts")
- NEVER use emojis, hashtags, or "thread" formatting
- NEVER say "NFA" or "not financial advice" in the social posts

Output ONLY valid JSON with this exact structure:
{
  "reddit": {
    "title": "A compelling Reddit post title (no clickbait, genuine curiosity hook)",
    "body": "2-3 short paragraphs. Lead with the interesting finding. Include 2-3 key data points from the article. End with a question that invites discussion. Include the article link naturally.",
    "subreddits": ["list", "of", "relevant", "subreddits"]
  },
  "twitter": "A single tweet. Max 280 chars. Lead with the hook. Include the article link placeholder [LINK]. Use $TICKER cashtags.",
  "instagram": "A caption for an Instagram carousel. 2-3 short paragraphs. Conversational. End with a soft CTA like 'link in bio' or 'full breakdown on the site'."
}`;

export async function generateSocialCopy(article: Article): Promise<SocialCopy> {
  const articleUrl = `${siteConfig.url}/article/${article.slug}`;

  const userMessage = `Generate social media posts for this article:

TITLE: ${article.title}
TYPE: ${article.type === 'roast' ? 'Fact-check/roast of a stock recommendation' : 'AI stock comparison/pick'}
TICKER: ${article.ticker || 'Multiple'}
VERDICT: ${article.verdict}
SUMMARY: ${article.description}
DATE: ${article.date}
ARTICLE URL: ${articleUrl}

Key data points:
${(article.content.dataPoints || []).slice(0, 6).map(dp => `- ${dp.label}: ${dp.value}`).join('\n')}

Candidates analyzed:
${(article.content.candidates || []).slice(0, 5).map(c => `- ${c.ticker}: ${c.company || ''}`).join('\n')}

Winner: ${article.content.winner?.ticker || 'N/A'} — ${article.content.winner?.company || ''}

Relevant subreddits to consider: r/CanadianInvestor, r/PersonalFinanceCanada, r/stocks, r/investing, r/dividends, r/wallstreetbets

Return ONLY valid JSON.`;

  const response = await callAI(SOCIAL_PROMPT, userMessage, 2000);

  try {
    const text = response.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(text);

    // Replace [LINK] placeholder in twitter
    if (parsed.twitter) {
      parsed.twitter = parsed.twitter.replace('[LINK]', articleUrl);
    }

    // Add article URL to reddit body if not present
    if (parsed.reddit?.body && !parsed.reddit.body.includes(articleUrl)) {
      parsed.reddit.body += `\n\nFull analysis: ${articleUrl}`;
    }

    return {
      reddit: parsed.reddit || { title: article.title, body: article.description, subreddits: ['stocks'] },
      twitter: parsed.twitter || `${article.title} ${articleUrl}`,
      instagram: parsed.instagram || article.description,
      articleUrl,
    };
  } catch {
    // Fallback if Haiku returns bad JSON
    return {
      reddit: {
        title: article.title,
        body: `${article.description}\n\nFull analysis: ${articleUrl}`,
        subreddits: ['CanadianInvestor', 'stocks'],
      },
      twitter: `${article.title.slice(0, 250)} ${articleUrl}`,
      instagram: article.description,
      articleUrl,
    };
  }
}
