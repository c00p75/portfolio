import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { ContactForm } from '@/components/contact/ContactForm';
import { EdgeRail, InkCard } from '@/components/ui/Frame';
import { Sticker } from '@/components/ui/Sticker';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with ${site.name} about senior engineering and architecture roles, AI feature work, or contract projects.`,
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

      <div className="px-edge">
        <InkCard className="overflow-hidden">
          <div className="grid lg:grid-cols-[1.1fr_1fr]">
            <div className="px-card py-14 sm:py-20">
              <h1 className="font-display text-jumbo text-balance uppercase">
                Get in
                <br />
                touch
              </h1>
              <p className="text-on-ink mt-8 max-w-xl text-lg leading-relaxed text-pretty">
                I&apos;m open to senior engineering and architecture roles, and to contract work. If
                you have a role in mind, or a system you want a second opinion on, tell me what
                you&apos;re working with and I&apos;ll give you a straight answer about whether I can
                help.
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

            {/*
             * The form lives on the cream panel: it is the point of the page,
             * and this was the largest block on it doing the least. The single
             * sticker stays as the brand note — two plus the form was clutter.
             */}
            <div className="bg-cream text-on-cream relative isolate overflow-hidden px-card py-14 sm:py-16 lg:rounded-l-[8rem] lg:pl-20">
              <div
                aria-hidden="true"
                className="grid-paper grid-paper-fade pointer-events-none absolute inset-0 -z-10 opacity-60"
              />

              <div className="flex flex-wrap items-start justify-between gap-4">
                <h2 id="send" className="font-display text-display uppercase">
                  Send a
                  <br />
                  message
                </h2>
                <Sticker accent="lime" rotate={-4} caption="Remote · any time zone">
                  Open to work
                </Sticker>
              </div>

              <div className="mt-10">
                <ContactForm />
              </div>
            </div>
          </div>
        </InkCard>
      </div>

    </>
  );
}
