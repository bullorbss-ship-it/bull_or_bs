'use client';

interface ScoreGaugeProps {
  score: string; // "7" (new) or "A" (legacy)
  size?: 'sm' | 'md' | 'lg';
}

function getColor(score: string): { main: string; bg: string; label: string } {
  const n = parseInt(score, 10);
  if (!isNaN(n)) {
    if (n >= 8) return { main: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', label: 'Great' };
    if (n >= 6) return { main: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', label: 'Decent' };
    if (n >= 4) return { main: '#F97316', bg: 'rgba(249, 115, 22, 0.12)', label: 'Weak' };
    return { main: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', label: 'Bad' };
  }
  // Legacy letter grades
  if (score === 'A') return { main: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', label: '' };
  if (score === 'B') return { main: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', label: '' };
  if (score === 'C') return { main: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', label: '' };
  if (score === 'D') return { main: '#F97316', bg: 'rgba(249, 115, 22, 0.12)', label: '' };
  return { main: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', label: '' };
}

const SIZES = {
  sm: { outer: 48, stroke: 4, fontSize: 16, labelSize: 0 },
  md: { outer: 80, stroke: 5, fontSize: 28, labelSize: 10 },
  lg: { outer: 120, stroke: 6, fontSize: 44, labelSize: 12 },
};

export default function ScoreGauge({ score, size = 'lg' }: ScoreGaugeProps) {
  const { main, bg, label } = getColor(score);
  const { outer, stroke, fontSize, labelSize } = SIZES[size];
  const isNumeric = !isNaN(parseInt(score, 10));
  const numScore = parseInt(score, 10);

  const radius = (outer - stroke * 2) / 2;
  const center = outer / 2;
  // Arc goes from 135° to 405° (270° sweep)
  const startAngle = 135;
  const endAngle = 405;
  const totalArc = endAngle - startAngle; // 270°
  const circumference = 2 * Math.PI * radius;
  const arcLength = (totalArc / 360) * circumference;

  // How much of the arc to fill (0-1)
  const fillRatio = isNumeric ? Math.max(0, Math.min(1, (numScore - 1) / 9)) : 0.5;
  const filledLength = arcLength * fillRatio;
  const emptyLength = arcLength - filledLength;

  // Pointer position
  const pointerAngle = startAngle + totalArc * fillRatio;
  const pointerRad = (pointerAngle * Math.PI) / 180;
  const pointerX = center + radius * Math.cos(pointerRad);
  const pointerY = center + radius * Math.sin(pointerRad);

  function describeArc(r: number, start: number, end: number): string {
    const startRad = (start * Math.PI) / 180;
    const endRad = (end * Math.PI) / 180;
    const x1 = center + r * Math.cos(startRad);
    const y1 = center + r * Math.sin(startRad);
    const x2 = center + r * Math.cos(endRad);
    const y2 = center + r * Math.sin(endRad);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  return (
    <div className="flex flex-col items-center" style={{ width: outer, height: outer }}>
      <svg width={outer} height={outer} viewBox={`0 0 ${outer} ${outer}`}>
        {/* Background arc */}
        <path
          d={describeArc(radius, startAngle, endAngle)}
          fill="none"
          stroke="var(--card-border)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        {isNumeric && (
          <path
            d={describeArc(radius, startAngle, endAngle)}
            fill="none"
            stroke={main}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filledLength} ${emptyLength}`}
          />
        )}
        {/* Pointer dot */}
        {isNumeric && (
          <circle
            cx={pointerX}
            cy={pointerY}
            r={stroke + 1}
            fill={main}
          />
        )}
        {/* Score text */}
        <text
          x={center}
          y={isNumeric && labelSize > 0 ? center - 2 : center + 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={main}
          fontSize={fontSize}
          fontWeight="800"
          fontFamily="var(--font-geist-mono), ui-monospace, monospace"
        >
          {isNumeric ? `${score}` : score}
        </text>
        {/* /10 label for numeric */}
        {isNumeric && labelSize > 0 && (
          <text
            x={center}
            y={center + fontSize / 2 + 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--muted)"
            fontSize={labelSize}
            fontFamily="var(--font-geist-mono), ui-monospace, monospace"
          >
            /10
          </text>
        )}
      </svg>
    </div>
  );
}
