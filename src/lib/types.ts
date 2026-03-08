export type ArticleType = 'roast' | 'pick';

export interface Article {
  slug: string;
  type: ArticleType;
  title: string;
  description: string;
  date: string;
  ticker?: string;
  verdict: string;
  confidence?: number;
  tags: string[];
  content: ArticleContent;
}

export interface ArticleContent {
  headline: string;
  summary: string;
  // The Roast: what Motley Fool said
  foolClaim?: string;
  foolDate?: string;
  foolSource?: string;
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
