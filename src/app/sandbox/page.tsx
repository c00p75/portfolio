import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { indexMeta } from '@/lib/rag/index-loader';
import { Sandbox } from '@/components/sandbox/Sandbox';
import { WalkPath } from '@/components/sandbox/WalkPath';
import { EdgeRail, InkCard, SectionHeading } from '@/components/ui/Frame';
import { Blueprint } from '@/components/blueprints';
import { adrBySlug, formatDate } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Sandbox — retrieval over my own writing',
  description:
    'A working hybrid retrieval pipeline over this site: BM25 and dense search combined by reciprocal rank fusion, streamed generation, and a live trace of each stage.',
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

      {/* `z-10` keeps the intro above the walk trail, so the robot steps out
          from behind this card rather than appearing at the seam. */}
      <div className="relative z-10 px-edge">
        <InkCard className="px-card py-14 sm:py-20">
          {/* The robot sits to the right of the copy, standing where the walk
              trail below begins — the trail's first waypoint is x=0.82, so this
              reads as the pose it holds before it sets off. Dropped below `lg`,
              where there is no room beside the text for it to be anything but
              a squeezed thumbnail. */}
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
            <div>
              <h1 className="font-display text-jumbo text-balance uppercase">
                Ask my
                <br />
                writing
              </h1>
              <p className="text-on-ink mt-8 max-w-3xl text-lg leading-relaxed text-pretty">
                This runs the pipeline described in{' '}
                {adr ? (
                  <Link href={adr.url} className="text-on-ink underline decoration-cyan underline-offset-4">
                    {adr.ref}
                  </Link>
                ) : (
                  'the retrieval ADR'
                )}
{' '}
                against {meta.chunks} passages indexed from this site — case studies, decision records,
                and a profile feed (education, certifications, LinkedIn history, public GitHub). Two retrieval paths, combined by
                rank, with a trace panel beside the answer so you can see which passages it used and how
                long each step took.
              </p>
            </div>

            <Image
              src="/icons/paper-robot-standing.png"
              alt=""
              aria-hidden="true"
              width={561}
              height={701}
              priority
              className="pointer-events-none hidden h-auto w-[clamp(14rem,24vw,24rem)] select-none lg:block"
            />
          </div>

          <div className="mt-12">
            <Sandbox indexChunks={meta.chunks} indexModel={meta.model} />
          </div>
        </InkCard>
      </div>

      {/* Everything below the intro shares a positioning context with the
          trail, so the walk starts where the intro ends. */}
      <div className="relative">
        <WalkPath />

      <section className="px-edge pt-6 sm:pt-10">
        <InkCard className="px-card py-14 sm:py-20">
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

      <section className="px-edge pt-6 sm:pt-10">
        <InkCard className="px-card py-14 sm:py-20">
          <SectionHeading
            index="02"
            eyebrow="Scope"
            title="What it is built for"
            lead="The size this is designed against, and the point at which each choice would have to change. These are the first things I would ask about if someone showed me this."
          />
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                t: 'Sized for this corpus',
                d: 'Scoring is brute-force over every chunk, which is the right answer at this size and the wrong one past a few thousand. The threshold is enforced: the build fails rather than silently shipping a slow index.',
              },
              {
                t: 'Spend is capped',
                d: 'Per-IP and global limits run through a shared store, so the ceiling holds across serverless instances rather than resetting per cold start. The cap exists to bound token spend, and it is set low on purpose.',
              },
              {
                t: 'Measured single-user',
                d: 'The latencies in the trace are real, and they are from one user at a time. Concurrent behaviour is not something I have measured, so I do not quote a number for it.',
              },
            ].map((x) => (
              <li key={x.t} className="border-ink-line rounded-panel border p-6">
                <h3 className="font-display text-lg uppercase">{x.t}</h3>
                <p className="text-on-ink mt-3 text-sm leading-relaxed text-pretty">{x.d}</p>
              </li>
            ))}
          </ul>
        </InkCard>
      </section>

      <EdgeRail className="pt-8" left="Sandbox" right={`${meta.chunks} passages indexed`} />
      </div>
    </>
  );
}
