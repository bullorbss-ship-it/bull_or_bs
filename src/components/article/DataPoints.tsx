import { DataPoint } from '@/lib/types';

interface Provenance {
  type: string;
  newsSource?: string;
  newsUrl?: string;
}

interface DataPointsProps {
  dataPoints: DataPoint[];
  /** When true, skip section wrapper (used inside Collapsible) */
  inline?: boolean;
  /** Fallback source context when dp.source is missing */
  provenance?: Provenance;
}

function getSourceText(dp: DataPoint, provenance?: Provenance): string | null {
  if (dp.source) return dp.source;
  if (!provenance) return null;
  if (provenance.type === 'take' && provenance.newsSource) return provenance.newsSource;
  if (provenance.type === 'roast' || provenance.type === 'pick') return 'Pasted research data';
  return 'AI analysis';
}

export default function DataPoints({ dataPoints, inline, provenance }: DataPointsProps) {
  if (!dataPoints || dataPoints.length === 0) return null;

  const content = (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {dataPoints.map((dp, i) => {
        const sourceText = getSourceText(dp, provenance);
        return (
          <div key={i} className="group relative border border-card-border bg-card-bg rounded-xl p-3 sm:p-4">
            <p className="text-xs text-muted mb-1">{dp.label}</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-lg sm:text-xl font-bold text-foreground">{dp.value}</p>
              {sourceText && (
                <span className="text-muted-light cursor-help text-xs flex-shrink-0" tabIndex={0} aria-label={`Source: ${sourceText}`}>
                  &#9432;
                </span>
              )}
            </div>
            {/* Tooltip */}
            {sourceText && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground text-background text-[11px] rounded-lg whitespace-nowrap invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity z-10 pointer-events-none max-w-[200px] truncate">
                {sourceText}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  if (inline) return content;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">Key Data</h2>
      {content}
    </section>
  );
}
