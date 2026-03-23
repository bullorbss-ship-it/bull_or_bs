'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getArticleBadge, getTickerBadgeStyle, getCategoryChipStyle } from '@/lib/badges';
import { siteConfig } from '@/config/site';
import type { Article } from '@/lib/types';

const BATCH_SIZE = 5;

function getArticleImage(article: Article): string {
  if (article.heroImage?.url) return article.heroImage.url;
  const grade = article.type === 'take' ? '' : (article.verdict?.match(/\b(\d{1,2})\/10\b/)?.[1] || '');
  return `${siteConfig.url}/og?type=article&title=${encodeURIComponent(article.title)}&grade=${encodeURIComponent(grade)}&articleType=${article.type}&ticker=${encodeURIComponent(article.ticker || '')}&source=${encodeURIComponent(article.content?.newsSource || '')}&v=${encodeURIComponent(article.date || '1')}`;
}

function formatDate(date: string, short = false) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(short ? {} : { year: 'numeric' }),
  });
}

interface ArticleStreamProps {
  articles: Article[];
  /** Number of articles already visible in the desktop grid — hide those on lg */
  desktopGridCount: number;
}

export default function ArticleStream({ articles, desktopGridCount }: ArticleStreamProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const hasMore = visibleCount < articles.length;

  return (
    <div className="relative">
      <div className="divide-y divide-card-border">
        {articles.slice(0, visibleCount).map((article, i) => {
          const badge = getArticleBadge(article.type, article.category);
          const imageUrl = getArticleImage(article);
          return (
            <Link
              key={article.slug}
              href={`/article/${article.slug}`}
              className={`flex gap-3 sm:gap-4 py-4 sm:py-5 group ${i < desktopGridCount ? 'lg:hidden' : ''}`}
            >
              {/* Thumbnail */}
              <div className="shrink-0 w-[100px] h-[68px] sm:w-[160px] sm:h-[100px] rounded-lg overflow-hidden bg-card-border/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                  <span className={`text-[9px] sm:text-[10px] font-bold font-mono px-1.5 sm:px-2 py-0.5 rounded ${badge.style}`}>
                    {badge.label}
                  </span>
                  {article.category && article.type === 'take' && (
                    <span className={`text-[9px] sm:text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${getCategoryChipStyle(article.category)}`}>
                      {article.category.toUpperCase()}
                    </span>
                  )}
                  {article.ticker && (
                    <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded ${getTickerBadgeStyle(article.ticker)}`}>
                      {article.ticker}
                    </span>
                  )}
                  <span className="text-[9px] sm:text-[10px] font-mono text-muted-light ml-auto whitespace-nowrap">
                    {formatDate(article.date, true)}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-accent transition-colors leading-snug line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed line-clamp-1 sm:line-clamp-2 mt-0.5 sm:mt-1">
                  {article.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Shadow fade + show more button */}
      {hasMore && (
        <div className="relative">
          {/* Gradient fade over last article */}
          <div className="absolute -top-20 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          {/* Show more button */}
          <button
            onClick={() => setVisibleCount(prev => prev + BATCH_SIZE)}
            className="w-full flex items-center justify-center gap-2 py-3 mt-1 text-sm font-semibold text-accent hover:text-accent-dim transition-colors group cursor-pointer"
          >
            <span>Show more</span>
            <svg
              className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
