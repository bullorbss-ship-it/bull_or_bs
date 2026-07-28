export type ArticleType = 'roast' | 'pick' | 'take';

export interface Article {
  slug: string;
  type: ArticleType;
  title: string;
  description: string;
  date: string;
  createdAt?: string;
  factChecked?: boolean;
  category?: string; // News sub-category (e.g. 'Geopolitics', 'M&A', 'Commodities')
  heroImage?: {
    url: string;
    photographer: string;
    photographerUrl: string;
    unsplashUrl: string;
  };
  inlineImages?: {
    url: string;
    photographer: string;
    photographerUrl: string;
    unsplashUrl: string;
  }[];
  ticker?: string;
  verdict: string;
  confidence?: number;
  editorialReview?: {
    status: 'pending' | 'approved' | 'rejected';
    approvedAt?: string;
    researchId?: string;
    writerModel?: string;
    verifierModel?: string;
    qualityScore?: number;
  };
  tags: string[];
  content: ArticleContent;
}

export interface ArticleReference {
  id: number;
  source: string;
  url: string;
}

export interface ArticleContent {
  headline: string;
  summary: string;
  // The Roast: what Motley Fool said
  foolClaim?: string;
  foolDate?: string;
  foolSource?: string;
  // News take: original source
  newsSource?: string;
  newsUrl?: string;
  // The reasoning tournament
  candidates: CandidateStock[];
  winner?: CandidateStock;
  // Full analysis
  analysis: string;
  risks: string[];
  catalysts: (string | CatalystDetail)[];
  dataPoints: DataPoint[];
  // The verdict
  finalVerdict: string;
  // Source references (footnote style)
  references?: ArticleReference[];
}

export interface CandidateStock {
  ticker: string;
  company: string;
  price?: number;
  status: 'considered' | 'eliminated' | 'selected';
  reasonConsidered: string;
  reasonEliminated?: string;
  score?: number | string;
}

export interface DataPoint {
  label: string;
  value: string;
  source?: string;
  sourceUrl?: string;
}

export interface CatalystDetail {
  claimed: string;
  actual: string;
  confidence?: string;
}

export interface Subscriber {
  email: string;
  subscribedAt: string;
  confirmed: boolean;
}

export type EditorialContentType = 'comparison' | 'recommendation-audit' | 'canadian-guide';
export type EditorialStatus = 'planned' | 'researching' | 'drafted' | 'approved' | 'rejected' | 'published';

export interface EditorialPlanItem {
  id: string;
  publishDate: string;
  type: EditorialContentType;
  title: string;
  primaryKeyword: string;
  angle: string;
  tickers: string[];
  whyNow: string;
  uniqueAsset: string;
  status: EditorialStatus;
}

export interface EditorialPlan {
  month: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  model: string;
  items: EditorialPlanItem[];
}

export interface ResearchSource {
  id: number;
  title: string;
  publisher: string;
  url: string;
  publishedAt?: string;
  sourceType: 'primary' | 'secondary';
  claims: string[];
}

export interface ResearchPacket {
  id: string;
  planItemId: string;
  researchedAt: string;
  model: string;
  summary: string;
  comparisonDimensions: {
    label: string;
    values: Record<string, string>;
    interpretation: string;
    sourceIds: number[];
  }[];
  keyFindings: string[];
  uncertainties: string[];
  sources: ResearchSource[];
}

export interface VerificationResult {
  passed: boolean;
  model: string;
  checkedAt: string;
  issues: string[];
  unsupportedClaims: string[];
}

export interface EditorialDraft {
  id: string;
  planMonth: string;
  planItemId: string;
  status: 'pending_approval' | 'rejected' | 'published';
  createdAt: string;
  writerModel: string;
  rejectedAt?: string;
  publishedAt?: string;
  research: ResearchPacket;
  verification: VerificationResult;
  quality: QualityResult;
  article: Article;
}

export interface QualityResult {
  score: number;
  issues: string[];
  passed: boolean;
  breakdown?: Record<string, number>;
}
