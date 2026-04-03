'use client';

import { useState, useEffect, useCallback } from 'react';
import { trackEvent } from '@/lib/tracking';

const STORAGE_KEY = 'bullorbs_popup';
const DISMISS_DAYS = 7;
const DELAY_MS = 30_000;

function shouldShow(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return true;
    const { dismissed, subscribed } = JSON.parse(stored);
    if (subscribed) return false;
    if (dismissed) {
      const expiry = new Date(dismissed).getTime() + DISMISS_DAYS * 86400000;
      return Date.now() > expiry;
    }
    return true;
  } catch {
    return true;
  }
}

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState('');
  const [formOk, setFormOk] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setFormOk(true);
        setFormMsg("You're in. Check your inbox.");
        setEmail('');
        trackEvent('subscribe', { method: 'email' });
        onSubscribed();
      } else {
        const data = await res.json();
        setFormOk(false);
        setFormMsg(data.error || 'Something went wrong.');
      }
    } catch {
      setFormOk(false);
      setFormMsg('Network error. Try again.');
    }
    setSubmitting(false);
  }

  const show = useCallback(() => {
    if (!shouldShow()) return;
    setVisible(true);
    setTriggered(true);
  }, []);

  useEffect(() => {
    if (triggered) return;

    const timer = setTimeout(show, DELAY_MS);
    return () => clearTimeout(timer);
  }, [triggered, show]);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissed: new Date().toISOString() }));
    } catch { /* localStorage unavailable */ }
  }

  function onSubscribed() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ subscribed: true }));
    } catch { /* localStorage unavailable */ }
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Subscribe to newsletter"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-background border border-card-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-muted-light hover:text-foreground transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-card-bg"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Content */}
        <div className="text-center mb-5">
          <p className="text-xs font-mono tracking-[0.15em] text-accent mb-2">FREE WEEKLY ANALYSIS</p>
          <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-2">
            Stop guessing.<br />Start fact-checking.
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            AI-driven stock analysis delivered to your inbox. Every claim checked, every source cited. No paywall.
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border border-card-border bg-background rounded-lg px-3 py-2 text-foreground text-sm placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent text-white font-semibold px-4 py-2 rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
          >
            {submitting ? 'Joining...' : 'Get Free Analysis'}
          </button>
        </form>
        {formMsg && (
          <p className={`text-xs mt-2 text-center ${formOk ? 'text-green' : 'text-red'}`}>{formMsg}</p>
        )}

        <p className="text-muted-light text-[10px] text-center mt-3">
          No spam. Unsubscribe anytime. We respect your inbox.
        </p>
      </div>
    </div>
  );
}
