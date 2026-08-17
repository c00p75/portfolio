import Link from 'next/link';
import { site } from '@/lib/site';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { InkCard } from '@/components/ui/Frame';

const socials = [
  { href: site.socials.github, label: 'GitHub' },
  { href: site.socials.linkedin, label: 'LinkedIn' },
  { href: site.socials.x, label: 'X' },
];

export function Footer() {
  const year = new Date().getFullYear();

  /*
   * The footer's top padding matches the gap between any two content cards
   * (`pt-6 sm:pt-10`). It used to be pt-16, which read as a hole in the page:
   * every other seam is tight, so a gap four times the size at the last seam
   * looked like something had failed to render.
   */
  return (
    <footer className="px-edge pt-6 pb-6 sm:pt-10">
      {/* Top padding is smaller than the bottom: the rule below opens the CTA
          the way the one under it closes it, so the block reads as ruled top
          and bottom rather than as a heading that happens to have a line. */}
      <InkCard className="px-card pt-10 pb-14 sm:pt-12 sm:pb-20">
        <div className="flex flex-col gap-14">
          <div className="border-ink-line flex flex-col gap-8 border-t pt-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-mono text-on-ink-muted mb-5 text-micro font-semibold uppercase">
                Open to senior engineering &amp; architecture roles
              </p>
              <h2 className="font-display text-jumbo text-balance uppercase">
                Tell me what
                <br />
                you&apos;re building
              </h2>
            </div>
            <ArrowLink href="/contact" variant="solid" className="shrink-0">
              Get in touch
            </ArrowLink>
          </div>

          <div className="border-ink-line grid gap-10 border-t pt-10 sm:grid-cols-2 lg:grid-cols-4">
            <nav aria-label="Footer" className="flex flex-col gap-3">
              <h3 className="font-mono text-on-ink-muted text-micro font-semibold uppercase">Site</h3>
              {site.nav.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm hover:text-cyan">
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-on-ink-muted text-micro font-semibold uppercase">Elsewhere</h3>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm hover:text-cyan"
                >
                  {s.label}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-on-ink-muted text-micro font-semibold uppercase">Based in</h3>
              <p className="text-sm">{site.location}</p>
              <p className="text-on-ink text-sm">Working remote across time zones</p>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-on-ink-muted text-micro font-semibold uppercase">Colophon</h3>
              <p className="text-on-ink text-sm leading-relaxed">
                Next.js, TypeScript and Tailwind. The retrieval demo searches an index built from
                this site&apos;s own writing.
              </p>
            </div>
          </div>

          <div className="font-mono text-on-ink-muted flex flex-col gap-2 text-micro uppercase sm:flex-row sm:justify-between">
            <span>
              {site.name} — {site.role}
            </span>
            <div className="flex items-center gap-4">
              {/*
               * The previous portfolio, kept reachable. Drawn as a two-state
               * switch rather than a plain link because that is what it is: the
               * same site, in the version it used to be. V2 is the current
               * state and is inert; V1 is the only thing to click.
               *
               * A real link, not a toggle in JS, since v1 is its own
               * deployment — so it opens the old site rather than restyling
               * this one.
               */}
              <span className="border-ink-line inline-flex items-center rounded-full border p-0.5">
                <span
                  aria-current="true"
                  className="bg-on-ink/10 text-on-ink rounded-full px-2.5 py-1 leading-none"
                >
                  V2
                </span>
                <a
                  href={site.previousVersionUrl}
                  className="hover:text-on-ink rounded-full px-2.5 py-1 leading-none transition-colors"
                >
                  <span className="sr-only">Visit the previous version of this site: </span>V1
                </a>
              </span>
              <span>
                © {site.since} — {year}
              </span>
            </div>
          </div>
        </div>
      </InkCard>
    </footer>
  );
}
