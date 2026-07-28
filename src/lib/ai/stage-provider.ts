import Anthropic from '@anthropic-ai/sdk';

export type AIStage = 'plan' | 'research' | 'writer' | 'verify';
export type StageProvider = 'openai' | 'anthropic' | 'openrouter';
export type EditorialExecutionMode = 'agent' | 'api';

export interface StageAIResponse {
  text: string;
  model: string;
  provider: StageProvider;
  inputTokens: number;
  outputTokens: number;
  sourceUrls: string[];
}

interface StageConfig {
  provider: StageProvider;
  model: string;
  apiKey: string;
}

const DEFAULTS: Record<AIStage, Pick<StageConfig, 'provider' | 'model'>> = {
  plan: { provider: 'openai', model: 'gpt-5.6-luna' },
  research: { provider: 'openai', model: 'gpt-5.6-terra' },
  writer: { provider: 'anthropic', model: 'claude-haiku-4-5-20251001' },
  verify: { provider: 'openai', model: 'gpt-5.6-sol' },
};

export function getEditorialExecutionMode(): EditorialExecutionMode {
  return process.env.EDITORIAL_EXECUTION_MODE === 'api' ? 'api' : 'agent';
}

function envPrefix(stage: AIStage): string {
  return `AI_${stage.toUpperCase()}`;
}

export function getStageConfig(stage: AIStage): StageConfig {
  const prefix = envPrefix(stage);
  const providerRaw = process.env[`${prefix}_PROVIDER`] || DEFAULTS[stage].provider;
  if (!['openai', 'anthropic', 'openrouter'].includes(providerRaw)) {
    throw new Error(`${prefix}_PROVIDER must be openai, anthropic, or openrouter`);
  }
  return {
    provider: providerRaw as StageProvider,
    model: process.env[`${prefix}_MODEL`] || DEFAULTS[stage].model,
    apiKey: process.env[`${prefix}_API_KEY`] || '',
  };
}

export function getStageReadiness() {
  const stages = (Object.keys(DEFAULTS) as AIStage[]);
  const configs = new Map(stages.map(stage => [stage, getStageConfig(stage)]));
  return stages.map(stage => {
    const config = configs.get(stage)!;
    const duplicateKey = config.apiKey
      ? stages.find(other => other !== stage && configs.get(other)?.apiKey === config.apiKey)
      : undefined;
    return {
      stage,
      provider: config.provider,
      model: config.model,
      configured: Boolean(config.apiKey),
      isolated: !duplicateKey,
      duplicateKeyWith: duplicateKey,
      webSearch: stage === 'research' && config.provider === 'openai',
    };
  });
}

export function assertEditorialStagesAreIsolated(): void {
  const stages = Object.keys(DEFAULTS) as AIStage[];
  const configs = stages.map(stage => ({ stage, config: getStageConfig(stage) }));
  for (let left = 0; left < configs.length; left++) {
    for (let right = left + 1; right < configs.length; right++) {
      const first = configs[left];
      const second = configs[right];
      if (first.config.apiKey && first.config.apiKey === second.config.apiKey) {
        throw new Error(`${first.stage} and ${second.stage} stages must use different API keys`);
      }
      if (first.config.model === second.config.model) {
        throw new Error(`${first.stage} and ${second.stage} stages must use different models`);
      }
    }
  }
}

function uniqueUrls(values: string[]): string[] {
  return [...new Set(values.filter(value => /^https?:\/\//i.test(value)))];
}

async function callOpenAI(
  config: StageConfig,
  system: string,
  user: string,
  maxTokens: number,
  webSearch: boolean,
): Promise<StageAIResponse> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      instructions: system,
      input: user,
      max_output_tokens: maxTokens,
      reasoning: { effort: webSearch ? 'high' : 'medium' },
      ...(webSearch ? { tools: [{ type: 'web_search' }] } : {}),
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI ${config.model} failed: ${data.error?.message || response.status}`);
  }

  const text = data.output_text || (data.output || [])
    .flatMap((item: { content?: { type?: string; text?: string }[] }) => item.content || [])
    .filter((item: { type?: string }) => item.type === 'output_text')
    .map((item: { text?: string }) => item.text || '')
    .join('');
  const annotationUrls = (data.output || [])
    .flatMap((item: { content?: { annotations?: { url?: string }[] }[] }) => item.content || [])
    .flatMap((item: { annotations?: { url?: string }[] }) => item.annotations || [])
    .map((annotation: { url?: string }) => annotation.url || '');
  const searchActionUrls = (data.output || [])
    .flatMap((item: { action?: { sources?: { url?: string }[]; url?: string } }) => [
      ...(item.action?.sources || []).map(source => source.url || ''),
      item.action?.url || '',
    ]);

  if (!text) throw new Error(`OpenAI ${config.model} returned no text`);
  return {
    text,
    model: config.model,
    provider: 'openai',
    inputTokens: data.usage?.input_tokens || 0,
    outputTokens: data.usage?.output_tokens || 0,
    sourceUrls: uniqueUrls([...annotationUrls, ...searchActionUrls]),
  };
}

async function callAnthropic(
  config: StageConfig,
  system: string,
  user: string,
  maxTokens: number,
): Promise<StageAIResponse> {
  const client = new Anthropic({ apiKey: config.apiKey });
  const response = await client.messages.create({
    model: config.model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  });
  const text = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');
  if (!text) throw new Error(`Anthropic ${config.model} returned no text`);
  return {
    text,
    model: config.model,
    provider: 'anthropic',
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    sourceUrls: [],
  };
}

async function callOpenRouter(
  config: StageConfig,
  system: string,
  user: string,
  maxTokens: number,
): Promise<StageAIResponse> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://bullorbs.com',
      'X-Title': 'BullOrBS Editorial',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`OpenRouter ${config.model} failed: ${data.error?.message || response.status}`);
  }
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error(`OpenRouter ${config.model} returned no text`);
  return {
    text,
    model: config.model,
    provider: 'openrouter',
    inputTokens: data.usage?.prompt_tokens || 0,
    outputTokens: data.usage?.completion_tokens || 0,
    sourceUrls: [],
  };
}

export async function callStageAI(
  stage: AIStage,
  system: string,
  user: string,
  options: { maxTokens?: number; requireWebSearch?: boolean } = {},
): Promise<StageAIResponse> {
  const config = getStageConfig(stage);
  if (!config.apiKey) {
    throw new Error(`${envPrefix(stage)}_API_KEY is not configured`);
  }
  const webSearch = Boolean(options.requireWebSearch);
  if (webSearch && config.provider !== 'openai') {
    throw new Error(`${envPrefix(stage)}_PROVIDER must be openai when web search is required`);
  }
  const maxTokens = options.maxTokens || 8000;
  if (config.provider === 'openai') {
    return callOpenAI(config, system, user, maxTokens, webSearch);
  }
  if (config.provider === 'anthropic') {
    return callAnthropic(config, system, user, maxTokens);
  }
  return callOpenRouter(config, system, user, maxTokens);
}

export function parseStageJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || text.match(/\{[\s\S]*\}/)?.[0];
  if (!candidate) throw new Error('AI response did not contain a JSON object');
  return JSON.parse(candidate) as T;
}
