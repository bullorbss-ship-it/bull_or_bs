/**
 * Multi-provider AI adapter.
 * Supports: Anthropic (Haiku), OpenRouter (free models).
 * Provider selection: ANTHROPIC_API_KEY → Haiku (primary), else OPENROUTER_API_KEY → free models.
 */

import Anthropic from '@anthropic-ai/sdk';

export interface AIResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  provider: 'anthropic' | 'openrouter';
  costUsd: number;
}

// OpenRouter free models — ordered by quality for our JSON generation use case
const OPENROUTER_FREE_MODELS = [
  'google/gemini-2.0-flash-exp:free',         // Best quality, 1M context
  'meta-llama/llama-3.3-70b-instruct:free',   // GPT-4 level
  'deepseek/deepseek-r1-0528:free',           // Strong reasoning
  'qwen/qwen3-32b:free',                      // Good for structured output
];

function getProvider(): 'openrouter' | 'anthropic' {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.OPENROUTER_API_KEY) return 'openrouter';
  return 'anthropic';
}

export function getActiveProvider(): string {
  const provider = getProvider();
  if (provider === 'openrouter') return 'openrouter (free)';
  return 'anthropic (haiku)';
}

async function callOpenRouter(
  system: string,
  userMessage: string,
  maxTokens: number,
): Promise<AIResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');

  // Try models in order — fall to next on failure
  for (const model of OPENROUTER_FREE_MODELS) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://bullorbs.com',
          'X-Title': 'BullOrBS',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: userMessage },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.log(`[OpenRouter] ${model} failed (${res.status}): ${err.slice(0, 100)}`);
        continue; // try next model
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        console.log(`[OpenRouter] ${model} returned empty response`);
        continue;
      }

      const usage = data.usage || {};
      return {
        text,
        inputTokens: usage.prompt_tokens || 0,
        outputTokens: usage.completion_tokens || 0,
        model,
        provider: 'openrouter',
        costUsd: 0, // free tier
      };
    } catch (err) {
      console.log(`[OpenRouter] ${model} error:`, err instanceof Error ? err.message : err);
      continue;
    }
  }

  throw new Error('All OpenRouter free models failed');
}

async function callAnthropic(
  system: string,
  userMessage: string,
  maxTokens: number,
  images?: string[],
): Promise<AIResponse> {
  const model = 'claude-haiku-4-5-20251001';
  const client = new Anthropic();

  // Build content blocks — images first, then text
  const content: Anthropic.MessageCreateParams['messages'][0]['content'] = [];
  if (images && images.length > 0) {
    for (const img of images) {
      // Detect media type from base64 header or default to jpeg
      let mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' = 'image/jpeg';
      let data = img;
      if (img.startsWith('data:')) {
        const match = img.match(/^data:(image\/\w+);base64,/);
        if (match) {
          mediaType = match[1] as typeof mediaType;
          data = img.replace(/^data:image\/\w+;base64,/, '');
        }
      }
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data },
      });
    }
  }
  content.push({ type: 'text', text: userMessage });

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content }],
  });

  const text = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');

  const { input_tokens, output_tokens } = response.usage;

  // Haiku pricing
  const inputCost = (input_tokens / 1_000_000) * 0.80;
  const outputCost = (output_tokens / 1_000_000) * 4.00;

  return {
    text,
    inputTokens: input_tokens,
    outputTokens: output_tokens,
    model,
    provider: 'anthropic',
    costUsd: Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000,
  };
}

/**
 * Call the active AI provider. Auto-selects based on env vars:
 * OPENROUTER_API_KEY → OpenRouter (free), else ANTHROPIC_API_KEY → Haiku.
 */
export async function callAI(
  system: string,
  userMessage: string,
  maxTokens = 8000,
  images?: string[],
): Promise<AIResponse> {
  const provider = getProvider();

  // Vision requires Anthropic — skip OpenRouter for image requests
  if (images && images.length > 0) {
    return await callAnthropic(system, userMessage, maxTokens, images);
  }

  if (provider === 'openrouter') {
    try {
      return await callOpenRouter(system, userMessage, maxTokens);
    } catch (err) {
      // Fallback to Anthropic if OpenRouter fails entirely
      if (process.env.ANTHROPIC_API_KEY) {
        console.log(`[Provider] OpenRouter failed, falling back to Anthropic: ${err instanceof Error ? err.message : err}`);
        return await callAnthropic(system, userMessage, maxTokens);
      }
      throw err;
    }
  }

  return await callAnthropic(system, userMessage, maxTokens);
}
