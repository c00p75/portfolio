import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { ContactForm } from '@/components/contact/ContactForm';
import { EdgeRail, InkCard } from '@/components/ui/Frame';
import { Sticker } from '@/components/ui/Sticker';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with ${site.name} about architecture, full-stack engineering, or AI systems work.`,
};

const channels = [
  { label: 'Email', value: site.email, href: `mailto:${site.email}` },
  { label: 'LinkedIn', value: 'in/georgemsapenda', href: site.socials.linkedin },
  { label: 'GitHub', value: '@c00p75', href: site.socials.github },
];

export default function ContactPage() {
  return (
    <>
      <EdgeRail className="pt-2 pb-3" left="Contact" center={site.name} right={site.location} />

      <div className="px-gutter">
        <InkCard className="overflow-hidden">
          <div className="grid lg:grid-cols-[1.1fr_1fr]">
            <div className="px-gutter py-14 sm:py-20">
              <h1 className="font-display text-jumbo text-balance uppercase">
                Let&apos;s talk
                <br />
                trade-offs
              </h1>
              <p className="text-on-ink-muted mt-8 max-w-xl text-lg leading-relaxed text-pretty">
                Architecture work, full-stack builds, or an AI feature that needs to survive real
                traffic and a real budget. Tell me the constraint you&apos;re up against.
              </p>

              <dl className="border-ink-line mt-12 divide-y divide-current/10 border-t">
                {channels.map((c) => (
                  <div key={c.label} className="flex items-baseline justify-between gap-4 py-4">
                    <dt className="font-mono text-on-ink-muted text-micro uppercase">{c.label}</dt>
                    <dd>
                      <a
                        href={c.href}
                        target={c.href.startsWith('mailto') ? undefined : '_blank'}
                        rel="noreferrer"
                        className="text-sm hover:text-cyan"
                      >
                        {c.value}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="bg-cream text-on-cream relative isolate grid place-items-center overflow-hidden p-8 lg:rounded-l-[8rem]">
              <div
                aria-hidden="true"
                className="grid-paper grid-paper-fade pointer-events-none absolute inset-0 -z-10 opacity-60"
              />
              <div className="flex flex-col gap-5">
                <Sticker accent="lime" rotate={-4} caption="Remote · any time zone">
                  Open to work
                </Sticker>
                <Sticker accent="orange" rotate={5} caption="Usually within a day">
                  Fast reply
                </Sticker>
              </div>
            </div>
          </div>
        </InkCard>
      </div>

      <section className="px-gutter pt-6 sm:pt-10">
        <InkCard className="px-gutter py-14 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-display uppercase">Send a message</h2>
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>
        </InkCard>
      </section>

      <EdgeRail className="pt-8" left="Contact" right={site.location} />
    </>
  );
}
