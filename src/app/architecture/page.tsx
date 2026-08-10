import type { Metadata } from 'next';
import { adrDomains, allAdrs } from '@/lib/content';
import { AdrCard } from '@/components/adr/AdrCard';
import { EdgeRail, InkCard, SectionHeading } from '@/components/ui/Frame';
import { Sticker } from '@/components/ui/Sticker';

export const metadata: Metadata = {
  title: 'Architecture decision records',
  description:
    'Deep-dive architecture decision records: the constraints, the options evaluated, the trade-off matrix, the failure modes, and the cost to reverse.',
};

export default function ArchitectureIndex() {
  const adrs = allAdrs();
  const domains = adrDomains();

  return (
    <>
      <EdgeRail className="pt-2 pb-3" left="Architecture" center="Decision records" right={`${adrs.length} records`} />

      <div className="px-gutter">
        <InkCard className="overflow-hidden">
          <div className="px-gutter pt-14 pb-12 sm:pt-20">
            <h1 className="font-display text-jumbo text-balance uppercase">
              Decision
              <br />
              records
            </h1>
            <p className="text-on-ink-muted mt-8 max-w-2xl text-lg leading-relaxed text-pretty">
              Not case studies. Each one states the constraint that forced a choice, the options I
              rejected and why, what the decision costs on every axis, and what it would take to
              undo.
            </p>

            {domains.length > 0 ? (
              <ul className="mt-10 flex flex-wrap gap-3">
                {domains.map((d, i) => (
                  <li key={d.domain}>
                    <Sticker
                      accent={(['cyan', 'pink', 'yellow', 'orange', 'lime'] as const)[i % 5]}
                      rotate={i % 2 === 0 ? -3 : 3}
                      caption={`${d.count} record${d.count === 1 ? '' : 's'}`}
                    >
                      {d.domain}
                    </Sticker>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </InkCard>
      </div>

      <section className="px-gutter pt-6 sm:pt-10">
        <InkCard className="px-gutter py-14 sm:py-20">
          <SectionHeading index="01" eyebrow="All records" title="Newest first" />
          {adrs.length > 0 ? (
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {adrs.map((adr) => (
                <AdrCard key={adr.slug} adr={adr} />
              ))}
            </div>
          ) : (
            <p className="text-on-ink-muted mt-10 text-sm">No records published yet.</p>
          )}
        </InkCard>
      </section>

      <EdgeRail className="pt-8" left="Architecture decision records" right={`${adrs.length} total`} />
    </>
  );
}
