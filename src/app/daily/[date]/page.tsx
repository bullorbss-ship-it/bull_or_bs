import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/content';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ArticleCard from '@/components/article/ArticleCard';
import { BRIEFING_SLOTS, type BriefingSlotId } from '@/lib/rss-feeds';
import { siteConfig } from '@/config/site';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  if (!DATE_RE.test(date)) return { title: 'Daily Briefing' };
  const pretty = formatDate(date);
  return {
    title: `Daily Briefing — ${pretty}`,
    description: `The 4 stories that matter for your money on ${pretty}. Verified sources, plain English, no speculation.`,
    alternates: { canonical: `/daily/${date}` },
    openGraph: {
      title: `Daily Briefing — ${pretty}`,
      description: `4 verified finance & AI stories for ${pretty}.`,
      url: `${siteConfig.url}/daily/${date}`,
      type: 'website',
    },
  };
}

export default async function DailyDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!DATE_RE.test(date)) notFound();

  const dayArticles = getAllArticles().filter(
    a => a.date === date && a.tags?.includes('daily-briefing'),
  );

  if (dayArticles.length === 0) notFound();

  // Group by slot id from tags
  const bySlot = new Map<BriefingSlotId, typeof dayArticles>();
  for (const a of dayArticles) {
    const slotTag = a.tags.find(t =>
      BRIEFING_SLOTS.some(s => s.id === t),
    ) as BriefingSlotId | undefined;
    if (!slotTag) continue;
    const list = bySlot.get(slotTag) || [];
    list.push(a);
    bySlot.set(slotTag, list);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <Breadcrumbs
        items={[
          { label: 'Daily Briefing', href: '/daily' },
          { label: formatDate(date) },
        ]}
      />
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">{formatDate(date)}</h1>
        <p className="text-sm text-muted">
          {dayArticles.length} {dayArticles.length === 1 ? 'story' : 'stories'} summarized from verified sources.
        </p>
      </div>

      <div className="space-y-8">
        {BRIEFING_SLOTS.map(slot => {
          const articles = bySlot.get(slot.id) || [];
          return (
            <section key={slot.id}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-bold font-mono px-2.5 py-1 rounded-md bg-card-bg text-foreground border border-card-border">
                  {slot.label.toUpperCase()}
                </span>
                {articles.length === 0 && (
                  <span className="text-xs text-muted-light italic">
                    No qualifying story today.
                  </span>
                )}
              </div>
              {articles.length > 0 && (
                <div className="grid gap-3">
                  {articles.map(a => (
                    <ArticleCard key={a.slug} article={a} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-10 pt-6 border-t border-card-border">
        <Link
          href="/daily"
          className="text-sm font-semibold text-accent hover:text-accent-dim transition-colors"
        >
          &larr; All daily briefings
        </Link>
      </div>
    </div>
  );
}
