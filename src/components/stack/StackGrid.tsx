import { stackDomains } from '@/lib/stack';
import { accentText } from '@/components/ui/Sticker';
import { cn } from '@/lib/cn';

/**
 * The tooling grid, shared by the home and about pages.
 *
 * Two deliberate departures from how the rest of the site lists things:
 *
 * - Hairline cells rather than six bordered cards. Six rounded boxes each
 *   holding forty rounded pills was boxes inside boxes; a single ruled table
 *   reads as one object and matches the practice grid on the home page.
 * - Plain type rather than `Tag` pills. At this volume every pill carried the
 *   same visual weight, which is the "alphabetical wall of logos" the section
 *   claims not to be. Set as a list, the eye can scan a domain in one pass and
 *   the accent heading is the only thing competing for attention.
 */
export function StackGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'grid gap-px overflow-hidden rounded-panel bg-current/10 md:grid-cols-2 xl:grid-cols-3',
        className,
      )}
    >
      {stackDomains.map((d) => (
        <div key={d.domain} className="bg-ink flex flex-col p-7">
          <h3 className={cn('font-display text-xl uppercase', accentText[d.accent])}>{d.domain}</h3>
          <p className="text-on-ink mt-2.5 max-w-prose text-sm leading-relaxed text-pretty">
            {d.note}
          </p>

          {/* Pushed to the bottom so the lists line up across a row even when
              the notes above them run to different lengths. */}
          <ul className="font-mono text-on-ink-muted mt-auto flex flex-wrap items-baseline pt-6 text-micro tracking-[0.08em] uppercase">
            {d.items.map((item, i) => (
              <li key={item} className="whitespace-nowrap">
                {item}
                {i < d.items.length - 1 ? (
                  <span aria-hidden="true" className="px-2 opacity-30">
                    ·
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
