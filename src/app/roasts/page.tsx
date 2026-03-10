import { getArticlesByType } from '@/lib/content';
import ArticleCard from '@/components/article/ArticleCard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Roasts — Stock Recommendation Audits',
  description: 'Every stock recommendation we\'ve audited, graded A through F. See which picks held up and which were BS.',
};

export default function RoastsPage() {
  const roasts = getArticlesByType('roasts');

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <Breadcrumbs items={[{ label: 'Roasts' }]} />
      <div className="flex items-center gap-3 mb-8">
        <span className="w-10 h-10 rounded-lg bg-red-light text-red font-bold font-mono flex items-center justify-center text-lg">
          F
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
    </div>
  );
}
