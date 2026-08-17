import { checkRateLimit, clientIp } from '@/lib/rag/ratelimit';
import { site } from '@/lib/site';

/**
 * Contact form delivery via Resend.
 *
 * Resend rather than a form service because the domain already has DKIM and
 * SPF set up for it, so mail from here authenticates the same way the rest of
 * my sending does. Called over the REST API directly — the SDK is one `fetch`
 * wrapped in a dependency.
 *
 * Required: RESEND_API_KEY, CONTACT_FROM (a verified sender on the DKIM'd
 * domain), CONTACT_TO. With no key configured the endpoint reports that it is
 * unconfigured and the form falls back to a mailto link, rather than
 * pretending to accept a message it will drop.
 */

export const runtime = 'nodejs';

const MAX = { name: 120, email: 200, message: 4_000 } as const;

/** Header injection guard for anything interpolated into a header value. */
function singleLine(value: string, limit: number) {
  return value.replace(/[\r\n]+/g, ' ').trim().slice(0, limit);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  const to = process.env.CONTACT_TO ?? site.email;

  if (!apiKey || !from) {
    return Response.json(
      { error: 'Contact delivery is not configured.', unconfigured: true },
      { status: 503 },
    );
  }

  const limit = await checkRateLimit(`contact:${clientIp(request.headers)}`);
  if (!limit.ok) {
    return Response.json(
      { error: 'Too many messages from this address. Try again shortly.' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    );
  }

  let payload: { name?: unknown; email?: unknown; message?: unknown; company?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  // Honeypot. A real person never sees this field, so anything in it is a bot;
  // report success so the bot does not learn to try something else.
  if (typeof payload.company === 'string' && payload.company.trim() !== '') {
    return Response.json({ ok: true });
  }

  const name = singleLine(String(payload.name ?? ''), MAX.name);
  const email = singleLine(String(payload.email ?? ''), MAX.email);
  const message = String(payload.message ?? '').trim().slice(0, MAX.message);

  if (!name || !email || !message) {
    return Response.json({ error: 'Name, email and message are all required.' }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: 'That email address does not look right.' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        // Sent from my own domain so it authenticates; reply_to carries the
        // sender so hitting reply in the client goes to them, not to me.
        reply_to: email,
        subject: `Portfolio contact — ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
        html:
          `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</p>` +
          `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('Resend rejected the contact email', response.status, detail);
      return Response.json(
        { error: 'The message could not be sent. Please email me directly.' },
        { status: 502 },
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Contact email failed', error);
    return Response.json(
      { error: 'The message could not be sent. Please email me directly.' },
      { status: 502 },
    );
  }
}
