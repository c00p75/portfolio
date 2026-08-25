import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { adrBySlug, adrsByProject, allAdrs, formatDate, projectForAdr } from '@/lib/content';
import { MDXContent } from '@/components/mdx/MDXContent';
import { Blueprint } from '@/components/blueprints';
import { StatusPill } from '@/components/adr/AdrCard';
import {
  FailureModes,
  MetricsStrip,
  OptionsConsidered,
  StackTags,
  TradeoffMatrix,
} from '@/components/adr/sections';
import { EdgeRail, InkCard, SectionHeading } from '@/components/ui/Frame';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { accentText, Tag } from '@/components/ui/Sticker';
import { cn } from '@/lib/cn';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allAdrs().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const adr = adrBySlug(slug);
  if (!adr) return {};
  return {
    title: `${adr.ref} — ${adr.title}`,
    description: adr.summary,
    openGraph: { title: adr.title, description: adr.summary, type: 'article' },
  };
}

/**
 * A titled band inside the record. Keeps the page's rhythm consistent, and
 * carries the anchor the contents index links to. `scroll-mt` clears the sticky
 * header, which would otherwise cover the heading you just jumped to.
 */
function Band({
  id,
  index,
  eyebrow,
  title,
  lead,
  children,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="px-edge scroll-mt-28 pt-6 sm:pt-8">
      <InkCard className="px-card py-12 sm:py-16">
        <SectionHeading index={index} eyebrow={eyebrow} title={title} lead={lead} />
        <div className="mt-10">{children}</div>
      </InkCard>
    </section>
  );
}

export default async function AdrPage({ params }: Params) {
  const { slug } = await params;
  const adr = adrBySlug(slug);
  if (!adr) notFound();

  const chosen = adr.options.find((o) => o.verdict === 'chosen');

  /**
   * A record is now read as part of a system rather than as an entry in an index,
   * so "next" means the next decision in the same project. Records with no
   * project fall back to the site-wide order.
   */
  const project = projectForAdr(adr);
  const siblings = project ? adrsByProject(project.slug) : allAdrs();
  const index = siblings.findIndex((a) => a.slug === adr.slug);
  const next = siblings[index + 1] ?? siblings[0];

  /**
   * The single source of truth for which bands this record has, in order. Both
   * the contents index and the band numbering read from it, so a record without
   * a trade-off matrix numbers 01, 02, 03 rather than skipping to 04 — and the
   * index can never list a section the page does not render.
   */
  const sections = [
    { id: 'context', label: 'Problem & context' },
    { id: 'options', label: 'Options evaluated' },
    adr.tradeoffs.length > 0 ? { id: 'tradeoffs', label: 'Trade-off matrix' } : null,
    { id: 'decision', label: 'Decision & reversibility' },
    adr.diagram ? { id: 'blueprint', label: 'System blueprint' } : null,
    adr.failureModes.length > 0 ? { id: 'failure-modes', label: 'Failure modes' } : null,
    adr.metrics.length > 0 ? { id: 'metrics', label: 'What it costs to run' } : null,
    { id: 'notes', label: 'The longer version' },
  ].filter((s): s is { id: string; label: string } => s !== null);

  const num = (id: string) => String(sections.findIndex((s) => s.id === id) + 1).padStart(2, '0');

  return (
    <>
      <EdgeRail
        className="pt-2 pb-3"
        left={adr.ref}
        center={adr.domain}
        right={formatDate(adr.date)}
      />

      {/* ------------------------------ Header ------------------------------ */}
      <div className="px-edge">
        <InkCard className="px-card py-14 sm:py-20">
          {/* The record's parent. There is no records index any more, so this is
              the only way back up — and it is also the context a reader needs
              before the decision means anything. */}
          {project ? (
            <nav aria-label="Breadcrumb" className="mb-7">
              <Link
                href={project.url}
                className="group font-mono text-on-ink-muted hover:text-on-ink inline-flex items-center gap-2.5 text-micro font-semibold tracking-[0.1em] uppercase"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-[1em] w-[1em] shrink-0 transition-transform duration-300 ease-out group-hover:-translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                >
                  <path
                    d="M20 12H5m0 0 5.5-5.5M5 12l5.5 5.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="square"
                  />
                </svg>
                A decision from {project.title}
              </Link>
            </nav>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <span className={cn('font-mono text-micro font-bold', accentText[adr.accent])}>
              {adr.ref}
            </span>
            <StatusPill status={adr.status} />
            <Tag>{adr.domain}</Tag>
            {adr.draft ? <Tag className="text-yellow border-yellow">Scaffold, draft</Tag> : null}
          </div>

          <h1 className="font-display mt-7 max-w-5xl text-jumbo text-balance uppercase">
            {adr.title}
          </h1>

          <p className="text-on-ink mt-7 max-w-3xl text-lg leading-relaxed text-pretty">
            {adr.summary}
          </p>

          <div className="mt-9">
            <StackTags items={adr.stack} />
          </div>

          {/* A record runs to eight or nine bands, so the shape of the argument
              needs to be visible before someone commits to reading it. */}
          <nav aria-label="Contents" className="border-ink-line mt-11 border-t pt-8">
            <h2 className="font-mono text-on-ink-muted text-micro font-semibold uppercase">
              Contents
            </h2>
            <ol className="mt-5 grid gap-x-10 gap-y-1 sm:grid-cols-2 xl:grid-cols-4">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="group flex items-baseline gap-3 py-1.5 text-sm hover:text-cyan"
                  >
                    <span className="font-mono text-on-ink-muted text-micro tabular-nums">
                      {num(s.id)}
                    </span>
                    <span className="underline-offset-4 group-hover:underline">{s.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </InkCard>
      </div>

      {/* ------------------------------ Context ----------------------------- */}
      <Band id="context" index={num('context')} eyebrow="Problem & context" title="What forced a decision">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <p className="max-w-2xl text-base leading-relaxed text-pretty">{adr.context}</p>
          {adr.constraints.length > 0 ? (
            <div>
              <h3 className="font-mono text-on-ink-muted mb-4 text-micro uppercase">
                Hard constraints
              </h3>
              <ul className="flex flex-col gap-3">
                {adr.constraints.map((c) => (
                  <li key={c} className="flex gap-3 text-sm leading-relaxed text-pretty">
                    <span aria-hidden="true" className={cn('mt-2 h-px w-4 shrink-0 bg-current', accentText[adr.accent])} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Band>

      {/* ------------------------------ Options ----------------------------- */}
      <Band
        id="options"
        index={num('options')}
        eyebrow="Options evaluated"
        title="What was on the table"
        lead="Each option carries the one sentence that justifies its verdict."
      >
        <OptionsConsidered adr={adr} />
      </Band>

      {/* ---------------------------- Trade-offs ---------------------------- */}
      {adr.tradeoffs.length > 0 ? (
        <Band
          id="tradeoffs"
          index={num('tradeoffs')}
          eyebrow="Trade-off matrix"
          title="What each option costs"
          lead="Scored on the axes that mattered here. The option I chose is weaker than the alternatives on at least one row, which is usually where the interesting conversation starts."
        >
          <TradeoffMatrix adr={adr} />
        </Band>
      ) : null}

      {/* ----------------------- Decision & reversibility -------------------- */}
      <section id="decision" className="px-edge scroll-mt-28 pt-6 sm:pt-8">
        <InkCard className="px-card py-12 sm:py-16">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading index={num('decision')} eyebrow="Decision" title="What I chose" />
              <p className="mt-8 text-base leading-relaxed text-pretty">{adr.decision}</p>
              {chosen ? (
                <p className={cn('font-mono mt-6 text-micro uppercase', accentText[adr.accent])}>
                  → {chosen.name}
                </p>
              ) : null}
            </div>

            <div className="border-ink-line rounded-panel border p-7 sm:p-8">
              <SectionHeading eyebrow="Reversibility" title="Cost to undo" />
              <p className="mt-8 text-base leading-relaxed text-pretty">{adr.reversibility}</p>
            </div>
          </div>
        </InkCard>
      </section>

      {/* ----------------------------- Blueprint ---------------------------- */}
      {adr.diagram ? (
        <Band
          id="blueprint"
          index={num('blueprint')}
          eyebrow="System blueprint"
          title="How it fits together"
        >
          <Blueprint name={adr.diagram} />
        </Band>
      ) : null}

      {/* --------------------------- Failure modes -------------------------- */}
      {adr.failureModes.length > 0 ? (
        <Band
          id="failure-modes"
          index={num('failure-modes')}
          eyebrow="Failure modes"
          title="What happens when it breaks"
          lead="The ways this design can break, and what it is set up to do when they happen."
        >
          <FailureModes adr={adr} />
        </Band>
      ) : null}

      {/* ------------------------------ Metrics ----------------------------- */}
      {adr.metrics.length > 0 ? (
        <Band
          id="metrics"
          index={num('metrics')}
          eyebrow="Numbers"
          title="What it costs to run"
          lead="Each figure says where it came from, so you can judge how much weight to give it."
        >
          <MetricsStrip metrics={adr.metrics} accent={adr.accent} />
        </Band>
      ) : null}

      {/* ------------------------------ Long form --------------------------- */}
      <section id="notes" className="px-edge scroll-mt-28 pt-6 sm:pt-8">
        <InkCard className="px-card py-14 sm:py-20">
          <SectionHeading index={num('notes')} eyebrow="Notes" title="The longer version" />
          <div className="mt-10">
            <MDXContent code={adr.body} />
          </div>
        </InkCard>
      </section>

      {/* ------------------------------- Next ------------------------------- */}
      {next && next.slug !== adr.slug ? (
        <section className="px-edge pt-6 sm:pt-8">
          <InkCard className="px-card py-12">
            <p className="font-mono text-on-ink-muted text-micro uppercase">
              {project ? `Next decision in ${project.title}` : 'Next record'}
            </p>
            <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
              <h2 className="font-display max-w-3xl text-display text-balance uppercase">
                <Link href={next.url} className="hover:text-cyan">
                  {next.shortTitle ?? next.title}
                </Link>
              </h2>
              <ArrowLink
                href={project?.url ?? '/work'}
                className="text-on-ink-muted hover:text-on-ink"
              >
                {project ? `Back to ${project.title}` : 'All work'}
              </ArrowLink>
            </div>
          </InkCard>
        </section>
      ) : null}

      <EdgeRail className="pt-8" left={adr.ref} right={`Status: ${adr.status}`} />
    </>
  );
}
