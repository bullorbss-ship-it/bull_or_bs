'use client';

import { useState } from 'react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage('You\'re in. Watch your inbox.');
        setEmail('');
      } else {
        const data = await res.json();
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 bg-background border border-card-border rounded px-4 py-3 text-foreground font-mono text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-accent text-background font-mono font-bold px-6 py-3 rounded hover:bg-accent-dim transition-colors disabled:opacity-50 text-sm"
      >
        {status === 'loading' ? 'Joining...' : 'Subscribe'}
      </button>
      {status !== 'idle' && (
        <p className={`text-sm font-mono mt-1 sm:mt-0 sm:self-center ${status === 'success' ? 'text-accent' : 'text-red'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
