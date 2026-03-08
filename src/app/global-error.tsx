'use client';

import { siteConfig } from '@/config/site';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <div className="text-6xl mb-6 font-mono font-bold text-red">
            F
          </div>

          <h1 className="text-3xl font-bold mb-4">
            Well, that&apos;s embarrassing.
          </h1>

          <p className="text-lg text-muted mb-2">
            Our AI just had a meltdown. Ironic for a site that roasts bad stock picks.
          </p>

          <p className="text-sm text-muted-light mb-8">
            Even our algorithms have bad days. Unlike that newsletter telling you to buy at the top.
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

            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error has no Next.js providers */}
            <a
              href="/"
              className="text-muted hover:text-foreground transition-colors underline underline-offset-4"
            >
              Go home
            </a>
          </div>

          <a
            href={`mailto:${siteConfig.email}?subject=Bug Report&body=Something broke on ${typeof window !== 'undefined' ? window.location.href : 'the site'}%0A%0AError: ${encodeURIComponent(error.message || 'Unknown error')}%0A%0AWhat I was doing: `}
            className="text-xs text-muted-light hover:text-accent transition-colors underline underline-offset-4"
          >
            Report this issue
          </a>
        </div>
      </body>
    </html>
  );
}
