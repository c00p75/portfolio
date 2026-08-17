import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { adrsByProject, allProjects, formatDate, projectBySlug } from '@/lib/content';
import { MDXContent } from '@/components/mdx/MDXContent';
import { Blueprint } from '@/components/blueprints';
import { StatusPill } from '@/components/work/ProjectCard';
import { ProjectMedia } from '@/components/work/ProjectMedia';
import { MetricsStrip, StackTags } from '@/components/adr/sections';
import { StatusPill as AdrStatusPill } from '@/components/adr/AdrCard';
import { EdgeRail, InkCard, SectionHeading } from '@/components/ui/Frame';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { accentText, Tag } from '@/components/ui/Sticker';
import { cn } from '@/lib/cn';
import Image from 'next/image';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${project.tagline}`,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      type: 'article',
      images: project.cover ? [project.cover.src] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const decisions = adrsByProject(project.slug);
  const hasMedia = Boolean(project.video || (project.gallery?.length ?? 0) > 0);
  let section = 0;
  const nextIndex = () => String(++section).padStart(2, '0');

  return (
    <>
      <EdgeRail
        className="pt-2 pb-3"
        left={project.client}
        center={project.disciplines.join(' · ') || 'Case study'}
        right={project.period}
      />

      {/* ------------------------------ Header ------------------------------ */}
      <div className="px-edge">
        <InkCard className="px-card py-14 sm:py-20">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={project.status} />
            {project.disciplines.map((d) => (
              <Tag key={d}>{d}</Tag>
            ))}
          </div>

          <h1 className="font-display mt-7 text-jumbo text-balance uppercase">{project.title}</h1>
          <p className={cn('mt-4 max-w-3xl text-xl leading-snug text-pretty', accentText[project.accent])}>
            {project.tagline}
          </p>

          <p className="text-on-ink mt-7 max-w-3xl text-lg leading-relaxed text-pretty">
            {project.summary}
          </p>

          {project.cover ? (
            <div className="border-ink-line mt-10 overflow-hidden rounded-panel border">
              <Image
                src={project.cover.src}
                alt={`${project.title} interface`}
                width={project.cover.width ?? 1600}
                height={project.cover.height ?? 1000}
                priority
                className="h-auto w-full object-cover object-top"
                sizes="(max-width: 1100px) 100vw, 1100px"
              />
            </div>
          ) : null}

          {project.statusNote ? (
            <p className="border-ink-line text-on-ink mt-8 max-w-3xl border-l-2 pl-5 text-sm leading-relaxed text-pretty">
              <span className="font-mono text-on-ink-muted mr-2 text-micro uppercase">Status</span>
              {project.statusNote}
            </p>
          ) : null}

          <dl className="border-ink-line mt-11 grid gap-8 border-t pt-8 sm:grid-cols-3">
            {(
              [
                ['Built for', project.client],
                ['My role', project.role],
                ['When', project.period],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-on-ink-muted text-micro uppercase">{label}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-pretty">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-9">
            <StackTags items={project.stack} />
          </div>

          {project.links.length > 0 ? (
            <div className="mt-9 flex flex-wrap gap-3">
              {project.links.map((l, i) => (
                <ArrowLink
                  key={l.href}
                  href={l.href}
                  variant={i === 0 ? 'solid' : 'outline'}
                  {...(l.href.startsWith('http')
                    ? { target: '_blank', rel: 'noreferrer' }
                    : {})}
                >
                  {l.label}
                </ArrowLink>
              ))}
            </div>
          ) : null}
        </InkCard>
      </div>

      {/* ------------------------------ Media -------------------------------- */}
      {hasMedia ? (
        <section className="px-edge pt-6 sm:pt-10" aria-labelledby="project-media">
          <InkCard className="px-card py-14 sm:py-20">
            <SectionHeading
              index={nextIndex()}
              eyebrow="Look & feel"
              title={<span id="project-media">Screens and demos</span>}
              lead="What it looks like in use — not just what it was designed to do."
            />
            <div className="mt-12">
              <ProjectMedia video={project.video} gallery={project.gallery ?? []} />
            </div>
          </InkCard>
        </section>
      ) : null}

      {/* --------------------------- What made it hard ----------------------- */}
      {project.highlights.length > 0 ? (
        <section className="px-edge pt-6 sm:pt-10">
          <InkCard className="px-card py-14 sm:py-20">
            <SectionHeading
              index={nextIndex()}
              eyebrow="The engineering"
              title="What made it hard"
              lead="The problems worth reading about. Everything else in this system was ordinary work."
            />
            <ol className="mt-12 flex flex-col gap-px overflow-hidden rounded-panel bg-current/10">
              {project.highlights.map((h, i) => (
                <li key={i} className="bg-ink flex gap-6 p-6 sm:gap-8 sm:p-8">
                  <span
                    className={cn(
                      'font-display shrink-0 text-3xl leading-none',
                      accentText[project.accent],
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="max-w-3xl text-base leading-relaxed text-pretty">{h}</p>
                </li>
              ))}
            </ol>
          </InkCard>
        </section>
      ) : null}

      {/* ------------------------------ Numbers ----------------------------- */}
      {project.metrics.length > 0 ? (
        <section className="px-edge pt-6 sm:pt-10">
          <InkCard className="px-card py-14 sm:py-20">
            <SectionHeading
              index={nextIndex()}
              eyebrow="Numbers"
              title="What it measures"
              lead="Each figure says where it came from, so you can judge how much weight to give it. Some are measurements and some are chosen thresholds; the basis line tells you which."
            />
            <div className="mt-12">
              <MetricsStrip metrics={project.metrics} accent={project.accent} />
            </div>
          </InkCard>
        </section>
      ) : null}

      {/* ----------------------------- Blueprint ---------------------------- */}
      {project.diagram ? (
        <section className="px-edge pt-6 sm:pt-10">
          <InkCard className="px-card py-14 sm:py-20">
            <SectionHeading index={nextIndex()} eyebrow="Blueprint" title="How it fits together" />
            <div className="mt-12">
              <Blueprint name={project.diagram} />
            </div>
          </InkCard>
        </section>
      ) : null}

      {/* ------------------------------ Long form --------------------------- */}
      <section className="px-edge pt-6 sm:pt-10">
        <InkCard className="px-card py-14 sm:py-20">
          <SectionHeading eyebrow="Write-up" title="The longer version" />
          <div className="mt-10">
            <MDXContent code={project.body} />
          </div>
        </InkCard>
      </section>

      {/* ----------------------------- Hard calls --------------------------- */}
      {/* Where the decision records live now: as the evidence behind a specific
          choice in a specific system, rather than as the portfolio itself. */}
      {decisions.length > 0 ? (
        <section className="px-edge pt-6 sm:pt-10">
          <InkCard className="px-card py-14 sm:py-20">
            <SectionHeading
              eyebrow="Decision records"
              title="The close calls, written up"
              lead="Where a choice was genuinely arguable, I wrote it up the way a team records a design decision internally: the constraint, the options I turned down and why, and what it would cost to reverse."
            />
            <ul className="divide-ink-line mt-12 divide-y">
              {decisions.map((adr) => (
                <li key={adr.slug} className="group relative py-7 first:pt-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={cn('font-mono text-micro font-bold', accentText[adr.accent])}>
                      {adr.ref}
                    </span>
                    <AdrStatusPill status={adr.status} />
                    <Tag>{adr.domain}</Tag>
                    <span className="font-mono text-on-ink-muted ml-auto text-micro uppercase">
                      {formatDate(adr.date)}
                    </span>
                  </div>
                  <h3 className="font-display mt-4 max-w-3xl text-title text-balance uppercase">
                    <Link href={adr.url} className="hover:text-cyan">
                      {adr.shortTitle ?? adr.title}
                    </Link>
                  </h3>
                  <p className="text-on-ink mt-3 max-w-3xl text-sm leading-relaxed text-pretty">
                    {adr.summary}
                  </p>
                  <p className="font-mono text-on-ink-muted mt-4 text-micro uppercase">
                    {adr.options.length} options evaluated
                  </p>
                </li>
              ))}
            </ul>
          </InkCard>
        </section>
      ) : null}

    </>
  );
}
