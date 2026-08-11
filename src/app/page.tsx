import Link from 'next/link';
import { site } from '@/lib/site';
import { stackDomains } from '@/lib/stack';
import { allPlaybooks, allPosts, featuredAdrs, formatDate } from '@/lib/content';
import { Hero } from '@/components/home/Hero';
import { AdrCard } from '@/components/adr/AdrCard';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { EdgeRail, InkCard, SectionHeading } from '@/components/ui/Frame';
import { Sticker, Tag, accentText } from '@/components/ui/Sticker';
import { cn } from '@/lib/cn';

/** The three claims a visitor should be able to repeat after ten seconds. */
const positioning = [
  {
    k: 'Decisions, not demos',
    v: 'Every project is written as an architecture decision record: the constraint, the options rejected, and the cost to reverse.',
  },
  {
    k: 'Failure is designed',
    v: 'What happens when the dependency is down is part of the design, not an incident retro.',
  },
  {
    k: 'Cost is an architecture concern',
    v: 'Tokens, calls and cycles are unit economics. I design against a bill, not just a benchmark.',
  },
];

export default function HomePage() {
  const adrs = featuredAdrs(3);
  const playbooks = allPlaybooks().slice(0, 2);
  const posts = allPosts().slice(0, 3);

  return (
    <>
      <EdgeRail
        className="pt-2 pb-3"
        left="Availability: open"
        center="Cloud & AI infrastructure"
        right={
          <>
            Lusaka / Global remote
          </>
        }
      />

      <div className="px-gutter">
        <Hero />
      </div>

      {/* ---------------------------- Positioning ---------------------------- */}
      <section className="px-gutter pt-16 sm:pt-24" aria-labelledby="positioning">
        <InkCard className="px-gutter py-14 sm:py-20">
          <SectionHeading
            index="01"
            eyebrow="How I work"
            title={<span id="positioning">Judgement is the deliverable</span>}
            lead="Anyone can ask a model to scaffold a full-stack app. The scarce part is knowing which of the three plausible architectures survives contact with scale, cost and an on-call rotation."
          />
          <dl className="border-ink-line mt-12 grid gap-px overflow-hidden rounded-panel border bg-current/10 sm:grid-cols-3">
            {positioning.map((p, i) => (
              <div key={p.k} className="bg-ink flex flex-col gap-3 p-6 sm:p-7">
                <span className="font-mono text-on-ink-muted text-micro">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <dt className="font-display text-2xl uppercase">{p.k}</dt>
                <dd className="text-on-ink-muted text-sm leading-relaxed text-pretty">{p.v}</dd>
              </div>
            ))}
          </dl>
        </InkCard>
      </section>

      {/* ------------------------ Featured architectures ---------------------- */}
      <section className="px-gutter pt-6 sm:pt-10" aria-labelledby="featured">
        <InkCard className="px-gutter py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              index="02"
              eyebrow="Featured architectures"
              title={<span id="featured">Decision records</span>}
              lead="Deep dives with the options I evaluated, the trade-off matrix, the failure modes, and what it would take to undo."
            />
            <ArrowLink href="/architecture" className="text-on-ink-muted hover:text-on-ink">
              All records
            </ArrowLink>
          </div>

          {adrs.length > 0 ? (
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {adrs.map((adr) => (
                <AdrCard key={adr.slug} adr={adr} />
              ))}
            </div>
          ) : (
            <p className="text-on-ink-muted mt-12 text-sm">No records published yet.</p>
          )}
        </InkCard>
      </section>

      {/* ----------------------------- Sandbox ------------------------------- */}
      <section className="px-gutter pt-6 sm:pt-10" aria-labelledby="sandbox">
        <InkCard className="overflow-hidden">
          <div className="grid lg:grid-cols-[1.05fr_1fr]">
            <div className="px-gutter py-14 sm:py-20">
              <SectionHeading
                index="03"
                eyebrow="Interactive sandbox"
                title={<span id="sandbox">Ask my writing anything</span>}
                lead="A working retrieval pipeline over this site's own content — real embeddings, hybrid lexical + dense search, reciprocal rank fusion, and streamed generation. The panel beside it shows the actual trace: retrieval timings, fusion scores, tokens and cost."
              />
              <div className="mt-8 flex flex-wrap gap-2">
                {['Hybrid search', 'RRF', 'SSE streaming', 'Live telemetry', 'Rate limited'].map(
                  (t) => (
                    <Tag key={t}>{t}</Tag>
                  ),
                )}
              </div>
              <ArrowLink href="/sandbox" variant="solid" className="mt-9">
                Open the sandbox
              </ArrowLink>
            </div>

            <div className="bg-cream text-on-cream relative isolate grid place-items-center overflow-hidden p-8 lg:rounded-l-[8rem]">
              <div
                aria-hidden="true"
                className="grid-paper grid-paper-fade pointer-events-none absolute inset-0 -z-10 opacity-60"
              />
              <div className="flex flex-col items-center gap-5">
                <Sticker accent="pink" rotate={-5} caption="query → chunks → answer">
                  Retrieval trace
                </Sticker>
                <Sticker accent="cyan" rotate={4} caption="BM25 ⊕ dense · fused">
                  Hybrid ranking
                </Sticker>
                <Sticker accent="yellow" rotate={-3} caption="TTFT · tokens · $">
                  Live telemetry
                </Sticker>
              </div>
            </div>
          </div>
        </InkCard>
      </section>

      {/* ------------------------------ Stack -------------------------------- */}
      <section className="px-gutter pt-6 sm:pt-10" aria-labelledby="stack">
        <InkCard className="px-gutter py-14 sm:py-20">
          <SectionHeading
            index="04"
            eyebrow="Tooling"
            title={<span id="stack">Grouped by concern, not by language</span>}
            lead="A list of technologies says what I've touched. Grouping them by architectural layer says where I make decisions."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {stackDomains.map((d) => (
              <div key={d.domain} className="border-ink-line rounded-panel border p-6">
                <h3 className={cn('font-display text-xl uppercase', accentText[d.accent])}>
                  {d.domain}
                </h3>
                <p className="text-on-ink-muted mt-2.5 text-sm leading-relaxed text-pretty">
                  {d.note}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {d.items.map((i) => (
                    <li key={i}>
                      <Tag>{i}</Tag>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </InkCard>
      </section>

      {/* --------------------------- Writing --------------------------------- */}
      <section className="px-gutter pt-6 sm:pt-10" aria-labelledby="writing">
        <InkCard className="px-gutter py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              index="05"
              eyebrow="Playbooks & writing"
              title={<span id="writing">Standards worth stealing</span>}
              lead="How I think engineering teams should use AI tooling without wrecking repository health — plus the longer-form writing."
            />
            <ArrowLink href="/playbooks" className="text-on-ink-muted hover:text-on-ink">
              All playbooks
            </ArrowLink>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {playbooks.map((p) => (
              <article
                key={p.slug}
                className="group border-ink-line relative rounded-panel border p-6 sm:p-7"
              >
                <p className={cn('font-mono text-micro font-bold uppercase', accentText[p.accent])}>
                  {p.category}
                </p>
                <h3 className="font-display mt-3 text-title uppercase">
                  <Link href={p.url} className="before:absolute before:inset-0 hover:text-cyan">
                    {p.title}
                  </Link>
                </h3>
                <p className="text-on-ink-muted mt-3 text-sm leading-relaxed text-pretty">
                  {p.summary}
                </p>
              </article>
            ))}
          </div>

          {posts.length > 0 ? (
            <ul className="border-ink-line mt-10 divide-y divide-current/10 border-t">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={post.url}
                    className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4 hover:text-cyan"
                  >
                    <span className="text-[0.9375rem] font-medium">{post.title}</span>
                    <span className="font-mono text-on-ink-muted text-micro uppercase">
                      {formatDate(post.publishedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </InkCard>
      </section>

      <EdgeRail
        className="pt-8"
        left={`${site.role} · ${site.location}`}
        right={`© ${site.since} — present`}
      />
    </>
  );
}
