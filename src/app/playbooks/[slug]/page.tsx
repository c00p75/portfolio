import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allPlaybooks, formatDate, playbookBySlug } from '@/lib/content';
import { MDXContent } from '@/components/mdx/MDXContent';
import { EdgeRail, InkCard } from '@/components/ui/Frame';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { accentText, Tag } from '@/components/ui/Sticker';
import { cn } from '@/lib/cn';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allPlaybooks().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = playbookBySlug(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    openGraph: { title: p.title, description: p.summary, type: 'article' },
  };
}

export default async function PlaybookPage({ params }: Params) {
  const { slug } = await params;
  const playbook = playbookBySlug(slug);
  if (!playbook) notFound();

  return (
    <>
      <EdgeRail
        className="pt-2 pb-3"
        left={playbook.category}
        center="Playbook"
        right={formatDate(playbook.date)}
      />

      <div className="px-gutter">
        <InkCard className="px-gutter py-14 sm:py-20">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={cn('font-mono text-micro font-bold uppercase', accentText[playbook.accent])}>
              {playbook.category}
            </span>
            {playbook.draft ? <Tag className="text-yellow border-yellow">Scaffold</Tag> : null}
          </div>

          <h1 className="font-display mt-7 max-w-5xl text-jumbo text-balance uppercase">
            {playbook.title}
          </h1>

          <p
            className={cn(
              'mt-9 max-w-3xl border-l-2 pl-5 text-lg leading-relaxed text-pretty',
              accentText[playbook.accent],
            )}
          >
            {playbook.principle}
          </p>
        </InkCard>
      </div>

      <section className="px-gutter pt-6 sm:pt-10">
        <InkCard className="px-gutter py-14 sm:py-20">
          <MDXContent code={playbook.body} />
        </InkCard>
      </section>

      <section className="px-gutter pt-6 sm:pt-10">
        <InkCard className="px-gutter py-12">
          <ArrowLink href="/playbooks" className="text-on-ink-muted hover:text-on-ink">
            All playbooks
          </ArrowLink>
        </InkCard>
      </section>

      <EdgeRail className="pt-8" left={playbook.category} right={formatDate(playbook.date)} />
    </>
  );
}
