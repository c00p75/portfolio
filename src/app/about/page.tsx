import type { Metadata } from 'next';
import Image from 'next/image';
import portrait from '../../../public/images/me.jpg';
import { site } from '@/lib/site';
import { stackDomains } from '@/lib/stack';
import { EdgeRail, InkCard, SectionHeading } from '@/components/ui/Frame';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Sticker, Tag, accentText } from '@/components/ui/Sticker';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: 'About',
  description: `${site.name} — ${site.role} based in ${site.location}. How I got here and how I work.`,
};

/** Principles are claims about method, not achievements — safe to state plainly. */
const principles = [
  {
    t: 'Write the decision down',
    d: 'If the reasoning behind a boundary only exists in someone’s head, the next person to touch it is guessing. An ADR costs an hour and saves an argument a quarter.',
  },
  {
    t: 'Design the failure, not just the feature',
    d: 'Every dependency is an outage scheduled by somebody else. What the system does when it is down belongs in the design review, not the incident retro.',
  },
  {
    t: 'Reversibility over correctness',
    d: 'Most decisions are made with incomplete information. The useful question is rarely "is this right" but "what does it cost to change my mind" — and then bounding that number.',
  },
  {
    t: 'Cost is a design axis',
    d: 'Tokens, calls and cycles show up on a bill. An architecture that ignores unit economics is only half-designed, and the missing half arrives at the end of the month.',
  },
];

export default function AboutPage() {
  return (
    <>
      <EdgeRail className="pt-2 pb-3" left="About" center={site.name} right={site.location} />

      <div className="px-gutter">
        <InkCard className="overflow-hidden">
          <div className="grid lg:grid-cols-[1.2fr_1fr]">
            <div className="px-gutter py-14 sm:py-20">
              <h1 className="font-display text-jumbo text-balance uppercase">
                About
                <br />
                George
              </h1>
              <div className="mt-9 flex max-w-2xl flex-col gap-5 text-base leading-relaxed text-pretty">
                <p>
                  I&apos;m a full-stack engineer based in {site.location}, working across time zones.
                  I build web systems end to end — interface, services, data, and increasingly the
                  AI layer that now sits between them.
                </p>
                <p className="text-on-ink-muted">
                  I came to software sideways. I double-majored in Library &amp; Information Science
                  and Demography before following the thing I actually wanted to do, then trained as
                  a full-stack developer through Microverse. The detour turned out to be useful:
                  information science is, more or less, the study of how to organise things so they
                  can be found again — which describes most of what retrieval architecture is.
                </p>
                <p className="text-on-ink-muted">
                  What I care about now is the part of the job that got scarcer rather than cheaper.
                  Generating a working implementation is close to free. Knowing which of three
                  plausible architectures survives scale, cost and an on-call rotation is not, and
                  it is the thing this site is built to show evidence of.
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <ArrowLink href="/architecture" variant="solid">
                  Read the decision records
                </ArrowLink>
                <ArrowLink href="/contact" variant="outline">
                  Get in touch
                </ArrowLink>
                <a
                  href="/docs/Resume.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono inline-flex items-center gap-2 rounded-full border border-current/35 px-5 py-3 text-micro font-semibold tracking-[0.1em] uppercase transition-colors hover:border-current"
                >
                  Résumé (PDF)
                </a>
              </div>
            </div>

            <div className="bg-cream text-on-cream relative isolate min-h-[22rem] overflow-hidden lg:rounded-l-[8rem]">
              <div
                aria-hidden="true"
                className="grid-paper grid-paper-fade pointer-events-none absolute inset-0 -z-10 opacity-60"
              />
              <div className="absolute inset-x-0 bottom-0 flex justify-center">
                <div className="relative h-[20rem] w-[16.5rem] lg:h-[26rem] lg:w-[21rem]">
                  <Image
                    src={portrait}
                    alt={`${site.name}`}
                    fill
                    sizes="(max-width: 1024px) 264px, 336px"
                    className="object-cover object-top grayscale contrast-[1.08]"
                    style={{
                      maskImage: 'linear-gradient(to bottom, #000 70%, transparent 99%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, #000 70%, transparent 99%)',
                    }}
                  />
                </div>
              </div>
              <div className="relative flex flex-col items-start gap-4 p-7">
                <Sticker accent="cyan" rotate={-4} caption={site.location}>
                  Full-stack
                </Sticker>
                <Sticker accent="pink" rotate={4} caption="Remote, any time zone">
                  Available
                </Sticker>
              </div>
            </div>
          </div>
        </InkCard>
      </div>

      <section className="px-gutter pt-6 sm:pt-10">
        <InkCard className="px-gutter py-14 sm:py-20">
          <SectionHeading
            index="01"
            eyebrow="How I work"
            title="Four things I actually believe"
            lead="Method, not credentials. Everything here is visible in the decision records — if a principle isn't demonstrated somewhere on this site, it doesn't belong on this page."
          />
          <dl className="mt-12 grid gap-5 md:grid-cols-2">
            {principles.map((p, i) => (
              <div key={p.t} className="border-ink-line rounded-panel border p-7">
                <span className="font-mono text-on-ink-muted text-micro">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <dt className="font-display mt-3 text-xl uppercase">{p.t}</dt>
                <dd className="text-on-ink-muted mt-3 text-sm leading-relaxed text-pretty">{p.d}</dd>
              </div>
            ))}
          </dl>
        </InkCard>
      </section>

      <section className="px-gutter pt-6 sm:pt-10">
        <InkCard className="px-gutter py-14 sm:py-20">
          <SectionHeading index="02" eyebrow="Tooling" title="What I work with" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {stackDomains.map((d) => (
              <div key={d.domain} className="border-ink-line rounded-panel border p-6">
                <h3 className={cn('font-display text-xl uppercase', accentText[d.accent])}>
                  {d.domain}
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {d.items.map((i) => (
                    <li key={i}>
                      <Tag>{i}</Tag>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </InkCard>
      </section>

      <EdgeRail className="pt-8" left={site.role} right={site.location} />
    </>
  );
}
