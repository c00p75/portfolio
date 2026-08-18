import Image from 'next/image';
import portrait from '../../../public/images/me 2.png';
import { site } from '@/lib/site';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Sticker, StickerSeal } from '@/components/ui/Sticker';
import { RotatingSeal } from '@/components/ui/RotatingSeal';
import { InkCard } from '@/components/ui/Frame';
import { ArchitectureDoodles } from './ArchitectureDoodles';

/**
 * The capability stickers. `spot` places each one on the large layout, where
 * they're rendered as an overlay outside the cream panel's own clipping box —
 * these are the original placements, now free to spill past the panel's edge
 * near the top/left/right/bottom rather than being clipped by it. Below `lg`
 * they render inline instead (see the two separate <ul>s below): the same
 * percentage offsets have nowhere safe to overflow into on a narrow screen.
 */
const capabilities = [
  {
    label: 'System Design',
    caption: 'Constraints → trade-offs → decisions',
    accent: 'cyan',
    rotate: -4,
    /* Straddles the panel's top edge, half of it up on the black. */
    spot: 'left-[13%] top-[-7%]',
    /** The one circular sticker, per the reference's top-left mark. */
    round: true,
  },
  {
    label: 'AI Integration',
    caption: 'Retrieval · prompts · evals',
    accent: 'pink',
    rotate: 5,
    spot: 'right-[19%] top-[18%]',
  },
  {
    label: 'RAG & Retrieval',
    caption: 'Hybrid search · ranking',
    accent: 'yellow',
    rotate: -7,
    /* Runs off the left edge onto the black, like the reference's yellow tag. */
    spot: 'left-[0%] top-[40%]',
  },
  {
    label: 'Technical Leadership',
    caption: 'Architecture · standards · review',
    accent: 'orange',
    rotate: 6,
    spot: 'left-[11%] bottom-[-8%]',
  },
  {
    label: 'Payments & Messaging',
    caption: 'Mobile money · SMPP · webhooks',
    accent: 'cyan',
    rotate: -6,
    /* Crosses the pill curve on the right, half on the black. */
    spot: 'right-[1%] top-[36%]',
  },
] as const;

/** The two overlapping-circle mark inside the round sticker, as in the reference. */
const roundMark = (
  <svg viewBox="0 0 34 18" className="h-3.5 w-auto" aria-hidden="true">
    <circle cx="10" cy="9" r="8" fill="currentColor" />
    <circle cx="24" cy="9" r="8" fill="currentColor" fillOpacity="0.55" />
  </svg>
);

function Capability({ c }: { c: (typeof capabilities)[number] }) {
  if ('round' in c && c.round) {
    return (
      <StickerSeal
        accent={c.accent}
        rotate={c.rotate}
        caption={c.caption}
        icon={roundMark}
        interactive
        className="w-42 lg:w-46"
      >
        {c.label}
      </StickerSeal>
    );
  }
  return (
    <Sticker accent={c.accent} rotate={c.rotate} caption={c.caption} interactive>
      {c.label}
    </Sticker>
  );
}

export function Hero() {
  return (
    // `overflow-visible` overrides InkCard's own clip: several stickers are
    // placed with negative offsets so they hang past the card's edges, and the
    // card was shearing them off flat. Nothing here needs the clip — the cream
    // panel keeps its own for the grid-paper mask.
    <InkCard className="max-w-none overflow-visible rounded-none">
      {/* ---------------------------------------------------------------- */}
      {/* Upper black region: the headline and positioning copy            */}
      {/* ---------------------------------------------------------------- */}
      {/* `max-w-[110rem] mx-auto` matches the nav, the edge rails and every
          card below, so the headline starts on the same vertical as all of
          them even on very wide screens. */}
      {/* Inset past the standard gutter: the headline is set to the full width
          of this box, so at exactly one gutter it ran hard into both edges.
          The extra is added to the gutter rather than replacing it, so the
          block still grows and shrinks on the page's own rhythm.

          The deep bottom padding from `lg` is the portrait's landing strip: the
          photo stands ~11rem taller than the cream panel and breaks up into
          this band, so the copy has to clear it. Anything less and the head
          crosses the second column. Below `lg` the portrait doesn't overflow
          at all, so the padding stays tight there. */}
      <div className="mx-auto max-w-[110rem] px-[calc(var(--spacing-gutter)+0.75rem)] pt-8 pb-10 sm:px-[calc(var(--spacing-gutter)+2rem)] sm:pt-10 lg:px-gutter lg:pt-7 lg:pb-[3rem]">
        <h1 className="uppercase font-bold">
          <span className="sr-only">
            {site.name} — {site.role}
          </span>
          {/* Drawn as SVG rather than sized text: `textLength` forces the line
              to exactly the viewBox width, so it fills the gutters on one line
              at every viewport size and can never wrap or clip — including
              before Anton loads, when the fallback face is much wider. The
              viewBox height is Anton's cap height at this size, so the box hugs
              the letters with no phantom leading. */}
          <svg aria-hidden="true" viewBox="0 0 1000 88" className="block w-full overflow-visible">
            <text
              x="0"
              y="88"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              fill="currentColor"
              className="font-display"
              style={{ fontSize: 120 }}
            >
              SOFTWARE ENGINEER
            </text>
          </svg>
        </h1>

        {/* Two equal columns: lead copy left, the one call to action centred in
            the right column — not pushed to its far edge, which left the button
            hanging off the end of the band. It keeps its own height and centres
            on the paragraph's optical middle. The portrait rises between the
            columns further down, so the CTA stays clear of the head. */}
        <div className="mt-8 grid items-start gap-8 sm:mt-10 md:grid-cols-2 md:items-center md:gap-12">
          <p className="max-w-[40ch] text-base leading-[1.65] text-pretty sm:text-xl sm:leading-[1.3] py-7">
            I build web and mobile systems end to end, and I lead the teams that ship them. Most
            of my work sits where product decisions meet architectural ones: payments, messaging,
            and the retrieval layer behind AI features.
          </p>
          {/* Squared-off and sized up from the default pill: at the pill's size
              it read as a footnote against the headline and left the right side
              of the band empty. Square corners echo the ink card itself, and
              the underline keeps the wordmark's "printed" character. */}
          <ArrowLink
            href="/contact"
            variant="outline"
            className="shrink-0 gap-4 justify-self-start rounded-none border-2 px-8 py-5 md:justify-self-center text-sm tracking-[0.14em] underline decoration-2 underline-offset-[6px] transition-colors hover:decoration-cyan sm:px-10 sm:py-6 sm:text-base"
          >
            Get in touch
          </ArrowLink>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Lower cream region: grid paper, portrait, sticker wall            */}
      {/* ---------------------------------------------------------------- */}
      {/* `relative` (not `overflow-hidden`) on purpose: the sticker overlay
          below is positioned against this box so it can spill past the cream
          panel's own clipped edges — including up into the black header —
          without being cut off. The cream panel keeps its own overflow-hidden
          for the grid-paper mask and the portrait. */}
      {/* Flush to the left edge; the black shows as a margin on the right and
          bottom only, so the pill curve closes against black — as in the
          reference. Padding lives on this wrapper so the sticker overlay
          (inset-0) spans the black margin too and stickers can cross the
          panel's edges. */}
      <div className="relative pr-6 pb-6 sm:pr-8 sm:pb-7 lg:pr-10 lg:pb-8">
        <div className="bg-cream text-on-cream relative isolate overflow-hidden lg:rounded-r-[18rem]">
          <div
            aria-hidden="true"
            className="grid-paper grid-paper-fade pointer-events-none absolute inset-0 -z-10 opacity-60 [--grid-cell:56px] sm:[--grid-cell:72px]"
          />

          {/* Taller from `lg` than the portrait needs: the extra paper is what
              gives the sketch layer room to sit at a readable size without
              colliding with the portrait or the sticker wall. */}
          <div className="relative min-h-[26rem] lg:min-h-[30rem]">
            {/* Architecture sketches on the paper, behind the portrait (z-10)
                and the sticker wall. */}
            <ArchitectureDoodles />
            {/* Sticker wall, mobile/tablet: inline and contained, since
                overlapping offsets have nowhere safe to go on a narrow
                viewport. Hidden from `lg` up, where the overlay below takes
                over. */}
            {/* The extra bottom padding is for the rotation: each sticker is
                transformed a few degrees, which throws its lower corners past
                the box the layout reserved for it. Without the slack the panel's
                overflow-hidden shears the last row off flat along the cream
                edge. */}
            <ul className="relative flex flex-wrap items-start justify-center gap-3 p-5 pb-14 sm:gap-4 sm:p-8 sm:pb-16 lg:hidden">
              {capabilities.map((c) => (
                <li key={c.label}>
                  <Capability c={c} />
                </li>
              ))}
            </ul>

            <RotatingSeal
              text="Decisions written down"
              accent="lime"
              size={124}
              className="absolute right-[13%] bottom-[4%] hidden lg:grid"
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

        {/* Portrait, anchored bottom-centre like the reference. Greyscale keeps
            the sticker colours as the only chroma on the page until the
            centre of the figure is hovered, when the photo comes back in colour.

            Rendered here — outside the cream panel — for the same reason as the
            sticker wall: the panel clips its own overflow for the grid-paper
            mask, which was cutting the head off flat at the panel's top edge.
            As a sibling it can stand taller than the paper and break up into
            the black band. The wrapper's own paddings are repeated so the
            overlay lines up with the panel box rather than the padded wrapper. */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pr-6 pb-6 sm:pr-8 sm:pb-7 lg:pr-10 lg:pb-8">
          <div className="group/photo relative h-[21rem] w-[15.5rem] sm:h-[26rem] sm:w-[19rem] lg:h-[41rem] lg:w-[32rem]">
            <Image
              src={portrait}
              alt=""
              fill
              priority
              sizes="(max-width: 640px) 550px, (max-width: 1024px) 304px, 392px"
              className="ml-10 object-cover object-top grayscale contrast-[1.08] transition-[filter] duration-300 ease-out group-hover/photo:grayscale-0"
            />
            {/* Only the middle of the figure accepts hover — the rest of the
                portrait box stays greyscale and lets clicks pass through. */}
            <div
              aria-hidden
              className="pointer-events-auto absolute top-[46%] left-[calc(60%+1.25rem)] h-[90%] w-[34%] -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        </div>

        {/* Sticker wall, desktop: an overlay sitting outside the cream
            panel's clip, positioned against the `relative` wrapper above so
            each sticker can cross the panel's edge — several intentionally
            do, per the reference. `pointer-events-none` on the list keeps the
            empty overlay area from blocking clicks through to the panel;
            each sticker opts back in. */}
        <ul className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
          {capabilities.map((c) => (
            <li key={c.label} className={`pointer-events-auto absolute max-w-[15rem] ${c.spot}`}>
              <Capability c={c} />
            </li>
          ))}
        </ul>
      </div>
    </InkCard>
  );
}
