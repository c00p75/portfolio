'use client';

import { useForm, ValidationError } from '@formspree/react';
import { site } from '@/lib/site';

const FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID;

const field =
  'border-ink-line bg-ink-soft placeholder:text-on-ink-muted/60 w-full rounded-panel border px-4 py-3 text-sm outline-none focus-visible:border-cyan';
const label = 'font-mono text-on-ink-muted text-micro uppercase';

/**
 * Rendered only when a Formspree form ID is configured. Without one, the contact
 * page falls back to a plain mailto link rather than showing a form that
 * silently discards messages.
 */
function Form({ formId }: { formId: string }) {
  const [state, handleSubmit] = useForm(formId);

  if (state.succeeded) {
    return (
      <div className="border-lime bg-lime/10 rounded-panel border p-6">
        <h3 className="font-display text-xl uppercase">Message sent</h3>
        <p className="text-on-ink-muted mt-2 text-sm leading-relaxed">
          Thanks — I&apos;ll come back to you at the address you gave.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className={label}>
            Name
          </label>
          <input id="name" name="name" required autoComplete="name" className={field} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            className={field}
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} className="text-pink-ink text-xs" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className={label}>
          What are you working on?
        </label>
        <textarea id="message" name="message" required rows={6} className={field} />
        <ValidationError prefix="Message" field="message" errors={state.errors} className="text-pink-ink text-xs" />
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        className="bg-cyan text-ink-fixed font-mono w-fit rounded-full px-6 py-3 text-micro font-bold uppercase transition-colors hover:bg-lime disabled:opacity-40"
      >
        {state.submitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

export function ContactForm() {
  if (!FORM_ID) {
    return (
      <div className="border-ink-line rounded-panel border p-7">
        <h3 className="font-display text-xl uppercase">Email me directly</h3>
        <p className="text-on-ink-muted mt-3 text-sm leading-relaxed">
          The contact form isn&apos;t wired up yet — set{' '}
          <code className="font-mono text-xs">NEXT_PUBLIC_FORMSPREE_ID</code> to enable it. In the
          meantime:
        </p>
        <a
          href={`mailto:${site.email}`}
          className="text-cyan-ink mt-4 inline-block text-sm underline underline-offset-4"
        >
          {site.email}
        </a>
      </div>
    );
  }

  return <Form formId={FORM_ID} />;
}
