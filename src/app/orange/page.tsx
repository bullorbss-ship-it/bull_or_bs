'use client';

import { useState, useEffect } from 'react';
import { getResearchPrompt } from '@/lib/ai/research-prompt';

interface ArticleData {
  slug: string;
  type: string;
  title: string;
  date: string;
  ticker?: string;
  verdict: string;
  tags: string[];
  content: {
    headline: string;
    summary: string;
    analysis: string;
    dataPoints: { label: string; value: string; source?: string }[];
    risks: string[];
    catalysts: string[];
    candidates: { ticker: string; company: string; score?: number; status: string }[];
    finalVerdict: string;
  };
}

interface CostEntry {
  id: string;
  date: string;
  type: 'roast' | 'pick' | 'screenshot-roast' | 'screenshot-pick' | 'take';
  ticker?: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  fmpCalls: number;
  durationMs: number;
}

interface CostSummary {
  totalCost: number;
  totalRuns: number;
  avgCostPerRun: number;
  monthlyBreakdown: Record<string, { cost: number; runs: number }>;
  last30Days: { cost: number; runs: number };
  entries: CostEntry[];
}

interface QualityResult {
  score: number;
  issues: string[];
  passed: boolean;
}

interface ProfileWarning {
  ticker: string;
  changes: { field: string; oldValue: string; newValue: string; confidence: string }[];
}

interface ProfileUpdateInfo {
  field: string;
  oldValue: string;
  newValue: string;
}

interface GenerateState {
  status: 'idle' | 'generating' | 'success' | 'error';
  message: string;
  result?: {
    slug: string;
    type: string;
    headline: string;
    article?: Record<string, unknown>;
    cost: { usd: number; inputTokens: number; outputTokens: number; durationMs: number; dataConfidence: string };
    profileWarnings?: ProfileWarning[];
    profileUpdates?: ProfileUpdateInfo[];
  };
  commitStatus?: 'idle' | 'committing' | 'committed' | 'error';
  commitMessage?: string;
  distributeStatus?: 'idle' | 'generating' | 'done' | 'error';
  socialCopy?: {
    reddit: { title: string; body: string; subreddits: string[] };
    twitter: string;
    instagram: string;
    articleUrl: string;
  };
  emailSent?: boolean;
}

type Tab = 'generate' | 'articles' | 'costs' | 'subscribers';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [costs, setCosts] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('generate');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setIsLoggedIn(true);
      setPassword('');
      loadAll();
    } else {
      setError('Invalid password');
    }
  }

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadArticles(), loadCosts()]);
    setLoading(false);
  }

  async function loadArticles() {
    const res = await fetch('/api/admin/articles');
    if (res.ok) {
      const data = await res.json();
      setArticles(data.articles);
    }
  }

  async function loadCosts() {
    const res = await fetch('/api/admin/costs');
    if (res.ok) {
      const data = await res.json();
      setCosts(data);
    }
  }

  useEffect(() => {
    fetch('/api/admin/articles')
      .then(res => {
        if (res.ok) {
          setIsLoggedIn(true);
          return res.json();
        }
        return null;
      })
      .then(data => {
        if (data) {
          setArticles(data.articles);
          loadCosts();
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getQualityScore(article: ArticleData): QualityResult {
    const issues: string[] = [];
    let score = 100;
    const c = article.content;

    if (!c) return { score: 0, issues: ['No content'], passed: false };

    if ((c.dataPoints || []).length < 3) {
      issues.push(`${(c.dataPoints || []).length} data points (need 3+)`);
      score -= 15;
    }
    if ((c.risks || []).length < 3) {
      issues.push(`${(c.risks || []).length} risks (need 3+)`);
      score -= 10;
    }
    if ((c.catalysts || []).length < 3) {
      issues.push(`${(c.catalysts || []).length} catalysts (need 3+)`);
      score -= 10;
    }
    const words = (c.analysis || '').split(/\s+/).filter(Boolean).length;
    if (words < 500) {
      issues.push(`${words} words (need 500+)`);
      score -= 15;
    }
    if (!c.finalVerdict || c.finalVerdict.length < 20) {
      issues.push('Verdict too short');
      score -= 10;
    }

    score = Math.max(0, score);
    return { score, issues, passed: score >= 70 };
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6 text-center font-mono">
            <span className="text-foreground">Bull</span>
            <span className="text-muted-light">Or</span>
            <span className="text-accent">BS</span>
            <span className="text-muted text-base ml-2">Admin</span>
          </h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground text-lg focus:outline-none focus:border-accent"
            autoFocus
          />
          <button
            type="submit"
            className="w-full mt-4 bg-accent text-white py-3 rounded-lg font-semibold text-lg hover:bg-accent-dim transition-colors"
          >
            Login
          </button>
          {error && (
            <p className="text-red text-sm text-center mt-3">{error}</p>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-mono">
          <span className="text-foreground">Bull</span>
          <span className="text-muted-light">Or</span>
          <span className="text-accent">BS</span>
          <span className="text-muted text-base ml-2">Dashboard</span>
        </h1>
        <button
          onClick={loadAll}
          disabled={loading}
          className="text-sm text-accent hover:text-accent-dim font-medium"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-card-border">
        <button
          onClick={() => setTab('generate')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'generate'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Generate
        </button>
        <button
          onClick={() => setTab('articles')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'articles'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Articles ({articles.length})
        </button>
        <button
          onClick={() => setTab('costs')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'costs'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Costs
        </button>
        <button
          onClick={() => setTab('subscribers')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'subscribers'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Subscribers
        </button>
      </div>

      {tab === 'generate' && <GenerateTab onGenerated={() => { loadAll(); setTab('articles'); }} />}
      {tab === 'articles' && <ArticlesTab articles={articles} getQualityScore={getQualityScore} />}
      {tab === 'costs' && <CostsTab costs={costs} />}
      {tab === 'subscribers' && <SubscribersTab />}
    </div>
  );
}

// ─── Generate Tab ───────────────────────────────────────────────────────────

function GenerateTab({ onGenerated }: { onGenerated: () => void }) {
  const [genType, setGenType] = useState<'roast' | 'pick' | 'screenshot-roast' | 'screenshot-pick' | 'take'>('screenshot-roast');
  const [newsText, setNewsText] = useState('');
  const [ticker, setTicker] = useState('');
  const [claim, setClaim] = useState('');
  const [source, setSource] = useState('');
  const [topic, setTopic] = useState('');
  const [textData, setTextData] = useState('');
  const [showResearch, setShowResearch] = useState(false);
  const [researchPrompt, setResearchPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [state, setState] = useState<GenerateState>({ status: 'idle', message: '' });

  async function handleCommit(slug: string, articleType: string) {
    setState(prev => ({ ...prev, commitStatus: 'committing' }));
    try {
      const res = await fetch('/api/admin/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type: articleType, article: state.result?.article }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState(prev => ({ ...prev, commitStatus: 'error', commitMessage: data.detail || data.error }));
        return;
      }
      setState(prev => ({
        ...prev,
        commitStatus: 'committed',
        commitMessage: `Commit: ${data.commitSha?.slice(0, 7) || 'done'}`,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        commitStatus: 'error',
        commitMessage: err instanceof Error ? err.message : 'Network error',
      }));
    }
  }

  async function handleDistribute(slug: string) {
    setState(prev => ({ ...prev, distributeStatus: 'generating' }));
    try {
      const res = await fetch('/api/admin/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, article: state.result?.article }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState(prev => ({ ...prev, distributeStatus: 'error' }));
        return;
      }
      setState(prev => ({
        ...prev,
        distributeStatus: 'done',
        socialCopy: data.copy,
        emailSent: data.emailSent,
      }));
    } catch {
      setState(prev => ({ ...prev, distributeStatus: 'error' }));
    }
  }

  async function handleGenerate() {
    const messages: Record<string, string> = {
      'roast': `Roasting ${ticker.toUpperCase()}...`,
      'pick': topic ? `Running tournament: ${topic}...` : 'Running AI tournament...',
      'screenshot-roast': 'Analyzing pasted data...',
      'screenshot-pick': 'Comparing stocks from pasted data...',
      'take': 'Writing news take...',
    };
    setState({ status: 'generating', message: messages[genType] || 'Generating...' });

    try {
      let body: Record<string, unknown>;
      if (genType === 'roast') {
        body = { type: 'roast', ticker: ticker.toUpperCase(), claim, source: source || undefined };
      } else if (genType === 'pick') {
        body = { type: 'pick', topic: topic || undefined };
      } else if (genType === 'screenshot-roast') {
        body = { type: 'screenshot-roast', source: source || undefined, ticker: ticker || undefined, textData: textData || undefined };
      } else if (genType === 'take') {
        body = { type: 'take', newsText: newsText || undefined, source: source || undefined };
      } else {
        body = { type: 'screenshot-pick', topic: topic || undefined, textData: textData || undefined };
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setState({ status: 'error', message: data.detail || data.error || 'Generation failed' });
        return;
      }

      setState({
        status: 'success',
        message: 'Article generated!',
        result: {
          slug: data.slug,
          type: genType === 'take' ? 'take' : genType.includes('roast') ? 'roast' : 'pick',
          headline: data.article?.content?.headline || data.slug,
          article: data.article,
          cost: data.cost,
          profileWarnings: data.profileWarnings || [],
          profileUpdates: data.profileUpdates || [],
        },
        commitStatus: 'idle',
      });

      // Reset form
      setTicker('');
      setClaim('');
      setSource('');
      setTopic('');
      setTextData('');
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Network error' });
    }
  }

  return (
    <>
      {/* Quick actions — screenshot modes first (recommended) */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setGenType('screenshot-roast')}
          className={`border-2 rounded-xl p-5 text-left transition-all ${
            genType === 'screenshot-roast'
              ? 'border-red bg-red-light'
              : 'border-card-border hover:border-red/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-red-light text-red font-bold font-mono flex items-center justify-center text-lg">R</span>
            <div>
              <p className="font-bold text-foreground">Data Roast</p>
              <p className="text-xs text-muted">Paste data + article — zero hallucination</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setGenType('screenshot-pick')}
          className={`border-2 rounded-xl p-5 text-left transition-all ${
            genType === 'screenshot-pick'
              ? 'border-accent bg-accent-light'
              : 'border-card-border hover:border-accent/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-gold-light text-gold font-bold font-mono flex items-center justify-center text-lg">VS</span>
            <div>
              <p className="font-bold text-foreground">Data Pick</p>
              <p className="text-xs text-muted">Paste stock data to compare (2-20)</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setGenType('roast')}
          className={`border-2 rounded-xl p-4 text-left transition-all ${
            genType === 'roast'
              ? 'border-red bg-red-light'
              : 'border-card-border hover:border-red/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-red-light text-red font-bold font-mono flex items-center justify-center text-sm">F</span>
            <div>
              <p className="font-bold text-foreground text-sm">Text Roast</p>
              <p className="text-xs text-muted">Paste claim manually (legacy)</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setGenType('pick')}
          className={`border-2 rounded-xl p-4 text-left transition-all ${
            genType === 'pick'
              ? 'border-accent bg-accent-light'
              : 'border-card-border hover:border-accent/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gold-light text-gold font-bold font-mono flex items-center justify-center text-sm">A</span>
            <div>
              <p className="font-bold text-foreground text-sm">Text Pick</p>
              <p className="text-xs text-muted">15-stock tournament (legacy)</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setGenType('take')}
          className={`border-2 rounded-xl p-5 text-left transition-all ${
            genType === 'take'
              ? 'border-muted bg-card-bg'
              : 'border-card-border hover:border-muted/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-card-bg text-muted font-bold font-mono flex items-center justify-center text-lg border border-card-border">&#9889;</span>
            <div>
              <p className="font-bold text-foreground">News Take</p>
              <p className="text-xs text-muted">Paste news — explain it simply</p>
            </div>
          </div>
        </button>
      </div>

      {/* Roast form */}
      {genType === 'roast' && (
        <div className="border border-card-border rounded-xl p-6 mb-6 space-y-4">
          <div>
            <label className="text-xs font-mono text-muted-light uppercase tracking-wide mb-1.5 block">Ticker *</label>
            <input
              type="text"
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL, RY, SHOP"
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-card-bg text-foreground font-mono focus:outline-none focus:border-accent"
              disabled={state.status === 'generating'}
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-light uppercase tracking-wide mb-1.5 block">Claim to audit *</label>
            <textarea
              value={claim}
              onChange={e => { setClaim(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
              placeholder="e.g. This stock is a strong buy for long-term investors looking for AI exposure..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-card-bg text-foreground focus:outline-none focus:border-accent resize-none overflow-hidden"
              style={{ minHeight: '100px' }}
              disabled={state.status === 'generating'}
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-light uppercase tracking-wide mb-1.5 block">Source (optional)</label>
            <input
              type="text"
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="e.g. Popular financial newsletter, March 2026"
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-card-bg text-foreground focus:outline-none focus:border-accent"
              disabled={state.status === 'generating'}
            />
          </div>
        </div>
      )}

      {/* Pick form */}
      {genType === 'pick' && (
        <div className="border border-card-border rounded-xl p-6 mb-6 space-y-4">
          <div>
            <label className="text-xs font-mono text-muted-light uppercase tracking-wide mb-1.5 block">Topic (optional)</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. chip designing companies in US, Canadian banks, AI infrastructure plays"
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-card-bg text-foreground focus:outline-none focus:border-accent"
              disabled={state.status === 'generating'}
            />
            <p className="text-xs text-muted-light mt-1.5">
              Leave blank for general market movers tournament. Add a topic to focus on a specific sector or theme.
            </p>
          </div>
          <p className="text-xs text-muted-light">
            Uses FMP market data (if available) + Haiku 4.5. Estimated cost: ~$0.02
          </p>
        </div>
      )}

      {/* Screenshot Roast form */}
      {genType === 'screenshot-roast' && (
        <div className="border border-card-border rounded-xl p-6 mb-6 space-y-5">
          {/* Step 1: Stock name */}
          <div>
            <label className="text-xs font-mono text-muted-light uppercase tracking-wide mb-1.5 block">
              <span className="text-red font-bold mr-1">1.</span> Stock / Company Name
            </label>
            <input
              type="text"
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g. TSLA, RY.TO, IFC.TO"
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-card-bg text-foreground font-mono focus:outline-none focus:border-accent"
              disabled={state.status === 'generating'}
            />
          </div>

          {/* Research Helper — collapsible */}
          <div className="border border-blue-500/30 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowResearch(!showResearch)}
              className="w-full flex items-center justify-between px-4 py-3 bg-blue-500/10 hover:bg-blue-500/15 transition-colors"
            >
              <span className="text-sm font-bold text-blue-400">Research Helper — Get Verified Data</span>
              <span className="text-blue-400 text-xs">{showResearch ? 'Hide' : 'Expand'}</span>
            </button>
            {showResearch && (
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted">Generate a research prompt pre-filled with your ticker. Copy it into Claude or Gemini to get a verified data table, then paste results below.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (ticker.trim()) {
                        setResearchPrompt(getResearchPrompt(ticker.trim()));
                        setCopied(false);
                      }
                    }}
                    disabled={!ticker.trim()}
                    className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-bold hover:bg-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Generate Prompt{ticker.trim() ? ` for ${ticker}` : ''}
                  </button>
                  {researchPrompt && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(researchPrompt);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-4 py-2 rounded-lg bg-accent/20 text-accent text-sm font-bold hover:bg-accent/30 transition-colors"
                    >
                      {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                  )}
                </div>
                {researchPrompt && (
                  <textarea
                    readOnly
                    value={researchPrompt}
                    rows={8}
                    className="w-full px-3 py-2 rounded-lg border border-card-border bg-card-bg text-muted text-xs font-mono resize-y"
                    style={{ minHeight: '150px', maxHeight: '400px' }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Step 2: Data input — text paste */}
          <div>
            <label className="text-xs font-mono text-muted-light uppercase tracking-wide mb-1.5 block">
              <span className="text-red font-bold mr-1">2.</span> Stock Data + Article *
            </label>
            <p className="text-xs text-muted-light mb-3">Paste stock data table + article text. AI uses this as ground truth.</p>

            <textarea
              value={textData}
              onChange={e => { setTextData(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
              placeholder="Paste stock data table + article text here. Get a comparison table from Claude/Gemini and paste it in. AI will use this as ground truth."
              rows={8}
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-card-bg text-foreground text-sm font-mono focus:outline-none focus:border-accent resize-none overflow-hidden"
              style={{ minHeight: '200px' }}
              disabled={state.status === 'generating'}
            />
            {textData.trim() && (
              <p className="text-xs text-accent mt-1">{textData.trim().split(/\s+/).length} words pasted</p>
            )}
          </div>

          {/* Step 3: Source */}
          <div>
            <label className="text-xs font-mono text-muted-light uppercase tracking-wide mb-1.5 block">
              <span className="text-red font-bold mr-1">3.</span> Source (optional)
            </label>
            <input
              type="text"
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="e.g. Popular financial newsletter, March 2026"
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-card-bg text-foreground focus:outline-none focus:border-accent"
              disabled={state.status === 'generating'}
            />
          </div>

          <div className="bg-accent-light/30 rounded-lg p-3">
            <p className="text-xs text-accent font-medium">Tip: Use the Research Helper above to generate a verified data table, then paste it here. AI uses only your pasted data — zero hallucination.</p>
          </div>
        </div>
      )}

      {/* Screenshot Pick form */}
      {genType === 'screenshot-pick' && (
        <div className="border border-card-border rounded-xl p-6 mb-6 space-y-4">
          {/* Research Helper — collapsible */}
          <div className="border border-blue-500/30 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowResearch(!showResearch)}
              className="w-full flex items-center justify-between px-4 py-3 bg-blue-500/10 hover:bg-blue-500/15 transition-colors"
            >
              <span className="text-sm font-bold text-blue-400">Research Helper — Get Verified Data</span>
              <span className="text-blue-400 text-xs">{showResearch ? 'Hide' : 'Expand'}</span>
            </button>
            {showResearch && (
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted">Enter tickers (comma-separated) to generate a research prompt. Copy it into Claude or Gemini to get verified data tables.</p>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={ticker}
                    onChange={e => setTicker(e.target.value.toUpperCase())}
                    placeholder="e.g. RY.TO, TD.TO, BMO.TO"
                    className="flex-1 px-3 py-2 rounded-lg border border-card-border bg-card-bg text-foreground font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (ticker.trim()) {
                        setResearchPrompt(getResearchPrompt(ticker.trim()));
                        setCopied(false);
                      }
                    }}
                    disabled={!ticker.trim()}
                    className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-bold hover:bg-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    Generate
                  </button>
                  {researchPrompt && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(researchPrompt);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-4 py-2 rounded-lg bg-accent/20 text-accent text-sm font-bold hover:bg-accent/30 transition-colors whitespace-nowrap"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
                {researchPrompt && (
                  <textarea
                    readOnly
                    value={researchPrompt}
                    rows={8}
                    className="w-full px-3 py-2 rounded-lg border border-card-border bg-card-bg text-muted text-xs font-mono resize-y"
                    style={{ minHeight: '150px', maxHeight: '400px' }}
                  />
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-mono text-muted-light uppercase tracking-wide mb-1.5 block">
              <span className="text-accent font-bold mr-1">1.</span> Stock Data *
            </label>
            <p className="text-xs text-muted-light mb-3">Paste a comparison table from Claude/Gemini. 2-3 stocks for quick compare, up to 20 for full tournament.</p>

            <textarea
              value={textData}
              onChange={e => { setTextData(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
              placeholder="Paste stock comparison data here — get a table from Claude/Gemini with P/E, yield, market cap, revenue, etc. for all stocks you want to compare."
              rows={10}
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-card-bg text-foreground text-sm font-mono focus:outline-none focus:border-accent resize-none overflow-hidden"
              style={{ minHeight: '250px' }}
              disabled={state.status === 'generating'}
            />
            {textData.trim() && (
              <p className="text-xs text-accent mt-1">{textData.trim().split(/\s+/).length} words pasted</p>
            )}
          </div>

          <div>
            <label className="text-xs font-mono text-muted-light uppercase tracking-wide mb-1.5 block">
              <span className="text-accent font-bold mr-1">2.</span> Topic (optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. EV stocks, Canadian banks"
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-card-bg text-foreground focus:outline-none focus:border-accent"
              disabled={state.status === 'generating'}
            />
          </div>
          <div className="bg-accent-light/30 rounded-lg p-3">
            <p className="text-xs text-accent font-medium">Compares ONLY the stocks in your pasted data. Use Research Helper above to get verified tables first. ~$0.03-0.10/article</p>
          </div>
        </div>
      )}

      {/* Take form */}
      {genType === 'take' && (
        <div className="border border-card-border rounded-xl p-6 mb-6 space-y-4">
          <div>
            <label className="text-xs font-mono text-muted-light uppercase tracking-wide mb-1.5 block">News Source *</label>
            <input
              type="text"
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="Reuters, Bloomberg, CBC, etc."
              className="w-full border border-card-border rounded-lg px-4 py-2.5 bg-background text-foreground placeholder:text-muted-light focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-light uppercase tracking-wide mb-1.5 block">News Text *</label>
            <textarea
              value={newsText}
              onChange={e => setNewsText(e.target.value)}
              placeholder="Paste the news article or key facts here..."
              rows={8}
              className="w-full border border-card-border rounded-lg px-4 py-2.5 bg-background text-foreground placeholder:text-muted-light focus:outline-none focus:border-accent font-mono text-sm"
            />
          </div>
          <div className="bg-card-bg rounded-lg p-4">
            <p className="text-xs text-muted">Paste the news content. AI will summarize it in plain English — no speculation, no predictions, just facts explained simply. ~$0.01-0.02/take</p>
          </div>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={
          state.status === 'generating' ||
          (genType === 'roast' && (!ticker || !claim)) ||
          (genType === 'screenshot-roast' && !textData.trim()) ||
          (genType === 'screenshot-pick' && !textData.trim()) ||
          (genType === 'take' && (!newsText.trim() || !source.trim()))
        }
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          state.status === 'generating'
            ? 'bg-card-bg text-muted cursor-wait'
            : genType.includes('roast')
              ? 'bg-red text-white hover:opacity-90'
              : 'bg-accent text-white hover:opacity-90'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {state.status === 'generating'
          ? state.message
          : genType === 'roast'
            ? `Roast ${ticker || '...'}`
            : genType === 'screenshot-roast'
              ? `Fact-Check & Roast${ticker ? ` ${ticker}` : ''}`
              : genType === 'screenshot-pick'
                ? 'Compare Stocks'
                : genType === 'take'
                  ? 'Generate News Take'
                  : topic ? `Run: ${topic.slice(0, 30)}${topic.length > 30 ? '...' : ''}` : 'Run AI Tournament'
        }
      </button>

      {/* Status */}
      {state.status === 'generating' && (
        <div className="mt-6 border border-card-border rounded-xl p-6 text-center">
          <div className="animate-pulse">
            <p className="text-lg font-mono text-accent mb-2">{state.message}</p>
            <p className="text-xs text-muted-light">This usually takes 10-30 seconds</p>
          </div>
        </div>
      )}

      {state.status === 'success' && state.result && (
        <div className="mt-6 border-2 border-accent rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-accent text-xl">&#10003;</span>
            <p className="font-bold text-foreground">Article generated!</p>
          </div>
          <p className="text-sm text-foreground font-medium mb-3">{state.result.headline}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted font-mono mb-4">
            <span>${state.result.cost.usd.toFixed(4)}</span>
            <span>{((state.result.cost.inputTokens + state.result.cost.outputTokens) / 1000).toFixed(1)}K tokens</span>
            <span>{(state.result.cost.durationMs / 1000).toFixed(1)}s</span>
            <span className="text-accent">{state.result.cost.dataConfidence}</span>
          </div>

          {/* Profile warnings from Gemini refresh */}
          {state.result.profileWarnings && state.result.profileWarnings.length > 0 && (
            <div className="border border-gold/40 rounded-lg p-4 bg-gold-light/20 mb-4">
              <p className="text-sm font-bold text-gold mb-2">Profile Data Updated ({state.result.profileWarnings.length} tickers)</p>
              <p className="text-xs text-muted mb-2">Gemini found stale data in these profiles. Profiles have been auto-updated, but the article may still contain old numbers — review before publishing.</p>
              {state.result.profileWarnings.map((w, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  <p className="text-xs font-mono font-bold text-foreground">{w.ticker}</p>
                  {w.changes.map((c, j) => (
                    <p key={j} className="text-xs font-mono text-muted ml-3">
                      <span className={c.confidence === 'high' ? 'text-red' : 'text-gold'}>{c.confidence === 'high' ? '!!!' : '!!'}</span>
                      {' '}{c.field}: &ldquo;{c.oldValue}&rdquo; → &ldquo;{c.newValue}&rdquo;
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Profile updates from screenshot data */}
          {state.result.profileUpdates && state.result.profileUpdates.length > 0 && (
            <div className="border border-accent/40 rounded-lg p-4 bg-accent-light/20 mb-4">
              <p className="text-sm font-bold text-accent mb-2">Ticker Profiles Updated ({state.result.profileUpdates.length} fields)</p>
              <p className="text-xs text-muted mb-2">Local profiles updated with real data from your input.</p>
              {state.result.profileUpdates.map((u, i) => (
                <p key={i} className="text-xs font-mono text-muted">
                  <span className="text-accent">+</span> {u.field}: &ldquo;{u.oldValue}&rdquo; &rarr; &ldquo;{u.newValue}&rdquo;
                </p>
              ))}
            </div>
          )}

          <a
            href={`/article/${state.result.slug}`}
            target="_blank"
            className="text-sm text-accent hover:text-accent/80 mb-4 inline-block"
          >
            Preview article &rarr;
          </a>

          {/* Commit CTAs */}
          {state.commitStatus === 'committed' ? (
            <div className="border border-accent/30 rounded-lg p-4 bg-accent-light/30 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-accent">&#10003;</span>
                <p className="text-sm font-medium text-foreground">Saved to GitHub — will persist across deploys</p>
              </div>
              {state.commitMessage && (
                <p className="text-xs text-muted mt-1 font-mono">{state.commitMessage}</p>
              )}
            </div>
          ) : state.commitStatus === 'error' ? (
            <div className="border border-red/30 rounded-lg p-4 bg-red-light/30 mb-3">
              <p className="text-sm font-medium text-red">Commit failed</p>
              <p className="text-xs text-muted mt-1">{state.commitMessage}</p>
              <button
                onClick={() => handleCommit(state.result!.slug, state.result!.type)}
                className="text-xs text-accent hover:text-accent/80 mt-2"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={() => handleCommit(state.result!.slug, state.result!.type)}
                disabled={state.commitStatus === 'committing'}
                className="flex-1 bg-accent text-white py-3 px-5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-wait"
              >
                {state.commitStatus === 'committing' ? 'Saving to repo...' : 'Publish & Save to Repo'}
              </button>
              <button
                onClick={() => { setState({ status: 'idle', message: '' }); onGenerated(); }}
                disabled={state.commitStatus === 'committing'}
                className="flex-1 border border-card-border text-muted py-3 px-5 rounded-lg font-semibold text-sm hover:text-foreground hover:border-foreground/30 transition-all"
              >
                Cancel — do not deploy
              </button>
            </div>
          )}

          {state.commitStatus === 'committed' && (
            <div className="mt-3 space-y-3">
              {/* Distribute button */}
              {state.distributeStatus !== 'done' && (
                <button
                  onClick={() => handleDistribute(state.result!.slug)}
                  disabled={state.distributeStatus === 'generating'}
                  className="w-full bg-gold text-navy py-3 px-5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-wait"
                >
                  {state.distributeStatus === 'generating' ? 'Writing social posts...' : 'Distribute — Generate Social Posts'}
                </button>
              )}

              {/* Social copy display */}
              {state.distributeStatus === 'done' && state.socialCopy && (
                <div className="border border-card-border rounded-xl p-5 bg-card-bg space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm">Social Posts Ready</p>
                    {state.emailSent && <span className="text-xs text-accent">Email sent</span>}
                  </div>

                  {/* Reddit */}
                  <div>
                    <p className="text-xs font-mono text-muted-light uppercase tracking-wide mb-1">
                      Reddit — {state.socialCopy.reddit.subreddits.map(s => `r/${s}`).join(', ')}
                    </p>
                    <p className="text-sm font-semibold mb-1">{state.socialCopy.reddit.title}</p>
                    <div className="bg-background rounded-lg p-3 text-sm text-muted whitespace-pre-wrap">{state.socialCopy.reddit.body}</div>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${state.socialCopy!.reddit.title}\n\n${state.socialCopy!.reddit.body}`)}
                      className="text-xs text-accent hover:text-accent/80 mt-1"
                    >
                      Copy Reddit post
                    </button>
                  </div>

                  {/* Twitter */}
                  <div>
                    <p className="text-xs font-mono text-muted-light uppercase tracking-wide mb-1">
                      X (Twitter) — {state.socialCopy.twitter.length}/280
                    </p>
                    <div className="bg-background rounded-lg p-3 text-sm text-muted">{state.socialCopy.twitter}</div>
                    <button
                      onClick={() => navigator.clipboard.writeText(state.socialCopy!.twitter)}
                      className="text-xs text-accent hover:text-accent/80 mt-1"
                    >
                      Copy tweet
                    </button>
                  </div>

                  {/* Instagram */}
                  <div>
                    <p className="text-xs font-mono text-muted-light uppercase tracking-wide mb-1">Instagram</p>
                    <div className="bg-background rounded-lg p-3 text-sm text-muted whitespace-pre-wrap">{state.socialCopy.instagram}</div>
                    <button
                      onClick={() => navigator.clipboard.writeText(state.socialCopy!.instagram)}
                      className="text-xs text-accent hover:text-accent/80 mt-1"
                    >
                      Copy caption
                    </button>
                  </div>
                </div>
              )}

              {state.distributeStatus === 'error' && (
                <p className="text-xs text-red">Failed to generate social posts. Try again.</p>
              )}

              <button
                onClick={onGenerated}
                className="text-sm text-muted hover:text-foreground"
              >
                Back to articles
              </button>
            </div>
          )}
        </div>
      )}

      {state.status === 'error' && (
        <div className="mt-6 border-2 border-red rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red text-xl">&#10007;</span>
            <p className="font-bold text-red">Generation failed</p>
          </div>
          <p className="text-sm text-muted">{state.message}</p>
          <button
            onClick={() => setState({ status: 'idle', message: '' })}
            className="mt-3 text-sm text-accent hover:text-accent/80"
          >
            Try again
          </button>
        </div>
      )}

      {/* Quick tips */}
      <div className="mt-8 border border-card-border rounded-xl p-5 bg-card-bg">
        <p className="text-xs font-mono text-muted-light uppercase tracking-wide mb-3">Morning run checklist</p>
        <ul className="space-y-2 text-sm text-muted">
          <li className="flex gap-2"><span className="text-accent shrink-0">1.</span> Generate AI Pick (market tournament)</li>
          <li className="flex gap-2"><span className="text-accent shrink-0">2.</span> Pick a trending stock claim to roast</li>
          <li className="flex gap-2"><span className="text-accent shrink-0">3.</span> Check Articles tab for quality scores</li>
          <li className="flex gap-2"><span className="text-accent shrink-0">4.</span> Check Costs tab for spend tracking</li>
          <li className="flex gap-2"><span className="text-muted-light shrink-0">5.</span> <span className="text-muted-light">Remember: articles on Render are ephemeral — commit to git for persistence</span></li>
        </ul>
      </div>
    </>
  );
}

// ─── Articles Tab ────────────────────────────────────────────────────────────

function ArticlesTab({
  articles,
  getQualityScore,
}: {
  articles: ArticleData[];
  getQualityScore: (a: ArticleData) => QualityResult;
}) {
  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-card-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-mono text-foreground">{articles.length}</p>
          <p className="text-xs text-muted">Total Articles</p>
        </div>
        <div className="border border-card-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-mono text-red">
            {articles.filter(a => a.type === 'roast').length}
          </p>
          <p className="text-xs text-muted">Roasts</p>
        </div>
        <div className="border border-card-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-mono text-accent">
            {articles.filter(a => a.type === 'pick').length}
          </p>
          <p className="text-xs text-muted">Picks</p>
        </div>
      </div>

      {/* Article List */}
      {articles.length === 0 ? (
        <div className="border border-dashed border-card-border rounded-xl p-12 text-center">
          <p className="text-muted text-lg mb-2">No articles yet</p>
          <p className="text-muted-light text-sm">
            Generate articles via the /api/generate endpoint
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map(article => {
            const quality = getQualityScore(article);
            return (
              <div
                key={article.slug}
                className="border border-card-border rounded-xl p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                        article.type === 'roast' ? 'bg-red-light text-red' : 'bg-accent-light text-accent'
                      }`}>
                        {article.type === 'roast' ? 'ROAST' : 'PICK'}
                      </span>
                      {article.ticker && (
                        <span className="text-xs font-mono text-muted border border-card-border px-2 py-1 rounded">
                          {article.ticker}
                        </span>
                      )}
                      <time className="text-xs text-muted-light ml-auto shrink-0">{article.date}</time>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 truncate">
                      {article.content.headline}
                    </h3>
                    <p className="text-sm text-muted line-clamp-2">
                      {article.content.summary}
                    </p>
                  </div>

                  <div className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-bold font-mono text-lg ${
                    quality.score >= 80 ? 'bg-green-light text-green' :
                    quality.score >= 60 ? 'bg-yellow-light text-yellow' :
                    'bg-red-light text-red'
                  }`}>
                    {quality.score}
                  </div>
                </div>

                {quality.issues.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-card-border">
                    <p className="text-xs text-muted-light mb-1">Quality issues:</p>
                    <div className="flex flex-wrap gap-1">
                      {quality.issues.map((issue, i) => (
                        <span key={i} className="text-xs bg-card-bg text-muted px-2 py-0.5 rounded">
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <a
                    href={`/article/${article.slug}`}
                    target="_blank"
                    className="text-sm text-accent hover:text-accent-dim font-medium"
                  >
                    View &rarr;
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ─── Costs Tab ───────────────────────────────────────────────────────────────

function CostsTab({ costs }: { costs: CostSummary | null }) {
  if (!costs) {
    return (
      <div className="border border-dashed border-card-border rounded-xl p-12 text-center">
        <p className="text-muted text-lg mb-2">Loading cost data...</p>
      </div>
    );
  }

  if (costs.totalRuns === 0) {
    return (
      <div className="border border-dashed border-card-border rounded-xl p-12 text-center">
        <p className="text-muted text-lg mb-2">No runs yet</p>
        <p className="text-muted-light text-sm">Cost tracking starts with the next generation run</p>
      </div>
    );
  }

  const months = Object.entries(costs.monthlyBreakdown).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="border border-card-border rounded-xl p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold font-mono text-foreground">
            ${costs.totalCost.toFixed(2)}
          </p>
          <p className="text-xs text-muted">Total Spend</p>
        </div>
        <div className="border border-card-border rounded-xl p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold font-mono text-foreground">
            {costs.totalRuns}
          </p>
          <p className="text-xs text-muted">Total Runs</p>
        </div>
        <div className="border border-card-border rounded-xl p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold font-mono text-accent">
            ${costs.avgCostPerRun.toFixed(4)}
          </p>
          <p className="text-xs text-muted">Avg/Run</p>
        </div>
        <div className="border border-card-border rounded-xl p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold font-mono text-foreground">
            ${costs.last30Days.cost.toFixed(2)}
          </p>
          <p className="text-xs text-muted">Last 30d</p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      {months.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Monthly Breakdown</h3>
          <div className="border border-card-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-card-bg">
                  <th className="text-left px-4 py-2.5 text-muted font-medium">Month</th>
                  <th className="text-right px-4 py-2.5 text-muted font-medium">Runs</th>
                  <th className="text-right px-4 py-2.5 text-muted font-medium">Cost</th>
                  <th className="text-right px-4 py-2.5 text-muted font-medium">Avg</th>
                </tr>
              </thead>
              <tbody>
                {months.map(([month, data]) => (
                  <tr key={month} className="border-t border-card-border">
                    <td className="px-4 py-2.5 font-mono text-foreground">{month}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-muted">{data.runs}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-foreground">${data.cost.toFixed(4)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-muted">
                      ${(data.cost / data.runs).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Runs */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Runs</h3>
        <div className="space-y-2">
          {costs.entries.slice(0, 20).map(entry => (
            <div
              key={entry.id}
              className="border border-card-border rounded-lg px-4 py-3 flex flex-wrap items-center gap-2 sm:gap-3"
            >
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                entry.type.includes('roast') ? 'bg-red-light text-red' : 'bg-accent-light text-accent'
              }`}>
                {entry.type === 'screenshot-roast' ? 'SS-ROAST' : entry.type === 'screenshot-pick' ? 'SS-PICK' : entry.type === 'take' ? 'TAKE' : entry.type === 'roast' ? 'ROAST' : 'PICK'}
              </span>
              {entry.ticker && (
                <span className="text-xs font-mono text-muted">{entry.ticker}</span>
              )}
              <span className="text-xs text-muted-light">{entry.date}</span>
              <span className="ml-auto text-xs font-mono text-foreground font-semibold">
                ${entry.costUsd.toFixed(4)}
              </span>
              <span className="text-xs text-muted-light" title={`${entry.inputTokens} in / ${entry.outputTokens} out`}>
                {((entry.inputTokens + entry.outputTokens) / 1000).toFixed(1)}K tok
              </span>
              <span className="text-xs text-muted-light">
                {entry.fmpCalls} FMP
              </span>
              <span className="text-xs text-muted-light">
                {(entry.durationMs / 1000).toFixed(1)}s
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Projection */}
      <div className="mt-8 border border-accent/20 rounded-xl p-5 bg-accent-light/30">
        <h3 className="text-sm font-semibold text-foreground mb-2">Cost Projection</h3>
        <div className="text-sm text-muted space-y-1">
          <p>At current avg of <span className="font-mono text-foreground">${costs.avgCostPerRun.toFixed(4)}</span>/run:</p>
          <p>Daily (1 roast + 1 pick): <span className="font-mono text-foreground">${(costs.avgCostPerRun * 2).toFixed(4)}</span></p>
          <p>Monthly (44 runs): <span className="font-mono text-foreground">${(costs.avgCostPerRun * 44).toFixed(2)}</span></p>
          <p>Yearly (500 runs): <span className="font-mono text-foreground">${(costs.avgCostPerRun * 500).toFixed(2)}</span></p>
        </div>
      </div>
    </>
  );
}

// ─── Subscribers Tab ────────────────────────────────────────────────────────

function SubscribersTab() {
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/subscribers', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setEmails(data.emails || []);
      } catch {
        setError('Could not load subscribers');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="text-muted text-sm">Loading subscribers...</p>;
  if (error) return <p className="text-red text-sm">{error}</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{emails.length} Subscriber{emails.length !== 1 ? 's' : ''}</h2>
        <button
          onClick={() => {
            navigator.clipboard.writeText(emails.join('\n'));
          }}
          className="text-xs text-accent hover:text-accent-dim transition-colors"
        >
          Copy all emails
        </button>
      </div>
      {emails.length === 0 ? (
        <div className="border border-dashed border-card-border rounded-xl p-6 text-center">
          <p className="text-muted text-sm">No subscribers yet.</p>
        </div>
      ) : (
        <div className="border border-card-border rounded-xl divide-y divide-card-border">
          {emails.map((email, i) => (
            <div key={email} className="px-4 py-3 flex items-center justify-between text-sm">
              <span className="font-mono text-foreground">{email}</span>
              <span className="text-muted text-xs">#{i + 1}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
