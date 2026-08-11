import Link from 'next/link';
import type { Adr } from '@/lib/content';
import { formatDate } from '@/lib/content';
import { cn } from '@/lib/cn';
import { accentSurface, accentText, Tag } from '@/components/ui/Sticker';

export function StatusPill({ status, className }: { status: Adr['status']; className?: string }) {
  const tone: Record<Adr['status'], string> = {
    accepted: 'bg-lime text-ink-fixed',
    proposed: 'bg-yellow text-ink-fixed',
    superseded: 'bg-orange text-ink-fixed',
    deprecated: 'bg-pink text-ink-fixed',
  };
  return (
    <span
      className={cn(
        'font-mono inline-block rounded-full px-2.5 py-1 text-[0.625rem] font-bold tracking-[0.08em] uppercase',
        tone[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

/**
 * The card used on the homepage and the architecture index. Leads with the
 * decision's identity (ref + status), not the technology list.
 */
export function AdrCard({ adr, className }: { adr: Adr; className?: string }) {
  const headline = adr.metrics[0];

  return (
    <article
      className={cn(
        'group border-ink-line bg-ink-soft relative flex flex-col overflow-hidden rounded-panel border transition-colors hover:border-current/30',
        className,
      )}
    >
      {/* Accent edge ties the card to the ADR's colour throughout the site. */}
      <span aria-hidden="true" className={cn('block h-1.5 w-full', accentSurface[adr.accent])} />

      <div className="flex flex-1 flex-col gap-5 p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={cn('font-mono text-micro font-bold', accentText[adr.accent])}>
            {adr.ref}
          </span>
          <StatusPill status={adr.status} />
          {adr.draft ? <Tag className="text-yellow-ink border-yellow">Scaffold</Tag> : null}
          <span className="font-mono text-on-ink-muted ml-auto text-micro uppercase">
            {adr.domain}
          </span>
        </div>

        <h3 className="font-display text-title text-balance uppercase">
          <Link href={adr.url} className="before:absolute before:inset-0 hover:text-cyan-ink">
            {adr.title}
          </Link>
        </h3>

        <p className="text-on-ink-muted text-sm leading-relaxed text-pretty">{adr.summary}</p>

        {headline ? (
          <div className="border-ink-line mt-auto border-t pt-4">
            <p className={cn('font-display text-2xl leading-none', accentText[adr.accent])}>
              {headline.value}
            </p>
            <p className="font-mono text-on-ink-muted mt-1.5 text-micro uppercase">
              {headline.label}
            </p>
          </div>
        ) : null}

        <div className="font-mono text-on-ink-muted flex items-center justify-between text-micro uppercase">
          <span>{formatDate(adr.date)}</span>
          <span>{adr.options.length} options evaluated</span>
        </div>
      </div>
    </article>
  );
}
