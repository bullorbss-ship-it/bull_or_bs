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
        setMessage('You\'re in. Check your inbox.');
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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
      <input
        type="email"
        required
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 border border-card-border bg-background rounded-lg px-4 py-3 text-foreground text-sm placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-accent text-white font-semibold px-6 py-3 rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
      >
        {status === 'loading' ? 'Joining...' : 'Get Free Analysis'}
      </button>
      {status !== 'idle' && (
        <p className={`text-sm mt-1 sm:mt-0 sm:self-center ${status === 'success' ? 'text-green' : 'text-red'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
