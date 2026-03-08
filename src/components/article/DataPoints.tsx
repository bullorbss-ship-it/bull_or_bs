import { DataPoint } from '@/lib/types';

interface DataPointsProps {
  dataPoints: DataPoint[];
  /** When true, skip section wrapper (used inside Collapsible) */
  inline?: boolean;
}

export default function DataPoints({ dataPoints, inline }: DataPointsProps) {
  if (!dataPoints || dataPoints.length === 0) return null;

  const content = (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {dataPoints.map((dp, i) => (
        <div key={i} className="border border-card-border bg-card-bg rounded-xl p-3 sm:p-4">
          <p className="text-xs text-muted mb-1">{dp.label}</p>
          <p className="text-lg sm:text-xl font-bold text-foreground">{dp.value}</p>
          {dp.source && (
            <p className="text-xs text-muted-light mt-1">{dp.source}</p>
          )}
        </div>
      ))}
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
