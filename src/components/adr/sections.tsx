import type { Adr } from '@/lib/content';
import { cn } from '@/lib/cn';
import { accentText, Tag } from '@/components/ui/Sticker';

type Score = 'strong' | 'adequate' | 'weak';

const scoreMeta: Record<Score, { label: string; dots: number; tone: string }> = {
  strong: { label: 'Strong', dots: 3, tone: 'text-lime' },
  adequate: { label: 'Adequate', dots: 2, tone: 'text-yellow' },
  weak: { label: 'Weak', dots: 1, tone: 'text-pink' },
};

/**
 * Score is conveyed by a filled/empty pip count *and* a text label, never by
 * colour alone — the matrix has to survive greyscale printing and colour
 * vision deficiency.
 */
function ScoreCell({ score }: { score: Score }) {
  const meta = scoreMeta[score];
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden="true" className={cn('flex gap-1', meta.tone)}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              'block h-2 w-2 rounded-full border border-current',
              i < meta.dots && 'bg-current',
            )}
          />
        ))}
      </span>
      <span className="font-mono text-[0.625rem] tracking-wide uppercase opacity-70">
        {meta.label}
      </span>
    </span>
  );
}

/**
 * Pivots the authored `tradeoffs` rows into a criteria × options table. Option
 * columns come from the ADR's own option list so the two can never drift.
 */
export function TradeoffMatrix({ adr }: { adr: Adr }) {
  if (adr.tradeoffs.length === 0) return null;
  const options = adr.options.map((o) => o.name);

  return (
    <div className="scroll-x border-ink-line rounded-panel border">
      <table className="w-full min-w-[46rem] border-collapse text-left">
        <caption className="sr-only">
          Trade-off matrix comparing {options.length} options across {adr.tradeoffs.length} criteria
        </caption>
        <thead>
          <tr className="border-ink-line border-b">
            <th scope="col" className="font-mono text-on-ink-muted p-4 text-micro uppercase">
              Criterion
            </th>
            {options.map((name) => {
              const chosen = adr.options.find((o) => o.name === name)?.verdict === 'chosen';
              return (
                <th
                  key={name}
                  scope="col"
                  className={cn(
                    'p-4 align-bottom text-[0.8125rem] font-semibold',
                    chosen ? accentText[adr.accent] : 'text-on-ink-muted',
                  )}
                >
                  {name}
                  {chosen ? (
                    <span className="font-mono mt-1 block text-[0.5625rem] tracking-wider uppercase">
                      Chosen
                    </span>
                  ) : null}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-ink-line divide-y">
          {adr.tradeoffs.map((row) => (
            <tr key={row.criterion}>
              <th scope="row" className="p-4 text-[0.8125rem] font-medium">
                {row.criterion}
                {row.note ? (
                  <span className="text-on-ink-muted mt-1 block text-xs font-normal">
                    {row.note}
                  </span>
                ) : null}
              </th>
              {options.map((name) => {
                const score = row.scores[name] as Score | undefined;
                return (
                  <td key={name} className="p-4">
                    {score ? (
                      <ScoreCell score={score} />
                    ) : (
                      <span className="text-on-ink-muted text-xs">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const verdictTone: Record<Adr['options'][number]['verdict'], string> = {
  chosen: 'bg-lime text-ink',
  rejected: 'bg-ink-soft text-on-ink-muted border border-ink-line',
  deferred: 'bg-yellow text-ink',
};

/** The options considered, with the sentence that justifies each verdict. */
export function OptionsConsidered({ adr }: { adr: Adr }) {
  return (
    <ol className="grid gap-5 lg:grid-cols-3">
      {adr.options.map((option, i) => {
        const chosen = option.verdict === 'chosen';
        return (
          <li
            key={option.name}
            className={cn(
              'flex flex-col gap-4 rounded-panel border p-6',
              chosen ? 'border-lime bg-lime/5' : 'border-ink-line',
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-on-ink-muted text-micro">
                Option {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={cn(
                  'font-mono rounded-full px-2.5 py-1 text-[0.625rem] font-bold tracking-[0.08em] uppercase',
                  verdictTone[option.verdict],
                )}
              >
                {option.verdict}
              </span>
            </div>

            <h3 className="font-display text-xl leading-none uppercase">{option.name}</h3>
            <p className="text-on-ink-muted text-sm leading-relaxed text-pretty">
              {option.summary}
            </p>

            {option.pros.length > 0 ? (
              <div>
                <h4 className="font-mono text-lime mb-2 text-[0.625rem] tracking-wider uppercase">
                  For
                </h4>
                <ul className="flex flex-col gap-1.5">
                  {option.pros.map((p) => (
                    <li key={p} className="text-on-ink-muted flex gap-2 text-xs leading-relaxed">
                      <span aria-hidden="true" className="text-lime">
                        +
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {option.cons.length > 0 ? (
              <div>
                <h4 className="font-mono text-pink mb-2 text-[0.625rem] tracking-wider uppercase">
                  Against
                </h4>
                <ul className="flex flex-col gap-1.5">
                  {option.cons.map((c) => (
                    <li key={c} className="text-on-ink-muted flex gap-2 text-xs leading-relaxed">
                      <span aria-hidden="true" className="text-pink">
                        −
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="border-ink-line mt-auto border-t pt-4 text-[0.8125rem] leading-relaxed text-pretty">
              <span className="font-mono text-on-ink-muted mr-1.5 text-[0.625rem] uppercase">
                Because
              </span>
              {option.because}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

const severityTone: Record<Adr['failureModes'][number]['severity'], string> = {
  critical: 'bg-pink text-ink',
  major: 'bg-orange text-ink',
  minor: 'bg-yellow text-ink',
};

/** What breaks, how it's noticed, and what the system does about it. */
export function FailureModes({ adr }: { adr: Adr }) {
  if (adr.failureModes.length === 0) return null;

  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {adr.failureModes.map((f) => (
        <li key={f.trigger} className="border-ink-line flex flex-col gap-4 rounded-panel border p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[0.9375rem] leading-snug font-semibold text-pretty">{f.trigger}</h3>
            <span
              className={cn(
                'font-mono shrink-0 rounded-full px-2.5 py-1 text-[0.5625rem] font-bold tracking-[0.08em] uppercase',
                severityTone[f.severity],
              )}
            >
              {f.severity}
            </span>
          </div>
          <dl className="flex flex-col gap-3 text-sm">
            {(
              [
                ['Blast radius', f.blastRadius],
                ['Detection', f.detection],
                ['Mitigation', f.mitigation],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-on-ink-muted text-[0.625rem] tracking-wider uppercase">
                  {label}
                </dt>
                <dd className="mt-1 leading-relaxed text-pretty">{value}</dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  );
}

/** Quantified outcomes. Each carries the basis so a number is never bare. */
export function MetricsStrip({ adr }: { adr: Adr }) {
  if (adr.metrics.length === 0) return null;

  return (
    <dl className="border-ink-line grid gap-px overflow-hidden rounded-panel border bg-current/10 sm:grid-cols-2 xl:grid-cols-4">
      {adr.metrics.map((m) => (
        <div key={m.label} className="bg-ink flex flex-col gap-2 p-6">
          <dd className={cn('font-display text-3xl leading-none', accentText[adr.accent])}>
            {m.value}
          </dd>
          <dt className="font-mono text-micro uppercase">{m.label}</dt>
          <p className="text-on-ink-muted text-xs leading-relaxed text-pretty">{m.basis}</p>
        </div>
      ))}
    </dl>
  );
}

/** Stack tags used in the ADR header. */
export function StackTags({ items }: { items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((s) => (
        <li key={s}>
          <Tag>{s}</Tag>
        </li>
      ))}
    </ul>
  );
}
