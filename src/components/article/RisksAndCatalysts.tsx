import { CatalystDetail } from '@/lib/types';
import { inlineFormat } from '@/lib/inline-format';

interface RisksAndCatalystsProps {
  risks: string[];
  catalysts: (string | CatalystDetail)[];
  /** When true, skip section wrapper (used inside Collapsible) */
  inline?: boolean;
}

function renderCatalyst(c: string | CatalystDetail, i: number) {
  if (typeof c === 'string') {
    return (
      <li key={i} className="text-sm text-foreground flex gap-2 leading-relaxed">
        <span className="text-green shrink-0 mt-1">&bull;</span>
        <span className="break-words min-w-0" dangerouslySetInnerHTML={{ __html: inlineFormat(c) }} />
      </li>
    );
  }

  return (
    <li key={i} className="text-sm text-foreground leading-relaxed mb-3 last:mb-0">
      <div className="flex gap-2">
        <span className="text-green shrink-0 mt-1">&bull;</span>
        <div>
          <p className="font-medium" dangerouslySetInnerHTML={{ __html: inlineFormat(c.claimed) }} />
          <p className="text-muted mt-1" dangerouslySetInnerHTML={{ __html: inlineFormat(c.actual) }} />
          {c.confidence && (
            <p className="text-xs text-muted-light mt-1 font-mono">
              Confidence: {c.confidence}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

export default function RisksAndCatalysts({ risks, catalysts, inline }: RisksAndCatalystsProps) {
  if ((!risks || risks.length === 0) && (!catalysts || catalysts.length === 0)) return null;

  const content = (
    <div className="grid sm:grid-cols-2 gap-4">
      {risks && risks.length > 0 && (
        <div className="border border-card-border bg-red-light rounded-xl p-4 sm:p-6">
          <h3 className="text-sm font-bold text-red mb-3">Risks They Missed</h3>
          <ul className="space-y-2">
            {risks.map((r, i) => (
              <li key={i} className="text-sm text-foreground flex gap-2 leading-relaxed">
                <span className="text-red shrink-0 mt-1">&bull;</span>
                <span className="break-words min-w-0" dangerouslySetInnerHTML={{ __html: inlineFormat(r) }} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {catalysts && catalysts.length > 0 && (
        <div className="border border-card-border bg-green-light rounded-xl p-4 sm:p-6">
          <h3 className="text-sm font-bold text-green mb-3">Catalysts</h3>
          <ul className="space-y-2">
            {catalysts.map((c, i) => renderCatalyst(c, i))}
          </ul>
        </div>
      )}
    </div>
  );

  if (inline) return content;

  return (
    <div className="mb-10">
      {content}
    </div>
  );
}
