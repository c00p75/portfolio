import type { Metadata } from 'next';
import Link from 'next/link';
import { allPlaybooks, formatDate } from '@/lib/content';
import { EdgeRail, InkCard } from '@/components/ui/Frame';
import { accentText, Tag } from '@/components/ui/Sticker';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: 'Playbooks',
  description:
    'Engineering standards and governance playbooks: how teams can use AI tooling without wrecking repository health, code quality, or security.',
};

export default function PlaybooksIndex() {
  const playbooks = allPlaybooks();

  return (
    <>
      <EdgeRail className="pt-2 pb-3" left="Playbooks" center="Standards & governance" right={`${playbooks.length} published`} />

      <div className="px-gutter">
        <InkCard className="px-gutter py-14 sm:py-20">
          <h1 className="font-display text-jumbo text-balance uppercase">Playbooks</h1>
          <p className="text-on-ink-muted mt-8 max-w-2xl text-lg leading-relaxed text-pretty">
            The standards I&apos;d bring to a team: how to keep repository health, review capacity
            and architectural coherence intact when code generation gets cheap.
          </p>
        </InkCard>
      </div>

      <section className="px-gutter pt-6 sm:pt-10">
        <InkCard className="px-gutter py-14 sm:py-20">
          {playbooks.length > 0 ? (
            <ul className="grid gap-5 lg:grid-cols-2">
              {playbooks.map((p) => (
                <li key={p.slug}>
                  <article className="group border-ink-line relative flex h-full flex-col gap-4 rounded-panel border p-7">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={cn('font-mono text-micro font-bold uppercase', accentText[p.accent])}>
                        {p.category}
                      </span>
                      {p.draft ? <Tag className="text-yellow border-yellow">Scaffold</Tag> : null}
                      <span className="font-mono text-on-ink-muted ml-auto text-micro uppercase">
                        {formatDate(p.date)}
                      </span>
                    </div>

                    <h2 className="font-display text-title text-balance uppercase">
                      <Link href={p.url} className="before:absolute before:inset-0 hover:text-cyan">
                        {p.title}
                      </Link>
                    </h2>

                    <p className={cn('border-l-2 pl-4 text-sm leading-relaxed text-pretty', accentText[p.accent])}>
                      {p.principle}
                    </p>

                    <p className="text-on-ink-muted text-sm leading-relaxed text-pretty">{p.summary}</p>

                    {p.tags.length > 0 ? (
                      <ul className="mt-auto flex flex-wrap gap-2 pt-2">
                        {p.tags.map((t) => (
                          <li key={t}>
                            <Tag>{t}</Tag>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-on-ink-muted text-sm">No playbooks published yet.</p>
          )}
        </InkCard>
      </section>

      <EdgeRail className="pt-8" left="Playbooks" right={`${playbooks.length} total`} />
    </>
  );
}
