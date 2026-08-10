import Image from 'next/image';
import portrait from '../../../public/images/me.jpg';
import { site } from '@/lib/site';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Sticker } from '@/components/ui/Sticker';
import { RotatingSeal } from '@/components/ui/RotatingSeal';
import { InkCard } from '@/components/ui/Frame';

/**
 * The capability stickers. `spot` places each one on the large layout; on small
 * screens the absolute positioning is dropped and they flow as a wrapped list,
 * which keeps them legible instead of overlapping the portrait.
 */
const capabilities = [
  {
    label: 'System Design',
    caption: 'Constraints → trade-offs → decisions',
    accent: 'cyan',
    rotate: -4,
    spot: 'lg:left-[3%] lg:top-[4%]',
  },
  {
    label: 'AI Orchestra—tion',
    caption: 'Routing · guardrails · evals',
    accent: 'pink',
    rotate: 5,
    spot: 'lg:right-[10%] lg:top-[14%]',
  },
  {
    label: 'RAG & Retrieval',
    caption: 'Hybrid search · reranking',
    accent: 'yellow',
    rotate: -7,
    spot: 'lg:left-[1%] lg:top-[44%]',
  },
  {
    label: 'Observability & Resilience',
    caption: 'Tracing · circuit breakers',
    accent: 'orange',
    rotate: 6,
    spot: 'lg:left-[7%] lg:bottom-[8%]',
  },
  {
    label: 'FinOps & Unit Economics',
    caption: 'Cost per transaction ©26',
    accent: 'cyan',
    rotate: -6,
    spot: 'lg:right-[2%] lg:top-[40%]',
  },
] as const;

export function Hero() {
  return (
    <InkCard>
      {/* ---------------------------------------------------------------- */}
      {/* Upper black region: the headline and positioning copy            */}
      {/* ---------------------------------------------------------------- */}
      <div className="px-gutter pt-12 pb-10 sm:pt-16 lg:pt-20">
        <h1 className="font-display text-mega text-balance uppercase">
          <span className="sr-only">
            {site.name} — {site.role}
          </span>
          <span aria-hidden="true" className="block">
            Systems
            <br className="sm:hidden" /> Architect
          </span>
        </h1>

        <div className="mt-8 grid gap-8 sm:mt-10 lg:grid-cols-[1fr_1fr_auto] lg:items-end lg:gap-12">
          <p className="max-w-md text-[0.9375rem] leading-relaxed text-pretty">
            I design and build full-stack systems where the hard part isn&apos;t the code — it&apos;s
            the boundary, the failure mode, and the bill at the end of the month.
          </p>
          <p className="text-on-ink-muted max-w-md text-[0.9375rem] leading-relaxed text-pretty">
            Code generation is cheap now. Judgement isn&apos;t. Everything here is written as a
            decision record: what the constraints were, what I rejected, and what it costs to
            reverse.
          </p>
          <ArrowLink href="/contact" className="lg:pb-1">
            Get in touch
          </ArrowLink>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Lower cream region: grid paper, portrait, sticker wall            */}
      {/* ---------------------------------------------------------------- */}
      <div className="px-gutter pb-gutter">
        <div className="bg-cream text-on-cream relative isolate overflow-hidden rounded-panel lg:rounded-r-[14rem]">
          <div
            aria-hidden="true"
            className="grid-paper grid-paper-fade pointer-events-none absolute inset-0 -z-10 opacity-60 [--grid-cell:56px] sm:[--grid-cell:72px]"
          />

          <div className="relative min-h-[26rem] lg:min-h-[34rem]">
            {/* Portrait, anchored bottom-centre like the reference. Greyscale
                keeps the sticker colours as the only chroma on the page. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
              <div className="relative h-[19rem] w-[15.5rem] sm:h-[23rem] sm:w-[19rem] lg:h-[30rem] lg:w-[24.5rem]">
                <Image
                  src={portrait}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 640px) 250px, (max-width: 1024px) 304px, 392px"
                  className="object-cover object-top grayscale contrast-[1.08]"
                  style={{
                    // Fades the photo's lower edge into the panel so the
                    // un-cut-out background never shows a hard rectangle.
                    maskImage: 'linear-gradient(to bottom, #000 68%, transparent 99%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, #000 68%, transparent 99%)',
                  }}
                />
              </div>
            </div>

            {/* Sticker wall. Absolute only from `lg` up. */}
            <ul className="relative flex flex-wrap items-start justify-center gap-3 p-5 sm:gap-4 sm:p-8 lg:block lg:h-full lg:p-0">
              {capabilities.map((c) => (
                <li key={c.label} className={`lg:absolute lg:max-w-[15rem] ${c.spot}`}>
                  <Sticker accent={c.accent} rotate={c.rotate} caption={c.caption} interactive>
                    {c.label}
                  </Sticker>
                </li>
              ))}
            </ul>

            <RotatingSeal
              text="Trade-offs documented"
              accent="lime"
              size={124}
              className="absolute right-[6%] bottom-[6%] hidden lg:grid"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
                <g fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 3.5v17M3.5 12h17" />
                  <ellipse cx="12" cy="12" rx="4.2" ry="8.5" />
                </g>
              </svg>
            </RotatingSeal>
          </div>
        </div>
      </div>
    </InkCard>
  );
}
