import { getArticlesByType } from '@/lib/content';
import ArticleCard from '@/components/article/ArticleCard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'News Takes — Financial News Explained Simply',
  description: 'Financial news explained so anyone can understand. No jargon, no predictions — just the facts that matter for your money.',
};

export default function TakesPage() {
  const takes = getArticlesByType('takes');

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <Breadcrumbs items={[{ label: 'News' }]} />
      <div className="flex items-center gap-3 mb-8">
        <span className="w-10 h-10 rounded-full bg-card-bg text-muted font-bold font-mono flex items-center justify-center text-lg border border-card-border">
          &#9889;
        </span>
        <div>
          <h1 className="text-2xl font-bold">News Takes</h1>
          <p className="text-sm text-muted">{takes.length} stories explained simply</p>
        </div>
      </div>
      {takes.length > 0 ? (
        <div className="space-y-3">
          {takes.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-card-border rounded-xl p-6 text-center">
          <p className="text-muted text-sm">First news take coming soon.</p>
        </div>
      )}
    </div>
  );
}
