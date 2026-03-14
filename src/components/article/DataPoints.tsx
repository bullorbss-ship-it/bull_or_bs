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
          <div key={i} className="border border-card-border bg-card-bg rounded-xl p-3 sm:p-4">
            <p className="text-xs text-muted mb-1">{dp.label}</p>
            <p className="text-lg sm:text-xl font-bold text-foreground">{dp.value}</p>
            {sourceText && (
              <p className="text-[10px] text-muted-light mt-1.5 flex items-center gap-1">
                <span className="opacity-60">&#9432;</span>
                {dp.sourceUrl ? (
                  <a href={dp.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    {sourceText}
                  </a>
                ) : (
                  sourceText
                )}
              </p>
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
