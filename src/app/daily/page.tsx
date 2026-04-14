import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/content';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ArticleCard from '@/components/article/ArticleCard';
import { BRIEFING_SLOTS } from '@/lib/rss-feeds';
import type { Article } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Daily Briefing — 4 Verified Finance & AI Stories Every Morning',
  description:
    'Four trending stories a day across AI, Markets, Canada, and Global — summarized in plain English with verified sources. No LinkedIn noise, no speculation.',
  alternates: { canonical: '/daily' },
};

function groupByDate(articles: Article[]): Map<string, Article[]> {
  const map = new Map<string, Article[]>();
  for (const a of articles) {
    const existing = map.get(a.date) || [];
    existing.push(a);
    map.set(a.date, existing);
  }
  return map;
}

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DailyIndexPage() {
  const briefingArticles = getAllArticles().filter(a => a.tags?.includes('daily-briefing'));
  const grouped = groupByDate(briefingArticles);
  const days = Array.from(grouped.keys()).sort().reverse().slice(0, 14);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <Breadcrumbs items={[{ label: 'Daily Briefing' }]} />
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-full bg-card-bg text-accent font-bold font-mono flex items-center justify-center text-lg border border-card-border">
          &#9889;
        </span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Daily Briefing</h1>
          <p className="text-sm text-muted">
            4 verified stories a day — AI, Markets, Canada, Global. No speculation. No filler.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {BRIEFING_SLOTS.map(slot => (
          <span
            key={slot.id}
            className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-md bg-card-bg text-muted border border-card-border"
          >
            {slot.label.toUpperCase()}
          </span>
        ))}
      </div>

      {days.length === 0 ? (
        <div className="border border-dashed border-card-border rounded-xl p-6 text-center">
          <p className="text-muted text-sm">First daily briefing coming soon.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {days.map(date => {
            const dayArticles = grouped.get(date) || [];
            return (
              <section key={date}>
                <div className="flex items-end justify-between mb-4 pb-2 border-b border-card-border">
                  <h2 className="text-lg font-semibold">
                    <Link
                      href={`/daily/${date}`}
                      className="hover:text-accent transition-colors"
                    >
                      {formatDate(date)}
                    </Link>
                  </h2>
                  <span className="text-xs text-muted-light font-mono">
                    {dayArticles.length}/4 · <Link href={`/daily/${date}`} className="text-accent hover:text-accent-dim">View day →</Link>
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {dayArticles.map(a => (
                    <ArticleCard key={a.slug} article={a} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mt-12 pt-6 border-t border-card-border">
        <span className="text-xs text-muted-light font-mono">MORE:</span>
        <Link href="/takes" className="text-sm font-semibold text-accent hover:text-accent-dim transition-colors">
          All News Takes &rarr;
        </Link>
        <Link href="/roasts" className="text-sm font-semibold text-red hover:text-red/70 transition-colors">
          All Roasts &rarr;
        </Link>
      </div>
    </div>
  );
}
