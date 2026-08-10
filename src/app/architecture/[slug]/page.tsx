import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { adrBySlug, allAdrs, formatDate } from '@/lib/content';
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

/** A titled band inside the record. Keeps the page's rhythm consistent. */
function Band({
  index,
  eyebrow,
  title,
  lead,
  children,
}: {
  index: string;
  eyebrow: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-gutter pt-6 sm:pt-8">
      <InkCard className="px-gutter py-12 sm:py-16">
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
  const all = allAdrs();
  const index = all.findIndex((a) => a.slug === adr.slug);
  const next = all[index + 1] ?? all[0];

  return (
    <>
      <EdgeRail
        className="pt-2 pb-3"
        left={adr.ref}
        center={adr.domain}
        right={formatDate(adr.date)}
      />

      {/* ------------------------------ Header ------------------------------ */}
      <div className="px-gutter">
        <InkCard className="px-gutter py-14 sm:py-20">
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn('font-mono text-micro font-bold', accentText[adr.accent])}>
              {adr.ref}
            </span>
            <StatusPill status={adr.status} />
            <Tag>{adr.domain}</Tag>
            {adr.draft ? <Tag className="text-yellow border-yellow">Scaffold — not yet real</Tag> : null}
          </div>

          <h1 className="font-display mt-7 max-w-5xl text-jumbo text-balance uppercase">
            {adr.title}
          </h1>

          <p className="text-on-ink-muted mt-7 max-w-3xl text-lg leading-relaxed text-pretty">
            {adr.summary}
          </p>

          <div className="mt-9">
            <StackTags items={adr.stack} />
          </div>
        </InkCard>
      </div>

      {/* ------------------------------ Context ----------------------------- */}
      <Band index="01" eyebrow="Problem & context" title="What forced a decision">
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
        index="02"
        eyebrow="Options evaluated"
        title="What was on the table"
        lead="Each option carries the sentence that justifies its verdict — the one a reviewer would push back on."
      >
        <OptionsConsidered adr={adr} />
      </Band>

      {/* ---------------------------- Trade-offs ---------------------------- */}
      {adr.tradeoffs.length > 0 ? (
        <Band
          index="03"
          eyebrow="Trade-off matrix"
          title="What each option costs"
          lead="Scored on the axes that mattered for this decision. The chosen option is deliberately weak somewhere — if it isn't, the criteria were chosen to flatter it."
        >
          <TradeoffMatrix adr={adr} />
        </Band>
      ) : null}

      {/* ----------------------- Decision & reversibility -------------------- */}
      <section className="px-gutter pt-6 sm:pt-8">
        <InkCard className="px-gutter py-12 sm:py-16">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading index="04" eyebrow="Decision" title="What I chose" />
              <p className="mt-8 text-base leading-relaxed text-pretty">{adr.decision}</p>
              {chosen ? (
                <p className={cn('font-mono mt-6 text-micro uppercase', accentText[adr.accent])}>
                  → {chosen.name}
                </p>
              ) : null}
            </div>

            <div className="border-ink-line rounded-panel border p-7 sm:p-8">
              <SectionHeading index="05" eyebrow="Reversibility" title="Cost to undo" />
              <p className="mt-8 text-base leading-relaxed text-pretty">{adr.reversibility}</p>
            </div>
          </div>
        </InkCard>
      </section>

      {/* ----------------------------- Blueprint ---------------------------- */}
      {adr.diagram ? (
        <Band index="06" eyebrow="System blueprint" title="How it fits together">
          <Blueprint name={adr.diagram} />
        </Band>
      ) : null}

      {/* --------------------------- Failure modes -------------------------- */}
      {adr.failureModes.length > 0 ? (
        <Band
          index="07"
          eyebrow="Failure modes"
          title="What happens when it breaks"
          lead="Every dependency is an outage waiting to be scheduled by someone else. These are the ones this design accounts for."
        >
          <FailureModes adr={adr} />
        </Band>
      ) : null}

      {/* ------------------------------ Metrics ----------------------------- */}
      {adr.metrics.length > 0 ? (
        <Band
          index="08"
          eyebrow="Unit economics & outcomes"
          title="What it actually costs"
          lead="Each figure carries its basis. A number without a source is a claim, not a measurement."
        >
          <MetricsStrip adr={adr} />
        </Band>
      ) : null}

      {/* ------------------------------ Long form --------------------------- */}
      <section className="px-gutter pt-6 sm:pt-8">
        <InkCard className="px-gutter py-14 sm:py-20">
          <SectionHeading index="09" eyebrow="Notes" title="The longer argument" />
          <div className="mt-10">
            <MDXContent code={adr.body} />
          </div>
        </InkCard>
      </section>

      {/* ------------------------------- Next ------------------------------- */}
      {next && next.slug !== adr.slug ? (
        <section className="px-gutter pt-6 sm:pt-8">
          <InkCard className="px-gutter py-12">
            <p className="font-mono text-on-ink-muted text-micro uppercase">Next record</p>
            <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
              <h2 className="font-display max-w-3xl text-display text-balance uppercase">
                <Link href={next.url} className="hover:text-cyan">
                  {next.title}
                </Link>
              </h2>
              <ArrowLink href="/architecture" className="text-on-ink-muted hover:text-on-ink">
                All records
              </ArrowLink>
            </div>
          </InkCard>
        </section>
      ) : null}

      <EdgeRail className="pt-8" left={adr.ref} right={`Status — ${adr.status}`} />
    </>
  );
}
