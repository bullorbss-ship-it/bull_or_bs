import Link from 'next/link';
import { Article } from '@/lib/types';

export default function ArticleCard({ article }: { article: Article }) {
  const isRoast = article.type === 'roast';

  return (
    <Link href={`/article/${article.slug}`} className="block group">
      <article className="border border-card-border bg-background rounded-xl p-4 sm:p-6 hover:shadow-lg hover:border-accent/30 transition-all active:scale-[0.99]">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <span className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${
            isRoast ? 'bg-red-light text-red' : 'bg-accent-light text-accent'
          }`}>
            {isRoast ? 'Roast' : 'AI Pick'}
          </span>
          {article.ticker && (
            <span className="text-[10px] sm:text-xs font-mono text-muted bg-card-bg px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              {article.ticker}
            </span>
          )}
          <span className="text-[10px] sm:text-xs text-muted-light ml-auto">
            {new Date(article.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-accent transition-colors leading-snug mb-1.5 sm:mb-2">
          {article.title}
        </h3>
        <p className="text-xs sm:text-sm text-muted leading-relaxed line-clamp-2">
          {article.description}
        </p>
        <p className="text-xs sm:text-sm text-accent font-medium mt-3 sm:mt-4">
          Read full analysis &rarr;
        </p>
      </article>
    </Link>
  );
}
