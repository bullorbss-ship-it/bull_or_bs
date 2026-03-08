import Link from 'next/link';
import { CandidateStock } from '@/lib/types';

interface TournamentProps {
  candidates: CandidateStock[];
  isRoast: boolean;
  /** When true, skip section wrapper (used inside Collapsible) */
  inline?: boolean;
}

export default function Tournament({ candidates, isRoast, inline }: TournamentProps) {
  if (!candidates || candidates.length === 0) return null;

  const content = (
    <div className="space-y-3">
      {candidates.map((c, i) => (
        <div
          key={i}
          className={`border rounded-xl p-4 transition-colors ${
            c.status === 'selected'
              ? 'border-accent bg-accent-light'
              : c.status === 'eliminated'
              ? 'border-card-border bg-card-bg opacity-75'
              : 'border-card-border bg-background'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                c.status === 'selected'
                  ? 'bg-green-light text-green'
                  : c.status === 'eliminated'
                  ? 'bg-red-light text-red'
                  : 'bg-yellow-light text-yellow'
              }`}>
                {c.status === 'selected' ? 'Winner' : c.status === 'eliminated' ? 'Cut' : 'Reviewed'}
              </span>
              <Link href={`/stock/${c.ticker.toLowerCase()}`} className="font-mono font-bold text-foreground hover:text-accent transition-colors text-sm sm:text-base">{c.ticker}</Link>
              <span className="text-muted text-xs sm:text-sm truncate">{c.company}</span>
            </div>
            {c.score && (
              <span className="text-xs font-mono text-muted bg-card-bg px-2 py-1 rounded shrink-0">
                {c.score}/10
              </span>
            )}
          </div>
          <p className="text-sm text-muted leading-relaxed">
            {c.status === 'eliminated' ? c.reasonEliminated : c.reasonConsidered}
          </p>
        </div>
      ))}
    </div>
  );

  if (inline) return content;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-2">The Tournament</h2>
      <p className="text-muted text-sm mb-6">
        {isRoast
          ? 'Stocks they should have considered instead:'
          : 'Every stock we evaluated, and why most didn\'t make the cut:'}
      </p>
      {content}
    </section>
  );
}
