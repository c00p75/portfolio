import Link from 'next/link';
import { allPlaybooks, allPosts, featuredProjects, formatDate } from '@/lib/content';
import { Hero } from '@/components/home/Hero';
import { SelectedWork } from '@/components/home/SelectedWork';
import { AskChatButton } from '@/components/ask/AskChatButton';
import { indexMeta } from '@/lib/rag/index-loader';
import { HOME_SUGGESTIONS } from '@/lib/rag/suggestions';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { EdgeRail, InkCard, SectionHeading } from '@/components/ui/Frame';
import { accentSurface, accentText, type Accent } from '@/components/ui/Sticker';
import { StackGrid } from '@/components/stack/StackGrid';
import { FlightPath } from '@/components/home/FlightPath';
import { cn } from '@/lib/cn';

/**
 * The step marker used on the practice cards. Filled rather than coloured
 * text: every accent in the palette falls well under 4.5:1 as a foreground,
 * so the hue has to carry the background instead.
 */
function StepNumber({ n, accent }: { n: number; accent: Accent }) {
  return (
    <span
      className={cn(
        'font-mono inline-flex size-7 shrink-0 items-center justify-center self-start rounded-sm text-[0.6875rem] font-bold tabular-nums',
        accentSurface[accent],
      )}
    >
      {String(n).padStart(2, '0')}
    </span>
  );
}

const practice = [
  {
    label: 'Software engineering',
    k: 'Fast with AI, gated by review',
    v: "I use AI aggressively for the drafting and keep every checkpoint that catches a bad idea. Generated code gets read line by line; if I can't explain it in review, it doesn't ship.",
    points: [
      'AI drafts, humans merge',
      'Every generated line gets read',
      'Faster to the first draft, same bar at the gate',
    ],
    accent: 'cyan' as const,
  },
  {
    label: 'Leadership',
    k: 'Lead from inside the work',
    v: 'Titles are easier to respect when the person holding one is in the same repo — I take real tickets and sit in the same review queue. The rest of the job is stating the goal, the constraints and the bar out loud, then carrying context across the gap: what the business needs into the backlog, what the constraint costs back into the room where budgets get set.',
    points: [
      'Real tickets, same review queue',
      'The goal, the constraint and the bar, in writing',
      'Trade-offs priced in money and risk',
    ],
    accent: 'pink' as const,
  },
  {
    label: 'Architecture',
    k: 'Show the options you rejected',
    v: 'A design is only settled once the alternatives are written down next to it. I price the running cost, the failure behaviour and the lock-in while I am choosing — not at the first invoice or the first outage.',
    points: [
      'Every choice ships with its rejected alternative',
      'Cost, failure and lock-in priced while choosing',
      'The record has to outlast the person who had it',
    ],
    accent: 'yellow' as const,
  },
] as const;

export default function HomePage() {
  const meta = indexMeta();
  const projects = featuredProjects(4);
  const playbooks = allPlaybooks().slice(0, 2);
  const posts = allPosts().slice(0, 3);

  return (
    <>
      <EdgeRail
        className="pt-2 pb-3"
        left="Availability: open"
        center="Web · Mobile · AI"
        right="On-site / Remote"
      />

      {/* Full-bleed on purpose: the hero card runs to the viewport edges, so
          the cream panel has no grey margin beside it. `z-10` puts it above
          the flight layer, so the plane's lead-in is hidden behind the paper
          and it flies out from under the panel rather than popping into
          existence at the seam. */}
      <div className="relative z-10">
        <Hero />
      </div>

      {/* Everything after the hero shares a positioning context with the
          flight path, so the flight starts where the hero ends. */}
      <div className="relative">
        <FlightPath />

      {/* ---------------------------- Selected work --------------------------- */}
      {/* The portfolio leads with what exists, not with how I document it. */}
      <section className="px-edge pt-16 sm:pt-24" aria-labelledby="work">
        <InkCard className="px-card py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              index="01"
              eyebrow="Selected work"
              title={<span id="work">Projects</span>}
              lead="Four systems. The case studies are on the work page — this is the scan."
            />
            <ArrowLink href="/work" className="text-on-ink-muted hover:text-on-ink">
              All work
            </ArrowLink>
          </div>

          <SelectedWork projects={projects} />
        </InkCard>
      </section>

      {/* -------------------------- How I work ------------------------------- */}
      {/* Engineering, leadership and architecture as one job — not a process
          strip that only talks about decisions. */}
      <section className="px-edge pt-6 sm:pt-10" aria-labelledby="how-i-work">
        <InkCard className="px-card py-14 sm:py-20">
          <SectionHeading
            index="02"
            eyebrow="Practice"
            title={<span id="how-i-work">How I work</span>}
            lead="I build the system, I lead the people who ship it, and I write down why it is shaped the way it is. The three are the same job — a preference that never meets a constraint does not survive any of them."
          />

          <dl className="mt-12 grid gap-px overflow-hidden rounded-panel bg-current/10 lg:grid-cols-3">
            {practice.map((p, i) => (
              <div key={p.k} className="bg-ink flex flex-col gap-3 p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <StepNumber n={i + 1} accent={p.accent} />
                  <p className="font-mono text-micro font-semibold tracking-widest uppercase opacity-70">
                    {p.label}
                  </p>
                </div>
                <dt className="font-display text-xl uppercase">{p.k}</dt>
                <dd className="text-on-ink text-sm leading-relaxed text-pretty">{p.v}</dd>
                <ul className="text-on-ink-muted mt-1 flex flex-col gap-1.5 text-xs leading-relaxed">
                  {p.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-[0.35em] size-1 shrink-0 rounded-full bg-current"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </dl>
        </InkCard>
      </section>

      {/* ----------------------------- AI & retrieval ------------------------- */}
      {/* The other capability strip. The sandbox is the exhibit — a working
          pipeline beats any claim about having built one. */}
      <section className="px-edge pt-6 sm:pt-10" aria-labelledby="ai">
        <InkCard className="px-card py-14 sm:py-20">
          <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <SectionHeading
                index="03"
                eyebrow="Ask this site"
                title={<span id="ai">Working, not claimed</span>}
                lead="Ask a question about my work and get an answer drawn from what is actually written here, with the passages it used shown alongside. If the answer is not on the site, it says so instead of inventing one — which is the hard part, and the reason this is a demo rather than a claim."
              />

              {/*
               * Concrete openings, as a list rather than pills. Question-length
               * strings wrap raggedly as chips; ruled rows stay aligned at any
               * width and read as a menu you can run your eye down.
               */}
              <p className="font-mono text-on-ink-muted mt-10 text-micro uppercase">
                Try asking
              </p>
              <ul className="border-ink-line mt-3 border-t">
                {HOME_SUGGESTIONS.map((q) => (
                  <li key={q} className="border-ink-line border-b">
                    <AskChatButton
                      question={q}
                      variant="outline"
                      className="text-on-ink-muted hover:text-on-ink group w-full justify-between rounded-none border-0 px-0 py-3.5 text-left text-sm tracking-normal normal-case"
                    >
                      <span>{q}</span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                      >
                        →
                      </span>
                    </AskChatButton>
                  </li>
                ))}
              </ul>

              {/* Primary action last: the reader has just been given three
                  things to ask, so the button is the answer to "how". */}
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                <AskChatButton>Ask your own</AskChatButton>
                <ArrowLink
                  href="/work/brutus"
                  className="text-on-ink-muted hover:text-on-ink no-underline"
                >
                  AI in production
                </ArrowLink>
              </div>
            </div>

            {/*
             * The exhibit. Written for a reader who does not build these — it
             * answers "what will it tell me, and can I trust it" rather than
             * naming the algorithms. The counts come from the built artefact,
             * so they cannot drift from what actually ships. Engineers get the
             * mechanism in the footnote and the full trace on /sandbox.
             */}
            <div className="border-ink-line rounded-panel border">
              <div className="border-ink-line flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-6 py-4">
                <p className={cn('font-mono text-micro font-bold uppercase', accentText.lime)}>
                  Running now
                </p>
                <p className="font-mono text-on-ink-muted text-micro uppercase">
                  Updated {formatDate(meta.builtAt)}
                </p>
              </div>

              <dl className="divide-ink-line divide-y">
                {[
                  {
                    k: 'What it reads',
                    v: `Everything written on this site — ${meta.chunks} passages — plus my CV, certifications, LinkedIn history and public GitHub.`,
                  },
                  {
                    k: 'What it answers',
                    v: 'Questions about my experience, the projects, and the decisions behind them.',
                  },
                  {
                    k: "When it doesn't know",
                    v: 'It says so. It will not fill the gap with something plausible.',
                  },
                  {
                    k: 'How to check it',
                    v: 'Every answer shows the passages it came from, so you can read the source yourself.',
                  },
                ].map((row) => (
                  <div key={row.k} className="px-6 py-4">
                    <dt className="font-mono text-on-ink-muted text-micro uppercase">{row.k}</dt>
                    <dd className="text-on-ink mt-1.5 text-sm leading-relaxed text-pretty">
                      {row.v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="border-ink-line border-t px-6 py-5">
                <p className="text-on-ink-muted text-xs leading-relaxed text-pretty">
                  For the engineers: hybrid keyword and vector search over {meta.model} embeddings,
                  fused with RRF, streamed over SSE.{' '}
                  <Link
                    href="/sandbox"
                    className="hover:text-on-ink underline underline-offset-4"
                  >
                    The full trace is on /sandbox
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </InkCard>
      </section>

      {/* ------------------------------ Stack -------------------------------- */}
      <section className="px-edge pt-6 sm:pt-10" aria-labelledby="stack">
        <InkCard className="px-card py-14 sm:py-20">
          <SectionHeading
            index="04"
            eyebrow="Tooling"
            title={<span id="stack">What I work with</span>}
            lead="Grouped by the layer each tool sits in, which says a little more than an alphabetical wall of logos."
          />
          <StackGrid className="mt-12" />
        </InkCard>
      </section>

      {/* --------------------------- Writing --------------------------------- */}
      <section className="px-edge pt-6 sm:pt-10" aria-labelledby="writing">
        <InkCard className="px-card py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              index="05"
              eyebrow="Writing"
              title={<span id="writing">Playbooks and articles</span>}
              lead="Standards I would bring to a team adopting AI coding tools, and articles on things I have had to work out."
            />
            <ArrowLink href="/blog" className="text-on-ink-muted hover:text-on-ink">
              All writing
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
                <p className="text-on-ink mt-3 text-sm leading-relaxed text-pretty">{p.summary}</p>
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

      </div>
    </>
  );
}
