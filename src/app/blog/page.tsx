import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { allPlaybooks, allPosts, formatDate } from '@/lib/content';
import { RollPath } from '@/components/blog/RollPath';
import { EdgeRail, InkCard, SectionHeading } from '@/components/ui/Frame';
import { accentText, Tag } from '@/components/ui/Sticker';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Engineering standards for teams adopting AI tooling, plus articles on software development and practice.',
};

/**
 * Writing now holds both playbooks and articles. Playbooks had their own section
 * and nav slot, which one published playbook did not earn — and the split made a
 * reader guess which of two indexes held the thing they wanted.
 */
export default function WritingIndex() {
  const playbooks = allPlaybooks();
  const posts = allPosts();
  const total = playbooks.length + posts.length;

  /**
   * Articles are grouped by year rather than run as one undifferentiated
   * list. With a gap between the newest playbook and the older articles, a
   * flat list reads as a neglected blog; dated groups read as an archive,
   * which is what it is.
   */
  const years = [...new Set(posts.map((p) => p.publishedAt.slice(0, 4)))].sort((a, b) =>
    b.localeCompare(a),
  );

  return (
    <>
      <EdgeRail
        className="pt-2 pb-3"
        left="Writing"
        center="Playbooks & articles"
        right={`${total} piece${total === 1 ? '' : 's'}`}
      />

      {/* Everything below the intro shares a positioning context with the
          trail, so the draft starts rolling where the intro ends. */}
      <div className="relative">
        <RollPath />

      {/* `z-10` keeps the intro above the roll trail, so the ball comes out from
          behind this card rather than appearing at the seam. */}
      <div className="relative z-10 px-edge">
        <InkCard className="px-card py-14 sm:py-20">
          {/* Two columns so the counts rule below stops short of the right edge
              and leaves the sheet room to sit there. */}
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-14">
            <div>
              <h1 className="font-display text-jumbo text-balance uppercase">Writing</h1>
              <p className="text-on-ink mt-8 max-w-2xl text-lg leading-relaxed text-pretty">
                Playbooks are standards I would bring to a team — currently, how to keep repository
                health, review capacity and architectural coherence intact when code generation gets
                cheap. Below them, an archive of earlier articles.
              </p>
              <p className="text-on-ink mt-5 max-w-2xl text-base leading-relaxed text-pretty">
                The design write-ups live with the systems they belong to, over in{' '}
                <Link href="/work" className="text-on-ink underline decoration-cyan underline-offset-4">
                  Work
                </Link>
                .
              </p>

              {/* Counts up front, so the shape of the page is legible before scrolling. */}
              <dl className="border-ink-line mt-10 flex flex-wrap gap-x-12 gap-y-4 border-t pt-8">
                {[
                  { k: 'Playbooks', v: String(playbooks.length) },
                  { k: 'Articles', v: String(posts.length) },
                  { k: 'Decision records', v: 'In Work' },
                ].map((s) => (
                  <div key={s.k}>
                    <dt className="font-mono text-on-ink-muted text-micro uppercase">{s.k}</dt>
                    <dd className="font-display mt-1.5 text-xl uppercase tabular-nums">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* The sheet the rolled-up draft below started life as. Slightly
                off-square so it reads as pinned up rather than placed. */}
            <Image
              src="/icons/paper-writing-2.png"
              alt=""
              aria-hidden="true"
              width={922}
              height={614}
              priority
              className="pointer-events-none hidden h-auto w-[clamp(22rem,35vw,38rem)] rotate-2 select-none drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)] lg:block"
            />
          </div>
        </InkCard>
      </div>

      {/* ----------------------------- Playbooks ----------------------------- */}
      {playbooks.length > 0 ? (
        <section className="px-edge pt-6 sm:pt-10">
          <InkCard className="px-card py-14 sm:py-20">
            <SectionHeading
              index="01"
              eyebrow="Playbooks"
              title="Standards & governance"
              lead="Each one leads with the single rule it exists to enforce."
            />
            {/*
             * Full-width rows rather than a two-column grid. With one playbook
             * published, a grid left half the row empty and made the strongest
             * thing on the page look like a stub; rows scale to any count and
             * give the principle room to be read as a pull quote.
             */}
            <ul className="mt-12 flex flex-col gap-5">
              {playbooks.map((p) => (
                <li key={p.slug}>
                  <article className="group border-ink-line hover:border-current/40 relative rounded-panel border p-7 transition-colors sm:p-9">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={cn(
                          'font-mono text-micro font-bold uppercase',
                          accentText[p.accent],
                        )}
                      >
                        {p.category}
                      </span>
                      {p.draft ? <Tag className="text-yellow border-yellow">Scaffold</Tag> : null}
                      <span className="font-mono text-on-ink-muted ml-auto text-micro uppercase">
                        {formatDate(p.date)}
                      </span>
                    </div>

                    <h3 className="font-display mt-5 max-w-3xl text-title text-balance uppercase">
                      <Link href={p.url} className="hover:text-cyan before:absolute before:inset-0">
                        {p.title}
                      </Link>
                    </h3>

                    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-10">
                      {/* The rule it exists to enforce, set as the pull quote it is. */}
                      <p
                        className={cn(
                          'border-l-2 pl-5 text-base leading-relaxed text-pretty',
                          accentText[p.accent],
                        )}
                      >
                        {p.principle}
                      </p>
                      <p className="text-on-ink text-sm leading-relaxed text-pretty">{p.summary}</p>
                    </div>

                    <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                      {p.tags.length > 0 ? (
                        <ul className="flex flex-wrap gap-2">
                          {p.tags.map((t) => (
                            <li key={t}>
                              <Tag>{t}</Tag>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <span className="font-mono text-on-ink-muted group-hover:text-on-ink ml-auto flex items-center gap-2 text-micro uppercase transition-colors">
                        Read the playbook
                        <span
                          aria-hidden="true"
                          className="transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                        >
                          →
                        </span>
                      </span>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </InkCard>
        </section>
      ) : null}

      {/* ------------------------------ Articles ----------------------------- */}
      <section className="px-edge pt-6 sm:pt-10">
        <InkCard className="px-card py-14 sm:py-20">
          <SectionHeading
            index="02"
            eyebrow="Archive"
            title="Earlier articles"
            lead="Shorter pieces written while I was learning in public. Kept as published rather than quietly deleted."
          />
          {posts.length > 0 ? (
            years.map((year) => (
              <section key={year} className="mt-12" aria-label={`Articles from ${year}`}>
                <h3 className="border-ink-line font-mono text-on-ink-muted border-b pb-3 text-micro tracking-widest uppercase tabular-nums">
                  {year}
                </h3>
                <ul className="divide-ink-line divide-y">
                  {posts
                    .filter((post) => post.publishedAt.startsWith(year))
                    .map((post) => (
                      <li key={post.slug}>
                        <article className="group relative flex flex-col gap-2 py-7 lg:flex-row lg:items-baseline lg:gap-10">
                          {/* Date and length as one meta column: two separate
                              columns pushed the title into a narrow middle
                              lane for no gain. */}
                          <p className="font-mono text-on-ink-muted flex shrink-0 gap-3 text-micro uppercase lg:w-40 lg:flex-col lg:gap-1.5">
                            <span>{formatDate(post.publishedAt)}</span>
                            <span className="opacity-70">{post.metadata.readingTime} min read</span>
                          </p>
                          <div className="flex-1">
                            <h4 className="font-display max-w-2xl text-xl text-balance uppercase">
                              <Link
                                href={post.url}
                                className="hover:text-cyan before:absolute before:inset-0"
                              >
                                {post.title}
                              </Link>
                            </h4>
                            <p className="text-on-ink mt-2.5 max-w-2xl text-sm leading-relaxed text-pretty">
                              {post.description}
                            </p>
                          </div>
                          <span
                            aria-hidden="true"
                            className="text-on-ink-muted group-hover:text-on-ink hidden shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 lg:block"
                          >
                            →
                          </span>
                        </article>
                      </li>
                    ))}
                </ul>
              </section>
            ))
          ) : (
            <p className="text-on-ink mt-10 text-sm">No articles yet.</p>
          )}
        </InkCard>
      </section>
      </div>
    </>
  );
}
