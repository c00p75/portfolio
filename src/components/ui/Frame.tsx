import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * The thin captions that run along the outer edges of the page, above and below
 * the content card. Purely typographic chrome borrowed from print layouts.
 */
export function EdgeRail({
  left,
  center,
  right,
  className,
}: {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'text-on-page-muted font-mono mx-auto flex max-w-[110rem] items-start justify-between gap-4 px-gutter text-micro font-medium uppercase',
        className,
      )}
    >
      <span className="max-w-[14rem] leading-relaxed">{left}</span>
      <span className="hidden max-w-[16rem] text-center leading-relaxed sm:block">{center}</span>
      <span className="max-w-[14rem] text-right leading-relaxed">{right}</span>
    </div>
  );
}

/**
 * The black content card the whole site sits inside — the single strongest
 * structural cue from the reference layout.
 */
export function InkCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'bg-ink text-on-ink relative mx-auto max-w-[110rem] overflow-hidden rounded-card',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A cream panel with the engineering-paper grid behind it. */
export function CreamPanel({
  children,
  className,
  grid = true,
}: {
  children: ReactNode;
  className?: string;
  grid?: boolean;
}) {
  return (
    <div className={cn('bg-cream text-on-cream relative isolate overflow-hidden', className)}>
      {grid ? (
        <div
          aria-hidden="true"
          className="grid-paper grid-paper-fade pointer-events-none absolute inset-0 -z-10 opacity-70"
        />
      ) : null}
      {children}
    </div>
  );
}

/** Standard horizontal rhythm for content inside a card. */
export function Bleed({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-gutter', className)}>{children}</div>;
}

/**
 * Section heading with an eyebrow index — used to number the sections the way
 * the reference numbers its layout regions.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  lead,
  className,
  tone = 'ink',
}: {
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
  tone?: 'ink' | 'cream';
}) {
  const muted = tone === 'ink' ? 'text-on-ink-muted' : 'text-on-cream-muted';
  return (
    <header className={cn('flex flex-col gap-5', className)}>
      {(index || eyebrow) && (
        <div className={cn('font-mono flex items-center gap-3 text-micro font-semibold uppercase', muted)}>
          {index ? <span className="tabular-nums">{index}</span> : null}
          {index && eyebrow ? <span aria-hidden="true" className="h-px w-8 bg-current opacity-40" /> : null}
          {eyebrow ? <span>{eyebrow}</span> : null}
        </div>
      )}
      <h2 className="font-display text-display text-balance uppercase">{title}</h2>
      {lead ? <p className={cn('max-w-2xl text-base leading-relaxed text-pretty', muted)}>{lead}</p> : null}
    </header>
  );
}
