import type { Metadata } from 'next';
import Link from 'next/link';
import { indexMeta } from '@/lib/rag/index-loader';
import { Sandbox } from '@/components/sandbox/Sandbox';
import { EdgeRail, InkCard, SectionHeading } from '@/components/ui/Frame';
import { Blueprint } from '@/components/blueprints';
import { adrBySlug, formatDate } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Sandbox — retrieval over my own writing',
  description:
    'A working hybrid retrieval pipeline over this site: real embeddings, BM25 + dense search fused by reciprocal rank fusion, streamed generation, and the live trace beside it.',
};

/** The index is read at request time so the page always reports the shipped artifact. */
export const dynamic = 'force-dynamic';

export default function SandboxPage() {
  const meta = indexMeta();
  const adr = adrBySlug('portfolio-retrieval-architecture');

  return (
    <>
      <EdgeRail
        className="pt-2 pb-3"
        left="Interactive sandbox"
        center="Retrieval + generation"
        right={meta.chunks > 0 ? `Index built ${formatDate(meta.builtAt)}` : 'Index not built'}
      />

      <div className="px-gutter">
        <InkCard className="px-gutter py-14 sm:py-20">
          <h1 className="font-display text-jumbo text-balance uppercase">
            Ask my
            <br />
            writing
          </h1>
          <p className="text-on-ink-muted mt-8 max-w-3xl text-lg leading-relaxed text-pretty">
            This is not a chat widget bolted onto a marketing page. It is the pipeline from{' '}
            {adr ? (
              <Link href={adr.url} className="text-on-ink underline decoration-cyan underline-offset-4">
                {adr.ref}
              </Link>
            ) : (
              'the retrieval ADR'
            )}
            , running for real: {meta.chunks} indexed passages, two retrieval paths fused by rank,
            and a trace panel showing what actually happened rather than a spinner.
          </p>

          <div className="mt-12">
            <Sandbox indexChunks={meta.chunks} indexModel={meta.model} />
          </div>
        </InkCard>
      </div>

      <section className="px-gutter pt-6 sm:pt-10">
        <InkCard className="px-gutter py-14 sm:py-20">
          <SectionHeading
            index="01"
            eyebrow="What you're looking at"
            title="The pipeline, drawn"
            lead="Two paths run against the same chunks. The dense path handles paraphrase; the lexical path handles the rare, specific terms embeddings smooth away. Rank-based fusion combines them without needing the two score scales to be calibrated against each other."
          />
          <div className="mt-12">
            <Blueprint name="retrieval-pipeline" />
          </div>
        </InkCard>
      </section>

      <section className="px-gutter pt-6 sm:pt-10">
        <InkCard className="px-gutter py-14 sm:py-20">
          <SectionHeading
            index="02"
            eyebrow="Honest limits"
            title="What this demo is not"
            lead="Every claim on this page should be checkable, including the unflattering ones."
          />
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                t: 'Not scalable as built',
                d: 'Scoring is brute-force over every chunk. That is correct at this corpus size and wrong past a few thousand chunks — the build fails rather than silently shipping a slow index.',
              },
              {
                t: 'Not a security boundary',
                d: 'Rate limiting is a per-instance in-memory counter. It bounds token spend on a personal demo; it would not stop a determined attacker, and it is not pretending to.',
              },
              {
                t: 'Not load-tested',
                d: 'The measured latencies are single-user. Designing for the traffic that exists is a decision; claiming to have measured traffic that does not is not.',
              },
            ].map((x) => (
              <li key={x.t} className="border-ink-line rounded-panel border p-6">
                <h3 className="font-display text-lg uppercase">{x.t}</h3>
                <p className="text-on-ink-muted mt-3 text-sm leading-relaxed text-pretty">{x.d}</p>
              </li>
            ))}
          </ul>
        </InkCard>
      </section>

      <EdgeRail className="pt-8" left="Sandbox" right={`${meta.chunks} passages indexed`} />
    </>
  );
}
