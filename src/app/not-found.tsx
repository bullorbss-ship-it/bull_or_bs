import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <div className="grade-badge grade-badge-xl grade-F mx-auto mb-6">
        404
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        Page Not Found
      </h1>

      <p className="text-lg text-muted mb-8">
        This page doesn&apos;t exist. Maybe the stock got delisted?
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/stock"
          className="inline-block bg-accent text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          Browse 61+ Stock Analyses &rarr;
        </Link>

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
