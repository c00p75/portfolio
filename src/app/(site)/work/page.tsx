import type { Metadata } from 'next';
import { allProjects, projectCategories } from '@/lib/content';
import { otherWork } from '@/lib/other-work';
import { WorkGallery, type GalleryProject } from '@/components/work/WorkGallery';
import { EdgeRail, InkCard, SectionHeading } from '@/components/ui/Frame';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { SailPath } from '@/components/work/SailPath';
import { Tag } from '@/components/ui/Sticker';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Selected projects: messaging platforms, AI systems, offline ticketing and money apps, with case studies of the architecture behind them.',
};

const SKILL_LENS = [
  'Architecture',
  'Payments',
  'Messaging',
  'AI & retrieval',
  'Mobile',
] as const;

export default function WorkIndex() {
  const labels = new Map(projectCategories.map((c) => [c.key, c.label]));
  const projects: GalleryProject[] = allProjects()
    .sort((x, y) => Number(y.featured) - Number(x.featured) || x.order - y.order)
    .map((p) => ({
      slug: p.slug,
      url: p.url,
      title: p.title,
      tagline: p.tagline,
      period: p.period,
      status: p.status,
      category: p.category,
      categoryLabel: labels.get(p.category) ?? p.category,
      featured: p.featured,
      accent: p.accent,
      cover: p.cover
        ? { src: p.cover.src, width: p.cover.width, height: p.cover.height, blurDataURL: p.cover.blurDataURL }
        : undefined,
    }));
  const filters = projectCategories.map(({ key, label }) => ({ key, label }));

  return (
    <>
      <EdgeRail
        className="pt-2 pb-3"
        left="Work"
        center="Case studies"
        right={`${projects.length} projects`}
      />

      {/* The trail spans the whole page: the boat's route begins in the intro
          card, at hero size, so there is only ever one of it. */}
      <div className="relative">
        <SailPath />

      <div className="px-edge">
        <InkCard className="overflow-hidden">
          <div className="relative grid items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(20rem,1fr)]">
            <div className="px-card relative z-10 min-w-0 py-14 sm:py-20 lg:pr-8">
              <h1 className="font-display text-jumbo text-balance uppercase">Work</h1>
              <p className="text-on-ink mt-6 max-w-xl text-lg leading-relaxed text-pretty">
                Case studies of systems I designed and shipped, covering payments, messaging,
                offline mobile, and AI features with real retrieval behind them.
              </p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {SKILL_LENS.map((s) => (
                  <li key={s}>
                    <Tag>{s}</Tag>
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-wrap gap-3">
                <ArrowLink href="/contact" variant="solid">
                  Get in touch
                </ArrowLink>
                <ArrowLink href="/sandbox" variant="outline">
                  Try the AI sandbox
                </ArrowLink>
              </div>
            </div>

            {/*
             * Reserved for the boat. There is no image here: the craft that
             * sails the trail starts its route in this space at hero size and
             * shrinks as it sets off, so a second copy would only be the same
             * boat drawn twice.
             */}
            <div id="boat-berth" className="relative hidden min-h-96 lg:block" />
          </div>
        </InkCard>
      </div>

      {/* Every project, one filterable grid */}
      <section className="px-edge pt-6 sm:pt-10" aria-labelledby="all-work">
        <InkCard className="px-card py-14 sm:py-20">
          <SectionHeading
            index="01"
            eyebrow={`${projects.length} projects`}
            title={<span id="all-work">Things I’ve built</span>}
            lead="Products, platforms and client sites. Case studies come first; filter by what kind of thing it is."
          />
          <div className="mt-12">
            <WorkGallery projects={projects} filters={filters} />
          </div>
        </InkCard>
      </section>

      {/* Client / employer, conventional “other work” */}
      {otherWork.length > 0 ? (
        <section className="px-edge pt-6 sm:pt-10" aria-labelledby="client-work">
          <InkCard className="px-card py-14 sm:py-20">
            <SectionHeading
              index="02"
              eyebrow="Client & employer"
              title={<span id="client-work">Other work</span>}
              lead="Substantial delivery I can’t name in full, or whose hardest problems are already covered above."
            />
            <ul className="divide-ink-line mt-12 divide-y">
              {otherWork.map((w) => (
                <li
                  key={w.title}
                  className="flex flex-col gap-3 py-7 first:pt-0 lg:flex-row lg:gap-10"
                >
                  <h3 className="font-display shrink-0 text-title uppercase lg:w-72">{w.title}</h3>
                  <div className="flex-1">
                    <p className="text-on-ink max-w-2xl text-sm leading-relaxed text-pretty">
                      {w.note}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {w.stack.map((s) => (
                        <li key={s}>
                          <Tag>{s}</Tag>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </InkCard>
        </section>
      ) : null}

      <EdgeRail
        className="pt-8"
        left="Ready to talk"
        right={
          <ArrowLink href="/contact" className="text-on-page-muted hover:text-on-page normal-case">
            Contact
          </ArrowLink>
        }
      />
      </div>
    </>
  );
}
