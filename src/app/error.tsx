'use client';

import Link from 'next/link';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <div className="grade-badge grade-badge-xl grade-D mx-auto mb-6">
        !
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        Well, that&apos;s BS.
      </h1>

      <p className="text-lg text-muted mb-2">
        Something went wrong loading this page.
      </p>
      <p className="text-sm text-muted-light mb-8">
        Even our servers have bad days. Unlike some stock picks, we&apos;ll actually recover from this.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="inline-block bg-accent text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>

        <Link
          href="/"
          className="text-muted hover:text-foreground transition-colors underline underline-offset-4"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
