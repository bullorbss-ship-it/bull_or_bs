/**
 * Hand-drawn pencil-sketch SVG illustrations.
 * All use currentColor so they adapt to light/dark mode.
 * Rough, imperfect strokes for that human touch.
 */

const SKETCH_STYLE = {
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
  stroke: 'currentColor',
};

interface SketchProps {
  className?: string;
  size?: number;
}

/** Detective bull with magnifying glass — for roasts */
export function SketchBullDetective({ className = '', size = 64 }: SketchProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g {...SKETCH_STYLE} strokeWidth="1.5">
        {/* Bull head outline — slightly wobbly */}
        <path d="M22 38c-2-8 1-16 10-18s14 4 14 12c0 6-4 10-10 11s-12-1-14-5z" />
        {/* Left horn */}
        <path d="M24 22c-3-5-7-8-10-7s-1 5 2 7" strokeWidth="1.8" />
        {/* Right horn */}
        <path d="M38 22c3-5 7-8 10-7s1 5-2 7" strokeWidth="1.8" />
        {/* Eyes — dots */}
        <circle cx="29" cy="32" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="37" cy="32" r="1.5" fill="currentColor" stroke="none" />
        {/* Nose ring */}
        <path d="M30 38c1 2 4 2 5 0" />
        {/* Magnifying glass */}
        <circle cx="50" cy="48" r="7" strokeWidth="1.8" />
        <path d="M55 53l6 6" strokeWidth="2.5" />
        {/* Eyebrow raise — skeptical */}
        <path d="M26 28c1-2 3-2 5-1" strokeWidth="1" />
        <path d="M35 27c2-1 4-1 5 1" strokeWidth="1" />
      </g>
    </svg>
  );
}

/** Person reading with lightbulb — for "We Read It" */
export function SketchReader({ className = '', size = 48 }: SketchProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <g {...SKETCH_STYLE} strokeWidth="1.5">
        {/* Head */}
        <circle cx="16" cy="12" r="5" />
        {/* Body hunched reading */}
        <path d="M16 17c0 4-2 8-2 12" />
        <path d="M14 29c4 0 8 0 10-2" />
        {/* Arms holding document */}
        <path d="M16 21c4-1 8 0 10 2" />
        <path d="M16 21c-3 1-5 4-4 7" />
        {/* Document/paper */}
        <rect x="24" y="18" width="10" height="13" rx="1" strokeWidth="1.2" />
        <path d="M26 22h6M26 25h6M26 28h4" strokeWidth="0.8" />
        {/* Lightbulb moment */}
        <path d="M38 8c1-3 4-4 6-2s1 4-1 6c-1 1-2 2-2 3" strokeWidth="1.2" />
        <path d="M40 16h2" strokeWidth="1" />
        {/* Sparkle lines */}
        <path d="M46 6l2-2M48 10h2M46 14l2 2" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

/** Magnifying glass over chart — for "We Test It" */
export function SketchAnalyzer({ className = '', size = 48 }: SketchProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <g {...SKETCH_STYLE} strokeWidth="1.5">
        {/* Chart bars */}
        <path d="M6 38V28" strokeWidth="3" opacity="0.3" />
        <path d="M12 38V24" strokeWidth="3" opacity="0.3" />
        <path d="M18 38V20" strokeWidth="3" opacity="0.3" />
        <path d="M24 38V16" strokeWidth="3" opacity="0.5" />
        <path d="M30 38V22" strokeWidth="3" opacity="0.3" />
        {/* Baseline */}
        <path d="M4 38h30" strokeWidth="1" />
        {/* Magnifying glass over chart */}
        <circle cx="34" cy="18" r="9" strokeWidth="1.8" />
        <path d="M40 24l6 6" strokeWidth="2.5" />
        {/* Checkmark inside magnifier */}
        <path d="M30 18l3 3 5-6" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/** Person with open arms / presenting — for "You Decide" */
export function SketchPresenter({ className = '', size = 48 }: SketchProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <g {...SKETCH_STYLE} strokeWidth="1.5">
        {/* Head */}
        <circle cx="24" cy="10" r="5" />
        {/* Smile */}
        <path d="M22 11c1 2 3 2 4 0" strokeWidth="1" />
        {/* Body */}
        <path d="M24 15v12" />
        {/* Arms open wide */}
        <path d="M24 20c-5-2-10 0-13 3" />
        <path d="M24 20c5-2 10 0 13 3" />
        {/* Hands with thumbs up */}
        <path d="M11 23c-1-2-1-4 1-4" strokeWidth="1.2" />
        <path d="M37 23c1-2 1-4-1-4" strokeWidth="1.2" />
        {/* Legs */}
        <path d="M24 27c-2 4-5 8-7 12" />
        <path d="M24 27c2 4 5 8 7 12" />
        {/* Stars/sparkles around */}
        <path d="M6 10l1.5 1.5M8 8l0 3M9.5 10l-1.5 1.5" strokeWidth="0.8" />
        <path d="M40 8l1.5 1.5M42 6l0 3M43.5 8l-1.5 1.5" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

/** Newspaper with coffee — for news takes */
export function SketchNewspaper({ className = '', size = 48 }: SketchProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <g {...SKETCH_STYLE} strokeWidth="1.5">
        {/* Newspaper folded */}
        <rect x="4" y="8" width="28" height="34" rx="2" />
        <path d="M32 14c3 0 6 1 8 3v22c-2 2-5 3-8 3" strokeWidth="1.2" />
        {/* Headline */}
        <path d="M8 14h20" strokeWidth="2" />
        {/* Text lines */}
        <path d="M8 19h18M8 22h16M8 25h18M8 28h12" strokeWidth="0.8" />
        {/* Small chart in paper */}
        <path d="M8 33l4-3 3 2 4-4 3 1" strokeWidth="1" />
        {/* Coffee cup */}
        <path d="M36 30c0-2 2-3 4-3s4 1 4 3v4c0 2-2 3-4 3s-4-1-4-3z" strokeWidth="1.2" />
        <path d="M44 32c2 0 3-1 3-2s-1-2-3-2" strokeWidth="1" />
        {/* Steam */}
        <path d="M38 27c0-2 1-3 0-5" strokeWidth="0.8" />
        <path d="M40 26c0-2 1-3 0-5" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

/** Target with arrow — for picks */
export function SketchTarget({ className = '', size = 48 }: SketchProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <g {...SKETCH_STYLE} strokeWidth="1.5">
        {/* Target rings */}
        <circle cx="22" cy="24" r="16" strokeWidth="1.2" />
        <circle cx="22" cy="24" r="10" strokeWidth="1.2" />
        <circle cx="22" cy="24" r="4" strokeWidth="1.2" />
        {/* Bullseye dot */}
        <circle cx="22" cy="24" r="1.5" fill="currentColor" stroke="none" />
        {/* Arrow hitting target */}
        <path d="M38 8l-14 14" strokeWidth="1.8" />
        <path d="M38 8l-5 1 4 4z" fill="currentColor" strokeWidth="1" />
        {/* Arrow feathers */}
        <path d="M38 8l3 5" strokeWidth="1" />
        <path d="M38 8l5 3" strokeWidth="1" />
      </g>
    </svg>
  );
}

/** Small bull silhouette — for branding accent */
export function SketchBullSmall({ className = '', size = 32 }: SketchProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g {...SKETCH_STYLE} strokeWidth="1.3">
        {/* Bull body */}
        <path d="M8 22c0-4 2-7 5-8s6 0 8 2c2 2 3 5 2 8" />
        {/* Head */}
        <path d="M13 14c-1-2 0-5 3-5s4 3 3 5" />
        {/* Horns */}
        <path d="M13 10c-2-3-4-4-5-3" strokeWidth="1.5" />
        <path d="M19 10c2-3 4-4 5-3" strokeWidth="1.5" />
        {/* Legs */}
        <path d="M11 24v4M15 24v4M19 24v4M23 24v4" strokeWidth="1" />
        {/* Tail */}
        <path d="M24 20c2-1 4 0 4 2" strokeWidth="1" />
      </g>
    </svg>
  );
}
