interface RisksAndCatalystsProps {
  risks: string[];
  catalysts: string[];
}

export default function RisksAndCatalysts({ risks, catalysts }: RisksAndCatalystsProps) {
  if ((!risks || risks.length === 0) && (!catalysts || catalysts.length === 0)) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-10">
      {risks && risks.length > 0 && (
        <div className="border border-card-border bg-red-light rounded-xl p-6">
          <h3 className="text-sm font-bold text-red mb-3">Risks They Missed</h3>
          <ul className="space-y-2">
            {risks.map((r, i) => (
              <li key={i} className="text-sm text-foreground flex gap-2 leading-relaxed">
                <span className="text-red shrink-0 mt-1">&bull;</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
      {catalysts && catalysts.length > 0 && (
        <div className="border border-card-border bg-green-light rounded-xl p-6">
          <h3 className="text-sm font-bold text-green mb-3">Catalysts</h3>
          <ul className="space-y-2">
            {catalysts.map((c, i) => (
              <li key={i} className="text-sm text-foreground flex gap-2 leading-relaxed">
                <span className="text-green shrink-0 mt-1">&bull;</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
