import { getArticlesByType } from '@/lib/content';
import ArticleCard from '@/components/article/ArticleCard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Roasts — Stock Recommendation Audits',
  description: 'Every stock recommendation we\'ve audited, scored 1 to 10. See which picks held up and which were BS.',
  alternates: { canonical: '/roasts' },
};

export default function RoastsPage() {
  const roasts = getArticlesByType('roasts');

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <Breadcrumbs items={[{ label: 'Roasts' }]} />
      <div className="flex items-center gap-3 mb-8">
        <span className="w-10 h-10 rounded-full bg-red-light text-red font-bold font-mono flex items-center justify-center text-base">
          {roasts.length}
        </span>
        <div>
          <h1 className="text-2xl font-bold">All Roasts</h1>
          <p className="text-sm text-muted">{roasts.length} recommendation audits</p>
        </div>
      </div>
      <div className="space-y-3">
        {roasts.map(article => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-10 pt-6 border-t border-card-border">
        <span className="text-xs text-muted-light font-mono">MORE:</span>
        <Link href="/picks" className="text-sm font-semibold text-accent hover:text-accent-dim transition-colors">
          All Picks &rarr;
        </Link>
        <Link href="/takes" className="text-sm font-semibold text-gold hover:text-gold/70 transition-colors">
          All News &rarr;
        </Link>
      </div>
    </div>
  );
}
