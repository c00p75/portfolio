import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { accentSurface, type Accent } from './Sticker';

type RotatingSealProps = {
  /** Repeated around the ring. A trailing separator is added automatically. */
  text: string;
  accent?: Accent;
  /** Content in the middle of the ring — usually a small glyph. */
  children?: ReactNode;
  className?: string;
  /** Seconds per revolution. `0` disables the spin entirely. */
  spin?: number;
  size?: number;
};

/**
 * The circular text-on-a-path seal. Text is set on an SVG path so it tracks the
 * circle properly instead of being faked with per-letter rotation.
 */
export function RotatingSeal({
  text,
  accent = 'lime',
  children,
  className,
  spin = 22,
  size = 132,
}: RotatingSealProps) {
  // Repeat until the ring is comfortably full; the path is ~264px long at r=42.
  const unit = `${text} ∗ `;
  const repeated = unit.repeat(2);

  return (
    <div
      className={cn(
        'relative grid aspect-square place-items-center rounded-full shadow-[0_8px_22px_-8px_rgba(0,0,0,0.6)]',
        accentSurface[accent],
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className={cn('absolute inset-0 h-full w-full', spin > 0 && 'motion-safe:animate-spin')}
        style={spin > 0 ? { animationDuration: `${spin}s` } : undefined}
      >
        <defs>
          <path id={`seal-${text.replace(/\W/g, '')}`} d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" fill="none" />
        </defs>
        <text className="font-display fill-current text-[10.5px] tracking-[0.14em] uppercase">
          <textPath href={`#seal-${text.replace(/\W/g, '')}`} startOffset="0">
            {repeated}
          </textPath>
        </text>
      </svg>
      {/* The seal's words are decorative repetition; expose them once to AT. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="relative grid place-items-center">
        {children}
      </span>
    </div>
  );
}
