import { getArticlesByType } from '@/lib/content';
import ArticleCard from '@/components/article/ArticleCard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'News Takes — Financial News Explained Simply',
  description: 'Financial news explained so anyone can understand. No jargon, no predictions — just the facts that matter for your money.',
};

export default function TakesPage() {
  const takes = getArticlesByType('takes');
  const categories = Array.from(new Set(takes.map(a => a.category).filter(Boolean) as string[])).sort();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <Breadcrumbs items={[{ label: 'News' }]} />
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-full bg-card-bg text-muted font-bold font-mono flex items-center justify-center text-lg border border-card-border">
          &#9889;
        </span>
        <div>
          <h1 className="text-2xl font-bold">News Takes</h1>
          <p className="text-sm text-muted">{takes.length} stories explained simply</p>
        </div>
      </div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <span key={cat} className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-md bg-gold/10 text-gold border border-gold/20">
              {cat.toUpperCase()}
            </span>
          ))}
        </div>
      )}
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

      <div className="flex flex-wrap items-center gap-4 mt-10 pt-6 border-t border-card-border">
        <span className="text-xs text-muted-light font-mono">MORE:</span>
        <Link href="/picks" className="text-sm font-semibold text-accent hover:text-accent-dim transition-colors">
          All Picks &rarr;
        </Link>
        <Link href="/roasts" className="text-sm font-semibold text-red hover:text-red/70 transition-colors">
          All Roasts &rarr;
        </Link>
      </div>
    </div>
  );
}
