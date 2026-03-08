'use client';

import Link from 'next/link';
import { siteConfig } from '@/config/site';

const ROAST_LINES = [
  "This article crashed harder than a meme stock on earnings day.",
  "Our AI gave this page a grade F for 'Failed to Load.'",
  "Even our algorithm knows when to cut its losses.",
  "This page just got margin called.",
  "Looks like this analysis got delisted.",
  "Our AI went to buy the dip... and fell in.",
  "This page is performing worse than a SPAC in 2022.",
];

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const roastLine = ROAST_LINES[Math.floor(Math.random() * ROAST_LINES.length)];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <div className="grade-badge grade-badge-xl grade-F mx-auto mb-6">
        !
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold mb-4">
        {roastLine}
      </h1>

      <p className="text-muted mb-2">
        Something went wrong loading this analysis. We&apos;re on it.
      </p>

      <p className="text-sm text-muted-light mb-8">
        Don&apos;t worry — your portfolio is probably fine. This page, not so much.
      </p>

      {error.digest && (
        <p className="text-xs font-mono text-muted-light mb-6">
          Error ID: {error.digest}
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <button
          onClick={reset}
          className="bg-accent text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>

        <Link
          href="/"
          className="text-muted hover:text-foreground transition-colors underline underline-offset-4"
        >
          Back to safety
        </Link>
      </div>

      <div className="border border-card-border rounded-xl p-6 bg-card-bg max-w-sm mx-auto">
        <p className="text-sm font-medium mb-3">Something look wrong?</p>
        <a
          href={`mailto:${siteConfig.email}?subject=Bug Report: Article Error&body=Article URL: ${typeof window !== 'undefined' ? window.location.href : ''}%0A%0AError: ${encodeURIComponent(error.message || 'Unknown')}%0A%0AWhat happened: `}
          className="inline-block text-sm text-accent hover:text-accent/80 transition-colors underline underline-offset-4"
        >
          Report this bug
        </a>
        <p className="text-xs text-muted-light mt-2">
          We read every report. Unlike some newsletters and their buy recommendations.
        </p>
      </div>
    </div>
  );
}
