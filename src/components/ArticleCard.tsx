import Link from 'next/link';
import { Article } from '@/lib/types';

export default function ArticleCard({ article }: { article: Article }) {
  const isRoast = article.type === 'roast';

  return (
    <Link href={`/article/${article.slug}`} className="block group">
      <article className="border border-card-border bg-card-bg rounded-lg p-6 hover:border-accent transition-colors">
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${
            isRoast ? 'bg-red/20 text-red' : 'bg-accent/20 text-accent'
          }`}>
            {isRoast ? 'THE ROAST' : 'AI PICK'}
          </span>
          {article.ticker && (
            <span className="text-xs font-mono text-muted border border-card-border px-2 py-1 rounded">
              ${article.ticker}
            </span>
          )}
          <span className="text-xs font-mono text-muted ml-auto">
            {new Date(article.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors leading-tight mb-2">
          {article.title}
        </h3>
        <p className="text-sm text-muted leading-relaxed line-clamp-2">
          {article.description}
        </p>
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs font-mono text-accent">
            Read full analysis &rarr;
          </span>
        </div>
      </article>
    </Link>
  );
}
