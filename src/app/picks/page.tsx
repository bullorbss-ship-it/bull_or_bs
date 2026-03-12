import { getArticlesByType } from '@/lib/content';
import ArticleCard from '@/components/article/ArticleCard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Link from 'next/link';
import type { Metadata } from 'next';

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
        <span className="w-10 h-10 rounded-full bg-accent-light text-accent font-bold font-mono flex items-center justify-center text-base">
          10
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

      <div className="flex flex-wrap items-center gap-4 mt-10 pt-6 border-t border-card-border">
        <span className="text-xs text-muted-light font-mono">MORE:</span>
        <Link href="/roasts" className="text-sm font-semibold text-red hover:text-red/70 transition-colors">
          All Roasts &rarr;
        </Link>
        <Link href="/takes" className="text-sm font-semibold text-gold hover:text-gold/70 transition-colors">
          All News &rarr;
        </Link>
      </div>
    </div>
  );
}
