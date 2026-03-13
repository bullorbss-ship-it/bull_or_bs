import Link from 'next/link';
import { Article } from '@/lib/types';
import { getArticleBadge, getTickerBadgeStyle, getArticleIcon, getArticleGradient } from '@/lib/badges';

export default function ArticleCard({ article }: { article: Article }) {
  const badge = getArticleBadge(article.type, article.category);
  const icon = getArticleIcon(article.type, article.category);
  const gradient = getArticleGradient(article.type, article.category);

  // Pull a key stat if available
  const dp = article.content?.dataPoints;
  const stat = dp?.find(d => /[\$%]/.test(d.value)) || dp?.[0];

  return (
    <Link href={`/article/${article.slug}`} className="block group">
      <article className="border border-card-border bg-background rounded-xl overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all active:scale-[0.99]">
        {/* Gradient strip */}
        <div className={`h-1 bg-gradient-to-r ${gradient}`} />
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <span className="text-lg sm:text-xl" aria-hidden="true">{icon}</span>
            <span className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${badge.style}`}>
              {badge.label}
            </span>
            {article.ticker && (
              <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${getTickerBadgeStyle(article.ticker)}`}>
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
          {stat && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-card-border/30 rounded px-2 py-1">
              <span className="text-[9px] font-mono text-muted-light uppercase">{stat.label}:</span>
              <span className="text-[11px] font-bold font-mono text-foreground">{stat.value}</span>
            </div>
          )}
          <p className="text-xs sm:text-sm text-accent font-medium mt-3 sm:mt-4">
            Read full analysis &rarr;
          </p>
        </div>
      </article>
    </Link>
  );
}
