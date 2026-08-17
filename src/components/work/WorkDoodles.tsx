import type { CSSProperties, ReactNode } from 'react';

/**
 * Work-header sketches — browser + phone only. Same pen + motion contract as
 * the homepage hero doodles (`.doodle` / `.doodle-draw` in globals.css).
 */

const pen = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

function Ink({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <g {...pen} className={className ? `doodle-draw ${className}` : 'doodle-draw'}>
      {children}
    </g>
  );
}

function P({ d, dashed }: { d: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      pathLength="360"
      strokeDasharray={dashed ? '4 4' : undefined}
      className={dashed ? 'doodle-static' : undefined}
    />
  );
}

/** Browser + phone — shipped product surfaces, packed to fill the panel. */
function ProductSurfaces() {
  return (
    <svg viewBox="0 0 280 170" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <Ink>
        {/* Browser */}
        <rect x="4" y="12" width="168" height="130" rx="8" pathLength="360" />
        <P d="M4 38h168" />
        <circle cx="20" cy="25" r="4" pathLength="360" />
        <circle cx="36" cy="25" r="4" pathLength="360" />
        <circle cx="52" cy="25" r="4" pathLength="360" />
        <P d="M68 25h88" />
        <rect x="20" y="54" width="64" height="40" rx="4" pathLength="360" />
        <P d="M98 58h60M98 72h50M98 86h56" />
        <P d="M20 112h136" />
        <P d="M20 126h100" />

        {/* Phone */}
        <rect x="192" y="8" width="76" height="154" rx="14" pathLength="360" />
        <P d="M214 22h32" />
        <rect x="206" y="40" width="48" height="36" rx="4" pathLength="360" />
        <P d="M206 90h48M206 104h38M206 118h44" />
        <circle cx="230" cy="146" r="7" pathLength="360" />
      </Ink>
    </svg>
  );
}

export function WorkDoodles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center p-5 lg:p-7"
    >
      <div
        style={{ animationDelay: '0.3s', '--d': '0.3s' } as CSSProperties}
        className="doodle h-full w-full"
      >
        <ProductSurfaces />
      </div>
    </div>
  );
}
