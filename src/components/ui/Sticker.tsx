import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type Accent = 'cyan' | 'pink' | 'yellow' | 'orange' | 'lime';

/**
 * Sticker accents are always near-black-on-saturated, which is the only
 * combination that stays legible at the sizes these are used and keeps every
 * pairing well above 4.5:1.
 */
export const accentSurface: Record<Accent, string> = {
  cyan: 'bg-cyan text-ink-fixed',
  pink: 'bg-pink text-ink-fixed',
  yellow: 'bg-yellow text-ink-fixed',
  orange: 'bg-orange text-ink-fixed',
  lime: 'bg-lime text-ink-fixed',
};

/**
 * For accent colour used as TEXT on a card (not a sticker fill). Deepened per
 * theme so it clears 4.5:1 on both the white light-mode card and the black
 * dark-mode one — the raw `text-cyan`/`text-yellow` utilities read fine on
 * black but fail contrast on white, so never use those for text.
 */
export const accentText: Record<Accent, string> = {
  cyan: 'text-cyan-ink',
  pink: 'text-pink-ink',
  yellow: 'text-yellow-ink',
  orange: 'text-orange-ink',
  lime: 'text-lime-ink',
};

export const accentBorder: Record<Accent, string> = {
  cyan: 'border-cyan',
  pink: 'border-pink',
  yellow: 'border-yellow',
  orange: 'border-orange',
  lime: 'border-lime',
};

type StickerProps = {
  children: ReactNode;
  accent?: Accent;
  /** Degrees of rotation. Kept small — these read as applied vinyl, not confetti. */
  rotate?: number;
  /** Small print under the main label. */
  caption?: ReactNode;
  className?: string;
  /** Lift on hover. Off for decorative stickers in dense clusters. */
  interactive?: boolean;
};

/**
 * The core visual motif: a rotated, heavy-condensed label that sits on top of
 * the layout like a printed sticker. Rotation is applied via inline style
 * because the angles are per-instance and arbitrary.
 */
export function Sticker({
  children,
  accent = 'cyan',
  rotate = 0,
  caption,
  className,
  interactive = false,
}: StickerProps) {
  return (
    <div
      style={{ '--sticker-rotate': `${rotate}deg` } as React.CSSProperties}
      className={cn(
        'inline-block rotate-(--sticker-rotate) px-4 py-2.5 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.55)]',
        accentSurface[accent],
        interactive &&
          'transition-transform duration-300 ease-out hover:-translate-y-1 hover:rotate-0 motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-(--sticker-rotate)',
        className,
      )}
    >
      <span className="font-display block text-[clamp(0.95rem,2.4vw,1.6rem)] leading-[0.95] tracking-tight uppercase">
        {children}
      </span>
      {caption ? (
        <span className="font-mono mt-1 block text-[0.5625rem] leading-tight font-semibold tracking-[0.06em] uppercase opacity-80">
          {caption}
        </span>
      ) : null}
    </div>
  );
}

/**
 * The round variant from the reference — used sparingly, for a single
 * "seal of approval" style mark.
 */
export function StickerSeal({
  children,
  accent = 'lime',
  rotate = 0,
  className,
}: Omit<StickerProps, 'caption'>) {
  return (
    <div
      style={{ '--sticker-rotate': `${rotate}deg` } as React.CSSProperties}
      className={cn(
        'grid aspect-square place-items-center rounded-full rotate-(--sticker-rotate) p-5 text-center shadow-[0_6px_18px_-6px_rgba(0,0,0,0.55)]',
        accentSurface[accent],
        className,
      )}
    >
      <span className="font-display text-[clamp(0.8rem,1.7vw,1.15rem)] leading-[0.92] tracking-tight uppercase">
        {children}
      </span>
    </div>
  );
}

/**
 * A quieter inline tag for stack lists and metadata rows — same family as the
 * stickers but without rotation or drop shadow, so it can be used in bulk.
 */
export function Tag({
  children,
  className,
  accent,
}: {
  children: ReactNode;
  className?: string;
  accent?: Accent;
}) {
  return (
    <span
      className={cn(
        'font-mono inline-flex items-center rounded-full border px-2.5 py-1 text-[0.625rem] font-semibold tracking-[0.08em] uppercase',
        accent
          ? cn(accentBorder[accent], accentText[accent])
          : 'border-current/25 text-current opacity-80',
        className,
      )}
    >
      {children}
    </span>
  );
}
