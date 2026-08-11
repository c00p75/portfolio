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

  return (
    <footer className="px-gutter pt-16 pb-6">
      <InkCard className="px-gutter py-14 sm:py-20">
        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-mono text-on-ink-muted mb-5 text-micro font-semibold uppercase">
                Open to architecture &amp; staff-level work
              </p>
              <h2 className="font-display text-jumbo text-balance uppercase">
                Let&apos;s talk
                <br />
                trade-offs
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
                <Link key={item.href} href={item.href} className="text-sm hover:text-cyan-ink">
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
                  className="text-sm hover:text-cyan-ink"
                >
                  {s.label}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-on-ink-muted text-micro font-semibold uppercase">Based in</h3>
              <p className="text-sm">{site.location}</p>
              <p className="text-on-ink-muted text-sm">Working remote across time zones</p>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-on-ink-muted text-micro font-semibold uppercase">Colophon</h3>
              <p className="text-on-ink-muted text-sm leading-relaxed">
                Next.js, TypeScript, Tailwind. Retrieval demo runs on real embeddings over this
                site&apos;s own content.
              </p>
            </div>
          </div>

          <div className="font-mono text-on-ink-muted flex flex-col gap-2 text-micro uppercase sm:flex-row sm:justify-between">
            <span>
              {site.name} — {site.role}
            </span>
            <span>
              © {site.since} — {year}
            </span>
          </div>
        </div>
      </InkCard>
    </footer>
  );
}
