'use client';

import { useState, ReactNode } from 'react';

interface CollapsibleProps {
  title: string;
  /** Optional icon/badge to show left of title */
  icon?: ReactNode;
  /** Start expanded? Default false */
  defaultOpen?: boolean;
  /** Number badge (e.g. "5 items") shown in muted text */
  badge?: string;
  /** Visual variant */
  variant?: 'default' | 'accent' | 'subtle';
  children: ReactNode;
}

export default function Collapsible({
  title,
  icon,
  defaultOpen = false,
  badge,
  variant = 'default',
  children,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const borderClass =
    variant === 'accent'
      ? 'border-accent/20'
      : variant === 'subtle'
      ? 'border-transparent'
      : 'border-card-border';

  return (
    <div className={`border ${borderClass} rounded-xl overflow-hidden mb-4`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-card-bg/50 transition-colors active:bg-card-bg"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="font-semibold text-foreground truncate">{title}</span>
          {badge && (
            <span className="text-xs text-muted-light font-mono shrink-0">{badge}</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-muted-light shrink-0 ml-3 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
