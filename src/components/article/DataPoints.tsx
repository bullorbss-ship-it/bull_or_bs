import { DataPoint } from '@/lib/types';

export default function DataPoints({ dataPoints }: { dataPoints: DataPoint[] }) {
  if (!dataPoints || dataPoints.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">Key Data</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {dataPoints.map((dp, i) => (
          <div key={i} className="border border-card-border bg-card-bg rounded-xl p-4">
            <p className="text-xs text-muted mb-1">{dp.label}</p>
            <p className="text-xl font-bold text-foreground">{dp.value}</p>
            {dp.source && (
              <p className="text-xs text-muted-light mt-1">{dp.source}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
