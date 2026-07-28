import { assertEditorialStagesAreIsolated, callStageAI, parseStageJson } from './ai/stage-provider';
import { nowEST } from './date';
import { validateEditorialDraft } from './quality';
import type {
  Article,
  EditorialDraft,
  EditorialPlan,
  EditorialPlanItem,
  ResearchPacket,
  ResearchSource,
  VerificationResult,
} from './types';

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 72);
}

function validSource(source: ResearchSource): boolean {
  try {
    const url = new URL(source.url);
    return Boolean(
      source.title &&
      source.publisher &&
      source.claims?.length &&
      (url.protocol === 'https:' || url.protocol === 'http:'),
    );
  } catch {
    return false;
  }
}

function sourceKey(value: string): string {
  try {
    const url = new URL(value);
    return `${url.hostname.replace(/^www\./, '').toLowerCase()}${url.pathname.replace(/\/$/, '').toLowerCase()}`;
  } catch {
    return '';
  }
}

export async function researchPlanItem(item: EditorialPlanItem): Promise<ResearchPacket> {
  const system = `You are the evidence-gathering researcher for Bull Or BS.
Use web search extensively. Prefer company filings, regulator documents, ETF-provider documents, tax-agency pages, and official data. Use reputable reporting only for context.
Do not write the article. Produce a neutral research packet, record uncertainty, and return only valid JSON.`;
  const user = `Research this approved assignment as of ${nowEST()}:
${JSON.stringify(item, null, 2)}

For comparisons, research every candidate on the same dimensions. Every number and material claim needs a source.
Return:
{
  "summary": "neutral research summary",
  "comparisonDimensions": [
    {
      "label": "decision-relevant dimension",
      "values": {"candidate": "sourced value"},
      "interpretation": "plain-English significance without giving advice",
      "sourceIds": [1]
    }
  ],
  "keyFindings": ["specific finding"],
  "uncertainties": ["missing, stale, estimated, or conflicting fact"],
  "sources": [
    {
      "id": 1,
      "title": "page/document title",
      "publisher": "publisher",
      "url": "full canonical URL",
      "publishedAt": "YYYY-MM-DD if known",
      "sourceType": "primary | secondary",
      "claims": ["facts this source supports"]
    }
  ]
}

Requirements: at least 5 sources, at least 2 primary sources, at least 4 comparison dimensions, no unsupported figures.`;
  const response = await callStageAI('research', system, user, {
    maxTokens: 10000,
    requireWebSearch: true,
  });
  const raw = parseStageJson<Omit<ResearchPacket, 'id' | 'planItemId' | 'researchedAt' | 'model'>>(response.text);
  const groundedUrls = new Set(response.sourceUrls.map(sourceKey).filter(Boolean));
  const sources = Array.isArray(raw.sources)
    ? raw.sources.filter(validSource).filter(source => groundedUrls.has(sourceKey(source.url)))
    : [];
  if (sources.length < 5 || sources.filter(source => source.sourceType === 'primary').length < 2) {
    throw new Error('Deep research did not return five web-grounded sources including two primary sources');
  }
  if (!Array.isArray(raw.comparisonDimensions) || raw.comparisonDimensions.length < 4) {
    throw new Error('Deep research did not return four comparison dimensions');
  }
  return {
    id: `research-${item.id}`,
    planItemId: item.id,
    researchedAt: nowEST(),
    model: response.model,
    summary: String(raw.summary || ''),
    comparisonDimensions: raw.comparisonDimensions,
    keyFindings: Array.isArray(raw.keyFindings) ? raw.keyFindings.map(String) : [],
    uncertainties: Array.isArray(raw.uncertainties) ? raw.uncertainties.map(String) : [],
    sources,
  };
}

async function writeArticle(
  item: EditorialPlanItem,
  research: ResearchPacket,
): Promise<{ article: Article; model: string }> {
  const system = `You are the writer for Bull Or BS, an evidence-first publication for Canadian self-directed investors.
Use only the supplied research packet. Never invent or silently update a fact. Cite material claims with [N] markers matching the packet source IDs.
Write a useful decision page, not generic market commentary. Return only valid JSON.`;
  const user = `Write the approved assignment:
${JSON.stringify(item, null, 2)}

Research packet:
${JSON.stringify(research, null, 2)}

Return:
{
  "title": "accurate title under 90 characters",
  "description": "specific 140-160 character search description",
  "ticker": "primary ticker or omit",
  "verdict": "one-line balanced conclusion",
  "content": {
    "headline": "on-page headline",
    "summary": "direct 2-3 sentence answer",
    "candidates": [{"ticker":"symbol","company":"name","status":"considered|eliminated|selected","reasonConsidered":"sourced reason","reasonEliminated":"optional","score":"number from 3-10"}],
    "winner": {"ticker":"symbol","company":"name","status":"selected","reasonConsidered":"sourced reason","score":"number from 3-10"},
    "analysis": "900-1400 words in markdown. Include ## Quick answer, ## Head-to-head, a markdown comparison table, ## What the numbers miss, ## Who each option fits, and ## Bottom line.",
    "risks": ["sourced limitation"],
    "catalysts": ["sourced positive factor"],
    "dataPoints": [{"label":"metric","value":"value","source":"publisher","sourceUrl":"exact research URL"}],
    "finalVerdict": "balanced 100-180 word decision framework, not financial advice",
    "references": [{"id":1,"source":"publisher — document title","url":"exact research URL"}]
  }
}

Rules:
- Cite at least 5 packet sources and preserve their IDs.
- Use at least 3 data points with exact source URLs.
- State uncertainties prominently.
- Do not use "buy", "sell", "strong buy", or price predictions.
- For a guide with no securities, return candidates as [] and omit winner/ticker.`;
  const response = await callStageAI('writer', system, user, { maxTokens: 10000 });
  const raw = parseStageJson<Partial<Article>>(response.text);
  if (!raw.content?.analysis || !raw.content?.references) {
    throw new Error('Writer returned an incomplete article');
  }
  const type: Article['type'] =
    item.type === 'recommendation-audit' ? 'roast' :
    item.type === 'comparison' ? 'pick' : 'take';
  const title = String(raw.title || item.title);
  const article: Article = {
    slug: `${slugify(title)}-${item.publishDate}`,
    type,
    title,
    description: String(raw.description || raw.content.summary || '').slice(0, 170),
    date: item.publishDate,
    createdAt: nowEST(),
    factChecked: false,
    ticker: raw.ticker ? String(raw.ticker).toUpperCase() : undefined,
    verdict: String(raw.verdict || raw.content.finalVerdict || ''),
    tags: [
      'editorial-research',
      item.type,
      ...item.tickers.map(ticker => ticker.toLowerCase()),
    ],
    content: {
      ...raw.content,
      candidates: Array.isArray(raw.content.candidates) ? raw.content.candidates : [],
      risks: Array.isArray(raw.content.risks) ? raw.content.risks : [],
      catalysts: Array.isArray(raw.content.catalysts) ? raw.content.catalysts : [],
      dataPoints: Array.isArray(raw.content.dataPoints) ? raw.content.dataPoints : [],
    },
    editorialReview: {
      status: 'pending',
      researchId: research.id,
    },
  };
  return { article, model: response.model };
}

async function verifyArticle(
  article: Article,
  research: ResearchPacket,
): Promise<VerificationResult> {
  const system = `You are an independent financial-content verifier.
Compare the draft against the supplied research packet. Treat every number, date, named event, comparative statement, and conclusion as unsupported unless the packet supports it.
Return only valid JSON. Do not rewrite the article.`;
  const user = `Research packet:
${JSON.stringify(research, null, 2)}

Draft:
${JSON.stringify(article, null, 2)}

Return:
{
  "passed": true,
  "issues": ["source mismatch, stale framing, or other issue"],
  "unsupportedClaims": ["exact unsupported claim"]
}

Pass only when all material claims are supported and citation URLs match the packet.`;
  const response = await callStageAI('verify', system, user, { maxTokens: 5000 });
  const raw = parseStageJson<Pick<VerificationResult, 'passed' | 'issues' | 'unsupportedClaims'>>(response.text);
  return {
    passed: raw.passed === true &&
      Array.isArray(raw.unsupportedClaims) &&
      raw.unsupportedClaims.length === 0,
    issues: Array.isArray(raw.issues) ? raw.issues.map(String) : ['Verifier returned no issue list'],
    unsupportedClaims: Array.isArray(raw.unsupportedClaims)
      ? raw.unsupportedClaims.map(String)
      : ['Verifier returned no unsupported-claim list'],
    checkedAt: nowEST(),
    model: response.model,
  };
}

export async function createEditorialDraft(
  plan: EditorialPlan,
  item: EditorialPlanItem,
): Promise<EditorialDraft> {
  assertEditorialStagesAreIsolated();
  const research = await researchPlanItem(item);
  const { article, model: writerModel } = await writeArticle(item, research);
  const verification = await verifyArticle(article, research);
  const draft: EditorialDraft = {
    id: `draft-${item.id}`,
    planMonth: plan.month,
    planItemId: item.id,
    status: 'pending_approval',
    createdAt: nowEST(),
    writerModel,
    research,
    verification,
    quality: { score: 0, issues: [], passed: false },
    article,
  };
  draft.quality = validateEditorialDraft(draft);
  draft.article.editorialReview = {
    status: 'pending',
    researchId: research.id,
    writerModel,
    verifierModel: verification.model,
    qualityScore: draft.quality.score,
  };
  return draft;
}
