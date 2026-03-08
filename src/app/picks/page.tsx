import { getArticlesByType } from '@/lib/content';
import ArticleCard from '@/components/article/ArticleCard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'All AI Picks — Weekly Stock Tournaments',
  description: 'Every AI-powered stock pick from our weekly elimination tournaments. See our full track record.',
};

export default function PicksPage() {
  const picks = getArticlesByType('picks');

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <Breadcrumbs items={[{ label: 'AI Picks' }]} />
      <div className="flex items-center gap-3 mb-8">
        <span className="w-10 h-10 rounded-lg bg-gold-light text-gold font-bold font-mono flex items-center justify-center text-lg">
          A
        </span>
        <div>
          <h1 className="text-2xl font-bold">All AI Picks</h1>
          <p className="text-sm text-muted">{picks.length} weekly tournaments</p>
        </div>
      </div>
      <div className="space-y-3">
        {picks.map(article => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
