'use client';

import { useEffect, useState } from 'react';
import type { EditorialDraft, EditorialPlan } from '@/lib/types';

interface StageStatus {
  stage: string;
  provider: string;
  model: string;
  configured: boolean;
  isolated: boolean;
  duplicateKeyWith?: string;
  webSearch: boolean;
}

function nextMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 7);
}

export default function EditorialWorkflow() {
  const [plans, setPlans] = useState<EditorialPlan[]>([]);
  const [drafts, setDrafts] = useState<EditorialDraft[]>([]);
  const [stages, setStages] = useState<StageStatus[]>([]);
  const [executionMode, setExecutionMode] = useState<'agent' | 'api'>('agent');
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const [planRes, draftRes, providerRes] = await Promise.all([
      fetch('/api/admin/editorial-plan'),
      fetch('/api/admin/drafts'),
      fetch('/api/admin/provider'),
    ]);
    if (planRes.ok) setPlans((await planRes.json()).plans || []);
    if (draftRes.ok) setDrafts((await draftRes.json()).drafts || []);
    if (providerRes.ok) {
      const provider = await providerRes.json();
      setStages(provider.stages || []);
      setExecutionMode(provider.executionMode === 'api' ? 'api' : 'agent');
    }
  }

  useEffect(() => {
    // Initial hydration from authenticated admin endpoints.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  async function planAction(action: string, month: string) {
    setBusy(`${action}-${month}`);
    setMessage('');
    const response = await fetch('/api/admin/editorial-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, month }),
    });
    const data = await response.json();
    setMessage(response.ok ? `Plan ${action} completed.` : data.detail || data.error || 'Action failed');
    setBusy('');
    await load();
  }

  async function draftAction(action: string, id: string) {
    setBusy(`${action}-${id}`);
    setMessage('');
    const response = await fetch('/api/admin/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id }),
    });
    const data = await response.json();
    setMessage(response.ok
      ? action === 'publish' ? 'Approved and queued for publication.' : 'Draft rejected.'
      : [...(data.issues || []), data.error].filter(Boolean).join(' · '));
    setBusy('');
    await load();
  }

  return (
    <div className="space-y-8">
      <section className="border border-card-border rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-lg">Pipeline readiness</h2>
            <p className="text-sm text-muted mt-1">
              {executionMode === 'agent'
                ? 'Your active coding assistant runs the guarded workflow—no model API keys required.'
                : 'Unattended API mode uses an isolated model and key for every stage.'}
            </p>
          </div>
          <button onClick={load} className="text-sm text-accent hover:underline">Refresh</button>
        </div>
        {executionMode === 'agent' ? (
          <div className="mt-4 border border-accent/30 bg-accent/5 rounded-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs uppercase">Assistant-operated</span>
              <span className="text-xs font-bold text-accent">READY</span>
            </div>
            <p className="text-sm mt-2">
              Ask <code className="font-mono text-xs bg-card-bg px-1.5 py-0.5 rounded">Read EDITORIAL_WORKFLOW.md and run today&apos;s pipeline</code> from
              any coding assistant. Planning, research, writing, and verification run as separate passes.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {stages.map(stage => (
              <div key={stage.stage} className="border border-card-border rounded-lg p-3">
                <div className="flex justify-between gap-2">
                  <span className="font-mono text-xs uppercase">{stage.stage}</span>
                  <span className={`text-xs font-bold ${stage.configured && stage.isolated ? 'text-accent' : 'text-red'}`}>
                    {!stage.configured ? 'KEY MISSING' : stage.isolated ? 'READY' : `SHARED WITH ${stage.duplicateKeyWith}`}
                  </span>
                </div>
                <p className="text-sm font-semibold mt-1">{stage.model}</p>
                <p className="text-xs text-muted">{stage.provider}{stage.webSearch ? ' · web search' : ''}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-bold text-lg">Monthly plans</h2>
            <p className="text-sm text-muted">Research remains paused until a plan is approved.</p>
          </div>
          {executionMode === 'api' ? (
            <button
              disabled={Boolean(busy)}
              onClick={() => planAction('generate', nextMonth())}
              className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              Generate {nextMonth()}
            </button>
          ) : (
            <code className="font-mono text-xs bg-card-bg border border-card-border px-3 py-2 rounded-lg">
              Read EDITORIAL_WORKFLOW.md and plan {nextMonth()}
            </code>
          )}
        </div>
        <div className="space-y-4">
          {plans.length === 0 && <p className="text-sm text-muted">No plans yet.</p>}
          {plans.map(plan => (
            <div key={plan.month} className="border border-card-border rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold">{plan.month}</h3>
                  <p className="text-xs text-muted">{plan.items.length} weekday assignments · {plan.model}</p>
                </div>
                <span className="font-mono text-xs uppercase px-2 py-1 bg-card-bg rounded">{plan.status}</span>
              </div>
              <div className="max-h-80 overflow-auto mt-4 divide-y divide-card-border">
                {plan.items.map(item => (
                  <div key={item.id} className="py-3">
                    <div className="flex gap-3 justify-between">
                      <p className="font-semibold text-sm">{item.title}</p>
                      <span className="text-xs font-mono text-muted shrink-0">{item.publishDate}</span>
                    </div>
                    <p className="text-xs text-muted mt-1">{item.angle}</p>
                    <p className="text-xs text-accent mt-1">Original asset: {item.uniqueAsset}</p>
                  </div>
                ))}
              </div>
              {plan.status === 'pending_approval' && (
                <div className="flex gap-2 mt-4">
                  <button
                    disabled={Boolean(busy)}
                    onClick={() => planAction('approve', plan.month)}
                    className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    Approve plan
                  </button>
                  <button
                    disabled={Boolean(busy)}
                    onClick={() => planAction('reject', plan.month)}
                    className="border border-red text-red px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-bold text-lg">Morning drafts</h2>
        <p className="text-sm text-muted mt-1 mb-4">Approval publishes only drafts that pass evidence and verification gates.</p>
        <div className="space-y-4">
          {drafts.length === 0 && <p className="text-sm text-muted">No drafts yet.</p>}
          {drafts.map(draft => (
            <div key={draft.id} className="border border-card-border rounded-xl p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h3 className="font-bold">{draft.article.title}</h3>
                  <p className="text-xs text-muted mt-1">
                    {draft.research.sources.length} sources · research {draft.research.model} · writer {draft.writerModel} · verifier {draft.verification.model}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${draft.quality.passed ? 'text-accent' : 'text-red'}`}>{draft.quality.score}/100</p>
                  <p className="text-xs font-mono uppercase">{draft.status}</p>
                </div>
              </div>
              <p className="text-sm text-muted mt-3">{draft.article.description}</p>
              <details className="mt-4 border border-card-border rounded-lg p-3">
                <summary className="cursor-pointer text-sm font-semibold">Review evidence and draft</summary>
                <div className="mt-4 space-y-5">
                  <div>
                    <h4 className="text-xs font-mono uppercase text-muted mb-2">Research findings</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {draft.research.keyFindings.map(finding => <li key={finding}>{finding}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-mono uppercase text-muted mb-2">Uncertainties</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {draft.research.uncertainties.map(uncertainty => <li key={uncertainty}>{uncertainty}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-mono uppercase text-muted mb-2">Sources</h4>
                    <ol className="list-decimal pl-5 text-sm space-y-1">
                      {draft.research.sources.map(source => (
                        <li key={source.url}>
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                            {source.publisher} — {source.title}
                          </a>
                          <span className="text-xs text-muted"> · {source.sourceType}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h4 className="text-xs font-mono uppercase text-muted mb-2">Draft article</h4>
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-card-bg rounded-lg p-4 max-h-[32rem] overflow-auto">
                      {draft.article.content.analysis}
                    </pre>
                  </div>
                </div>
              </details>
              {draft.quality.issues.length > 0 && (
                <ul className="list-disc pl-5 text-xs text-red mt-3 space-y-1">
                  {draft.quality.issues.map(issue => <li key={issue}>{issue}</li>)}
                </ul>
              )}
              {draft.status === 'pending_approval' && (
                <div className="flex gap-2 mt-4">
                  <button
                    disabled={Boolean(busy) || !draft.quality.passed}
                    onClick={() => draftAction('publish', draft.id)}
                    className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
                  >
                    Approve &amp; publish
                  </button>
                  <button
                    disabled={Boolean(busy)}
                    onClick={() => draftAction('reject', draft.id)}
                    className="border border-red text-red px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {message && <p className="text-sm bg-card-bg border border-card-border rounded-lg p-3">{message}</p>}
    </div>
  );
}
