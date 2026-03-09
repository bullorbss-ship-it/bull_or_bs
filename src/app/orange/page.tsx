'use client';

import { useState, useEffect } from 'react';

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
  type: 'roast' | 'pick';
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

interface GenerateState {
  status: 'idle' | 'generating' | 'success' | 'error';
  message: string;
  result?: {
    slug: string;
    headline: string;
    cost: { usd: number; inputTokens: number; outputTokens: number; durationMs: number; dataConfidence: string };
  };
}

type Tab = 'generate' | 'articles' | 'costs';

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
      </div>

      {tab === 'generate' && <GenerateTab onGenerated={() => { loadAll(); setTab('articles'); }} />}
      {tab === 'articles' && <ArticlesTab articles={articles} getQualityScore={getQualityScore} />}
      {tab === 'costs' && <CostsTab costs={costs} />}
    </div>
  );
}

// ─── Generate Tab ───────────────────────────────────────────────────────────

function GenerateTab({ onGenerated }: { onGenerated: () => void }) {
  const [genType, setGenType] = useState<'roast' | 'pick'>('pick');
  const [ticker, setTicker] = useState('');
  const [claim, setClaim] = useState('');
  const [source, setSource] = useState('');
  const [topic, setTopic] = useState('');
  const [state, setState] = useState<GenerateState>({ status: 'idle', message: '' });

  async function handleGenerate() {
    setState({ status: 'generating', message: genType === 'roast' ? `Roasting ${ticker.toUpperCase()}...` : topic ? `Running tournament: ${topic}...` : 'Running AI tournament...' });

    try {
      const body = genType === 'roast'
        ? { type: 'roast', ticker: ticker.toUpperCase(), claim, source: source || undefined }
        : { type: 'pick', topic: topic || undefined };

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
          headline: data.article?.content?.headline || data.slug,
          cost: data.cost,
        },
      });

      // Reset form
      setTicker('');
      setClaim('');
      setSource('');
      setTopic('');
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Network error' });
    }
  }

  return (
    <>
      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setGenType('roast')}
          className={`border-2 rounded-xl p-5 text-left transition-all ${
            genType === 'roast'
              ? 'border-red bg-red-light'
              : 'border-card-border hover:border-red/30'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-lg bg-red-light text-red font-bold font-mono flex items-center justify-center text-lg">F</span>
            <div>
              <p className="font-bold text-foreground">Roast</p>
              <p className="text-xs text-muted">Audit a stock recommendation</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setGenType('pick')}
          className={`border-2 rounded-xl p-5 text-left transition-all ${
            genType === 'pick'
              ? 'border-accent bg-accent-light'
              : 'border-card-border hover:border-accent/30'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-lg bg-gold-light text-gold font-bold font-mono flex items-center justify-center text-lg">A</span>
            <div>
              <p className="font-bold text-foreground">AI Pick</p>
              <p className="text-xs text-muted">Run elimination tournament</p>
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
              onChange={e => setClaim(e.target.value)}
              placeholder="e.g. This stock is a strong buy for long-term investors looking for AI exposure..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-card-bg text-foreground focus:outline-none focus:border-accent resize-none"
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

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={state.status === 'generating' || (genType === 'roast' && (!ticker || !claim))}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          state.status === 'generating'
            ? 'bg-card-bg text-muted cursor-wait'
            : genType === 'roast'
              ? 'bg-red text-white hover:opacity-90'
              : 'bg-accent text-white hover:opacity-90'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {state.status === 'generating'
          ? state.message
          : genType === 'roast'
            ? `Roast ${ticker || '...'}`
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
          <div className="flex gap-3">
            <a
              href={`/article/${state.result.slug}`}
              target="_blank"
              className="text-sm font-semibold text-accent hover:text-accent/80"
            >
              View article &rarr;
            </a>
            <button
              onClick={onGenerated}
              className="text-sm text-muted hover:text-foreground"
            >
              Back to articles
            </button>
          </div>
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
                entry.type === 'roast' ? 'bg-red-light text-red' : 'bg-accent-light text-accent'
              }`}>
                {entry.type === 'roast' ? 'ROAST' : 'PICK'}
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
