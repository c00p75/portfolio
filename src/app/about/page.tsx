import type { Metadata } from 'next';
import Image, { type StaticImageData } from 'next/image';
import portrait from '../../../public/images/suit-portrait.jpg';
import presentationPoster from '../../../public/images/presentation-poster.jpg';
import presenting from '../../../public/images/presenting.jpeg';
import awardSolo from '../../../public/images/ZABA.jpeg';
import awardTeam from '../../../public/images/ZABA-2.jpeg';
import teamPhoto from '../../../public/images/team.jpg';
import coolPhoto from '../../../public/images/cool.jpeg';
import { site } from '@/lib/site';
import { EdgeRail, InkCard, SectionHeading } from '@/components/ui/Frame';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Tag, accentText } from '@/components/ui/Sticker';
import { MediaCarousel, type MediaItem } from '@/components/about/MediaCarousel';
import { FactStickerStack, type FactSticker } from '@/components/about/FactStickerStack';
import { StackGrid } from '@/components/stack/StackGrid';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: 'About',
  description: `${site.name} — ${site.role} based in ${site.location}. CTO at Ballo Innovations; building payments, messaging, and AI systems end to end.`,
};

const focus = [
  'Architecture',
  'Payments & messaging',
  'AI & retrieval',
  'Web & mobile',
] as const;

/**
 * The right column of the intro — a vertical cluster of stickers, one per fact.
 * Rotation stays on each sticker; the group as a whole is centred in the column.
 */
const factStickers: FactSticker[] = [
  { label: 'CTO & Engineer', caption: 'Role', accent: 'cyan', rotate: -4 },
  { label: site.location, caption: 'Based in', accent: 'pink', rotate: 3 },
  { label: 'Since 2021', caption: 'Working', accent: 'yellow', rotate: -3 },
  { label: 'Open to roles', caption: 'Remote / hybrid', accent: 'orange', rotate: 4 },
  { label: 'CAT · US / EU / GCC', caption: 'Timezones', accent: 'lime', rotate: -1 },
];

/** Habits that show up in the work — short enough to scan. */
const principles: {
  t: string;
  d: string;
  accent: 'cyan' | 'pink' | 'yellow' | 'orange' | 'lime';
  example?: { label: string; href: string };
}[] = [
  {
    t: 'Write the decision down',
    d: 'If the reasoning behind a boundary only lives in one head, the next person is guessing. An hour of writing beats another six-month argument.',
    accent: 'cyan',
    example: { label: 'See a decision record', href: '/work/octo' },
  },
  {
    t: 'Plan for the dependency being down',
    d: 'Anything you call over a network will fail. What the system does then belongs in the design, not in a scramble afterwards.',
    accent: 'pink',
    example: { label: 'Offline reconciliation', href: '/work/octo' },
  },
  {
    t: 'Ask what being wrong would cost',
    d: 'Most decisions are made without complete information. I prefer options that are cheap to reverse over ones that feel clever.',
    accent: 'yellow',
    example: { label: 'AI write confinement', href: '/work/penda' },
  },
  {
    t: 'Know what it costs to run',
    d: 'API calls, tokens and instance hours all end up on a bill. I want a rough figure while I am choosing, not at month end.',
    accent: 'lime',
  },
];

/**
 * The photo grid beside the talk video. `span` widens a tile to the full two
 * columns — used for the two group shots, which need the horizontal room.
 */
type Photo = {
  src: StaticImageData;
  alt: string;
  caption: string;
  label: string;
  accent: 'cyan' | 'pink' | 'yellow' | 'orange' | 'lime';
  aspect: string;
};

const awardsGroupPhoto: Photo = {
  src: awardTeam,
  alt: 'Three Ballo Innovations team members holding Zambia Business Awards certificates',
  label: 'Zambia Business Awards',
  caption: 'Company of the Year for ICT Services, with the two other Ballo winners that night.',
  accent: 'yellow',
  aspect: 'aspect-[16/10]',
};

const awardSoloPhoto: Photo = {
  src: awardSolo,
  alt: "George M'sapenda holding the Ballo Innovations Company of the Year certificate",
  label: 'The certificate',
  caption: 'Ballo Innovations, Company of the Year.',
  accent: 'orange',
  aspect: 'aspect-[4/5]',
};

const presentingPhoto: Photo = {
  src: presenting,
  alt: 'Presenting a retrieval architecture diagram on a projector screen',
  label: 'Architecture review',
  caption: 'Walking a retrieval pipeline through the team, box by box.',
  accent: 'cyan',
  aspect: 'aspect-[4/5]',
};

const teamGroupPhoto: Photo = {
  src: teamPhoto,
  alt: 'The Ballo Innovations team outside the office in football shirts',
  label: 'The team',
  caption: 'Jersey day. Most of what I ship, I ship with these people.',
  accent: 'lime',
  aspect: 'aspect-[16/9]',
};

/**
 * The desk shot mirrors the video's portrait shape, which is why it sits at
 * the top of the left column — the two "at the work" moments read as a pair.
 */
const atTheDeskPhoto: Photo = {
  src: coolPhoto,
  alt: "George M'sapenda working at his desk in front of a Good Vibes mural",
  label: 'At the desk',
  caption: 'The reading, writing and thinking behind the diagrams.',
  accent: 'pink',
  aspect: 'aspect-[3/4]',
};

/**
 * Leadership role first. Internships stay, but shorter — they support the
 * story without competing with Ballo / Hytel.
 */
const experience: {
  org: string;
  role: string;
  period: string;
  place: string;
  current?: boolean;
  points: string[];
}[] = [
  {
    org: 'Ballo Innovations',
    role: 'Chief Technology Officer',
    period: 'Dec 2023 — present',
    place: 'Hybrid · Lusaka, Zambia',
    current: true,
    points: [
      'Own technical strategy and architecture across company products and client work.',
      'Lead the engineering team across architecture review, Git workflow, code review, documentation and delivery.',
      'Ship full-stack systems: web, APIs, mobile, CRM, advertising, messaging and AI platforms.',
    ],
  },
  {
    org: 'Hytel',
    role: 'Software Engineer',
    period: 'Nov 2025 — present',
    place: 'Hybrid · US / Dubai / Zambia / Australia / Philippines',
    current: true,
    points: [
      'Build and maintain production software across frontend and backend.',
      'Ship AI-assisted features on cloud services and LLM-enabled workflows.',
    ],
  },
  {
    org: 'Torre.ai',
    role: 'Software Engineer Intern',
    period: 'Jul 2025 — Sep 2025',
    place: 'Remote · San Francisco Bay Area',
    points: ['Built full-stack product features in a fully remote engineering team.'],
  },
  {
    org: 'Silverbrain AI',
    role: 'Front-End Developer Intern',
    period: 'Mar 2024 — Jun 2024',
    place: 'Remote · Geneva, Switzerland',
    points: ['Shipped responsive Next.js interfaces wired to backend APIs.'],
  },
];

/**
 * A tiny helper to keep the media-carousel rows readable — each `Photo`
 * const already carries everything a carousel `MediaItem` needs, and the
 * `key` argument disambiguates copies of the same photo appearing in both
 * rows.
 */
function toPhotoItem(photo: Photo, key: string): MediaItem {
  return {
    kind: 'photo',
    key,
    image: photo.src,
    alt: photo.alt,
    label: photo.label,
    caption: photo.caption,
    accentClass: accentText[photo.accent],
    aspect: photo.aspect,
  };
}

const talkClipItem: MediaItem = {
  kind: 'video',
  key: 'presentation-talk',
  poster: presentationPoster,
  videoSrc: '/videos/presentation.mp4',
  alt: 'Presenting a retrieval architecture in front of the team',
  label: 'Watch · 17s',
  caption:
    'Taking the team through a retrieval architecture: auth boundary, chunking, vector search, and the cache sitting in front of it.',
  accentClass: accentText.pink,
  aspect: 'aspect-9/16',
};

export default function AboutPage() {
  // Both rows show the full set in different orders so either direction of
  // scroll surfaces every moment. Video sits at position 1 in row A so the
  // play badge is one of the first things a visitor sees; row B leads with
  // the wide team shot so its silhouette matches the row's opposite bias.
  const carouselRowA: MediaItem[] = [
    talkClipItem,
    toPhotoItem(atTheDeskPhoto, 'desk-a'),
    toPhotoItem(awardsGroupPhoto, 'awards-a'),
    toPhotoItem(presentingPhoto, 'presenting-a'),
    toPhotoItem(awardSoloPhoto, 'solo-a'),
    toPhotoItem(teamGroupPhoto, 'team-a'),
  ];

  const carouselRowB: MediaItem[] = [
    toPhotoItem(teamGroupPhoto, 'team-b'),
    toPhotoItem(awardSoloPhoto, 'solo-b'),
    toPhotoItem(presentingPhoto, 'presenting-b'),
    { ...talkClipItem, key: 'presentation-talk-b' },
    toPhotoItem(awardsGroupPhoto, 'awards-b'),
    toPhotoItem(atTheDeskPhoto, 'desk-b'),
  ];
  return (
    <>
      <EdgeRail className="pt-2 pb-3" left="About" center={site.name} right={site.location} />

      {/*
       * Intro and experience share one positioning context so the sticker
       * rail can stay pinned across both, then release at "How I work".
       * Nothing here may clip overflow — that would kill the sticky.
       */}
      <div className="px-edge">
        <div className="relative mx-auto max-w-[110rem]">
          {/* ---------------------------- Intro ---------------------------- */}
          <InkCard className="overflow-hidden">
          <div className="grid items-center lg:grid-cols-[1.2fr_0.8fr]">
            <div className="px-card py-14 sm:py-20">
              <p className="font-mono text-on-ink-muted text-micro uppercase">
                {site.role} · {site.location}
              </p>
              <h1 className="font-display mt-4 text-jumbo text-balance uppercase">
                About
                <br />
                George
              </h1>

              <p className="text-on-ink mt-8 max-w-2xl text-lg leading-relaxed text-pretty">
                I design systems end to end, then build them with the team, especially where product decisions meet
                payments, AI features, and core product logic.
              </p>

              <p className="text-on-ink mt-5 max-w-2xl text-base leading-relaxed text-pretty">
                I came to software via Library &amp; Information Science and Demography, then
                trained as a full-stack developer. Organising information so it can be found again
                turned out to be useful preparation for retrieval architecture. That focus on data structure and system constraints shapes how I design for failure, scale, and recovery far more than popular frameworks do.
              </p>

              <ul className="mt-8 flex flex-wrap gap-2">
                {focus.map((f) => (
                  <li key={f}>
                    <Tag>{f}</Tag>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap gap-3">
                <ArrowLink href="/work" variant="solid">
                  See the work
                </ArrowLink>
                <ArrowLink href="/contact" variant="outline">
                  Get in touch
                </ArrowLink>
                <a
                  href="/docs/George_Msapenda_Resume.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono inline-flex items-center gap-2 rounded-full border border-current/35 px-5 py-3 text-micro font-semibold tracking-widest uppercase transition-colors hover:border-current"
                >
                  Résumé (PDF)
                </a>
              </div>
            </div>

              {/*
               * In-flow copy for narrow screens. On xl the column stays as
               * reserved space and the sticky rail below draws the cluster.
               */}
              <div className="flex items-center justify-center px-card py-10 lg:py-20 xl:hidden">
                <FactStickerStack stickers={factStickers} />
              </div>
            </div>
          </InkCard>

          {/* -------------------------- Experience -------------------------- */}
          <section className="pt-6 sm:pt-10" aria-labelledby="experience">
            <InkCard className="px-card py-14 sm:py-20">
          <SectionHeading
            index="01"
            eyebrow="Experience"
            title={<span id="experience">Where I work</span>}
            lead="I lead engineering at Ballo Innovations and build product at Hytel."
          />
          {/* Single continuous rail on the <ol>, dots per row aligned to it.
              The xl right padding clears the sticky sticker column. */}
          <ol className="relative mt-12 xl:pr-[40%]">
            <span
              aria-hidden="true"
              className="bg-ink-line absolute bottom-10 left-3 top-10 w-px"
            />
            {experience.map((job) => (
              <li
                key={`${job.org}-${job.role}`}
                className="relative flex flex-col gap-4 py-8 pl-10 lg:flex-row lg:gap-10 lg:pl-12"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute left-1.5 top-10 h-2.5 w-2.5 rounded-full ring-4 ring-ink',
                    job.current ? 'bg-lime' : 'bg-ink-line',
                  )}
                />

                <div className="shrink-0 lg:w-56">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-on-ink-muted text-micro uppercase">{job.period}</p>
                    {job.current ? (
                      <span className="font-mono bg-lime text-ink inline-block rounded-full px-2 py-0.5 text-[0.625rem] font-bold tracking-widest uppercase">
                        Now
                      </span>
                    ) : null}
                  </div>
                  <p className="font-mono text-on-ink-muted mt-2 text-micro">{job.place}</p>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-title uppercase">{job.org}</h3>
                  <p
                    className={cn(
                      'font-mono mt-1.5 text-micro font-bold uppercase',
                      accentText.cyan,
                    )}
                  >
                    {job.role}
                  </p>
                  <ul className="mt-4 flex max-w-2xl flex-col gap-2.5">
                    {job.points.map((point) => (
                      <li key={point} className="flex gap-3 text-sm leading-relaxed text-pretty">
                        <span
                          aria-hidden="true"
                          className="bg-current mt-2 h-px w-4 shrink-0 opacity-40"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
              </ol>
            </InkCard>
          </section>

          {/*
           * The sticky rail. Absolutely positioned over the right-hand column
           * both cards share, so it pins under the nav from the intro all the
           * way down and releases at the bottom of the experience card —
           * i.e. as "How I work" arrives. Decorative and non-interactive, so
           * pointer events pass through to the card underneath.
           */}
          {/* No aria-hidden on either copy: whichever one is `display:none`
              at the current breakpoint drops out of the a11y tree already, so
              exactly one is ever announced. */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-[40%] xl:block">
            <FactStickerStack stickers={factStickers} variant="rail" />
          </div>
        </div>
      </div>

      {/* --------------------------- Principles ---------------------------- */}
      <section className="px-edge pt-6 sm:pt-10" aria-labelledby="principles">
        <InkCard className="px-card py-14 sm:py-20">
          <SectionHeading
            index="02"
            eyebrow="Principles"
            title={<span id="principles">How I work</span>}
            lead="Four habits. Each one shows up somewhere in the case studies."
          />
          <dl className="mt-12 grid gap-5 md:grid-cols-2">
            {principles.map((p, i) => (
              <div
                key={p.t}
                className="border-ink-line group relative overflow-hidden rounded-panel border p-7 transition-colors hover:border-current/40"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-0 top-0 h-1',
                    p.accent === 'cyan' && 'bg-cyan',
                    p.accent === 'pink' && 'bg-pink',
                    p.accent === 'yellow' && 'bg-yellow',
                    p.accent === 'orange' && 'bg-orange',
                    p.accent === 'lime' && 'bg-lime',
                  )}
                />
                <div className="flex items-baseline justify-between gap-4">
                  <span className={cn('font-mono text-micro font-bold', accentText[p.accent])}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <dt className={cn('font-display mt-3 text-xl uppercase', accentText[p.accent])}>
                  {p.t}
                </dt>
                <dd className="text-on-ink mt-3 text-sm leading-relaxed text-pretty">{p.d}</dd>
                {p.example ? (
                  <ArrowLink
                    href={p.example.href}
                    className="text-on-ink-muted hover:text-on-ink mt-5"
                  >
                    {p.example.label}
                  </ArrowLink>
                ) : null}
              </div>
            ))}
          </dl>
        </InkCard>
      </section>

      {/* ---------------------------- In the room --------------------------- */}
      <section className="px-edge pt-6 sm:pt-10" aria-labelledby="in-the-room">
        <InkCard className="px-card py-14 sm:py-20">
          <SectionHeading
            index="03"
            eyebrow="In the room"
            title={<span id="in-the-room">Away from the diagram</span>}
            lead="Architecture is a team sport. Most of it happens in front of a screen with other people arguing about it."
          />

          {/*
           * Two-row marquee: the top row drifts left, the bottom row drifts
           * right, so the wall never feels static. Hovering (or tabbing into)
           * a row pauses it, and clicking any tile opens it in a lightbox at
           * a comfortable size — a full-screen play view for the video, a
           * fit-to-viewport image for the photos.
           */}
          <MediaCarousel
            className="mt-12"
            topRow={carouselRowA}
            bottomRow={carouselRowB}
          />

          <p className="font-mono text-on-ink-muted mt-5 text-micro uppercase tracking-widest">
            Hover to pause · click a tile to enlarge · ← / → to browse
          </p>
        </InkCard>
      </section>

      {/* ------------------------------ Stack ------------------------------ */}
      <section className="px-edge pt-6 sm:pt-10" aria-labelledby="stack">
        <InkCard className="px-card py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              index="04"
              eyebrow="Tooling"
              title={<span id="stack">What I work with</span>}
              lead="Grouped by the layer each tool sits in, which says more than an alphabetical wall of logos."
            />
            <ArrowLink href="/work" className="text-on-ink-muted hover:text-on-ink">
              See it in context
            </ArrowLink>
          </div>
          <StackGrid className="mt-12" />
        </InkCard>
      </section>

      {/*
       * Signature card. The footer already carries the primary CTA, so this
       * closes the page with a smaller, human moment — a portrait, a name,
       * and a couple of ways in — rather than a duplicate hero-scale CTA.
       */}
      <section className="px-edge pt-6 sm:pt-10" aria-label="Signature">
        <InkCard className="overflow-hidden">
          <div className="grid items-stretch lg:grid-cols-[0.9fr_1.1fr]">
            {/* Cream panel with the portrait — no grid, photo grounded rather than fading into ink. */}
            <div className="bg-cream text-on-cream relative isolate min-h-72 overflow-hidden lg:min-h-full lg:rounded-r-[6rem]">
              <Image
                src={portrait}
                alt={site.name}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-[center_18%] grayscale contrast-[1.08]"
              />
              <p className="font-mono text-on-cream-muted absolute left-6 top-6 z-10 text-micro uppercase">
                Lusaka · {new Date().getFullYear()}
              </p>
            </div>

            <div className="px-card py-14 sm:py-16">
              <p className="font-mono text-on-ink-muted text-micro uppercase">Say hi</p>
              <h2 className="font-display mt-3 text-display text-balance uppercase">
                George
                <br />
                M&apos;sapenda
              </h2>
              <p className="text-on-ink mt-5 max-w-md text-base leading-relaxed text-pretty">
                Software engineer &amp; CTO in Lusaka. Reach me by email or through the form on
                the contact page. I read everything and reply.
              </p>

              <dl className="mt-8 flex flex-col gap-3 text-sm">
                <div className="flex items-baseline gap-4">
                  <dt className="font-mono text-on-ink-muted w-20 shrink-0 text-micro uppercase">
                    Email
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${site.email}`}
                      className="hover:text-cyan underline underline-offset-4"
                    >
                      {site.email}
                    </a>
                  </dd>
                </div>
                <div className="flex items-baseline gap-4">
                  <dt className="font-mono text-on-ink-muted w-20 shrink-0 text-micro uppercase">
                    GitHub
                  </dt>
                  <dd>
                    <a
                      href={site.socials.github}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-cyan underline underline-offset-4"
                    >
                      c00p75
                    </a>
                  </dd>
                </div>
                <div className="flex items-baseline gap-4">
                  <dt className="font-mono text-on-ink-muted w-20 shrink-0 text-micro uppercase">
                    LinkedIn
                  </dt>
                  <dd>
                    <a
                      href={site.socials.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-cyan underline underline-offset-4"
                    >
                      georgemsapenda
                    </a>
                  </dd>
                </div>
              </dl>

              <div className="mt-10 flex flex-wrap gap-3">
                <ArrowLink href="/contact" variant="solid">
                  Get in touch
                </ArrowLink>
                <ArrowLink href="/work" variant="outline">
                  Selected work
                </ArrowLink>
              </div>
            </div>
          </div>
        </InkCard>
      </section>

      <EdgeRail className="pt-8" left={site.role} right={site.location} />
    </>
  );
}
