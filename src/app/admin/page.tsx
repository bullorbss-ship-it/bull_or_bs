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

interface QualityResult {
  score: number;
  issues: string[];
  passed: boolean;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(false);

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
      loadArticles();
    } else {
      setError('Invalid password');
    }
  }

  async function loadArticles() {
    setLoading(true);
    const res = await fetch('/api/admin/articles');
    if (res.ok) {
      const data = await res.json();
      setArticles(data.articles);
    }
    setLoading(false);
  }

  useEffect(() => {
    // Try loading articles — if session cookie exists, we're already logged in
    fetch('/api/admin/articles')
      .then(res => {
        if (res.ok) {
          setIsLoggedIn(true);
          return res.json();
        }
        return null;
      })
      .then(data => {
        if (data) setArticles(data.articles);
      });
  }, []);

  // Simple client-side quality check (mirrors server-side logic)
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
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold font-mono">
          <span className="text-foreground">Bull</span>
          <span className="text-muted-light">Or</span>
          <span className="text-accent">BS</span>
          <span className="text-muted text-base ml-2">Dashboard</span>
        </h1>
        <button
          onClick={loadArticles}
          disabled={loading}
          className="text-sm text-accent hover:text-accent-dim font-medium"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

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
                className="border border-card-border rounded-xl p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
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
                      <time className="text-xs text-muted-light ml-auto">{article.date}</time>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {article.content.headline}
                    </h3>
                    <p className="text-sm text-muted line-clamp-2">
                      {article.content.summary}
                    </p>
                  </div>

                  {/* Quality Score */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-bold font-mono text-lg ${
                    quality.score >= 80 ? 'bg-green-light text-green' :
                    quality.score >= 60 ? 'bg-yellow-light text-yellow' :
                    'bg-red-light text-red'
                  }`}>
                    {quality.score}
                  </div>
                </div>

                {/* Quality Issues */}
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

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                  <a
                    href={`/article/${article.slug}`}
                    target="_blank"
                    className="text-sm text-accent hover:text-accent-dim font-medium"
                  >
                    View →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
