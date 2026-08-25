import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allPlaybooks, formatDate, playbookBySlug } from '@/lib/content';
import { MDXContent } from '@/components/mdx/MDXContent';
import { ArticleToc } from '@/components/blog/ArticleToc';
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

      <div className="px-edge">
        <InkCard className="px-card py-14 sm:py-20">
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

      <section className="px-edge pt-6 sm:pt-10">
        {/*
         * `overflow-visible` overrides InkCard's default clip: an
         * `overflow: hidden` ancestor is a scrollport, so the sticky rail
         * would scroll with the card instead of pinning. `items-start` stops
         * the aside stretching to the article height, which would do the same.
         */}
        <InkCard className="px-card overflow-visible py-14 sm:py-20">
          <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-16">
            <MDXContent code={playbook.body} />
            <ArticleToc toc={playbook.toc} className="sticky top-24 hidden xl:block" />
          </div>
        </InkCard>
      </section>

      <section className="px-edge pt-6 sm:pt-10">
        <InkCard className="px-card py-12">
          <ArrowLink href="/playbooks" className="text-on-ink-muted hover:text-on-ink">
            All playbooks
          </ArrowLink>
        </InkCard>
      </section>

      <EdgeRail className="pt-8" left={playbook.category} right={formatDate(playbook.date)} />
    </>
  );
}
