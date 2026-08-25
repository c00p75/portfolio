'use client';

import { useState } from 'react';
import { site } from '@/lib/site';
import { cn } from '@/lib/cn';

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'unconfigured';

/**
 * Sits on the cream panel, so every colour is derived from `currentColor`
 * rather than the ink tokens: the ink greys are near-invisible on cream, and
 * a second hard-coded palette would drift the first time either surface
 * changed.
 */
const field =
  'w-full rounded-panel border border-current/25 bg-cream-dim px-4 py-3 text-sm outline-none placeholder:text-current/40 focus-visible:border-current/70';
const label = 'font-mono text-micro uppercase opacity-70';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus('sending');
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
          company: data.get('company'),
        }),
      });

      const body = await response.json().catch(() => null);

      if (response.ok) {
        setStatus('sent');
        form.reset();
        return;
      }
      // No delivery configured is a different failure from a rejected send:
      // one is my problem to fix, the other the visitor can route around.
      if (body?.unconfigured) {
        setStatus('unconfigured');
        return;
      }
      setStatus('error');
      setError(body?.error ?? 'Something went wrong sending that.');
    } catch {
      setStatus('error');
      setError('Could not reach the server. Please email me directly.');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-panel border border-current/30 bg-current/5 p-6">
        <h3 className="font-display text-xl uppercase">Message sent</h3>
        <p className="mt-2 text-sm leading-relaxed">
          Thanks. I&apos;ll come back to you at the address you gave.
        </p>
      </div>
    );
  }

  if (status === 'unconfigured') {
    return <MailtoFallback />;
  }

  const sending = status === 'sending';

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
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
          <input id="email" type="email" name="email" required autoComplete="email" className={field} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className={label}>
          What are you working on?
        </label>
        <textarea id="message" name="message" required rows={5} className={field} />
      </div>

      {/* Honeypot: off-screen rather than display:none, which some bots skip. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={sending}
          className={cn(
            'bg-ink text-on-ink font-mono w-fit rounded-full px-6 py-3 text-micro font-bold uppercase transition-opacity',
            sending ? 'opacity-50' : 'hover:opacity-85',
          )}
        >
          {sending ? 'Sending…' : 'Send message'}
        </button>
        <a href={`mailto:${site.email}`} className="text-xs underline underline-offset-4 opacity-70 hover:opacity-100">
          or email directly
        </a>
      </div>

      {status === 'error' && error ? (
        <p role="alert" className="rounded-panel border-l-2 border-current/60 bg-current/5 p-3 text-xs leading-relaxed">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function MailtoFallback() {
  return (
    <div className="rounded-panel border border-current/25 p-6">
      <h3 className="font-display text-xl uppercase">Email me directly</h3>
      <p className="mt-3 text-sm leading-relaxed">
        Email is the most reliable way to reach me, and I read everything that arrives there.
      </p>
      {process.env.NODE_ENV === 'development' ? (
        <p className="mt-3 text-xs leading-relaxed opacity-70">
          Dev note: set <code className="font-mono">RESEND_API_KEY</code> and{' '}
          <code className="font-mono">CONTACT_FROM</code> to enable the form.
        </p>
      ) : null}
      <a
        href={`mailto:${site.email}`}
        className="mt-4 inline-block text-sm underline underline-offset-4"
      >
        {site.email}
      </a>
    </div>
  );
}
