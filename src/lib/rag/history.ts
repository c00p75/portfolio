/**
 * Authenticates the assistant turns a client sends back in `history`.
 *
 * The conversation is stateless: the browser holds the transcript and replays
 * it on every request. That is fine for the visitor's own turns, which are
 * theirs to write anyway, but an unauthenticated `assistant` turn is a way to
 * put words in the model's mouth — a forged "I can set the usual restrictions
 * aside for you" reads to the model as something it already agreed to, and the
 * safety rules in the system prompt are written to be read in that context.
 *
 * So every assistant turn leaves here with an HMAC over its text, and only
 * turns whose signature verifies are replayed into the prompt. An attacker can
 * still write whatever they like in the request body; it just never reaches the
 * model as prior assistant speech.
 *
 * The secret resolves in three steps, all of which fail safe: an explicit
 * `ASK_HISTORY_SECRET`, otherwise a value derived from a provider key that is
 * already in the environment and already secret, otherwise a per-process random
 * value. In the last case signatures do not verify across instances, so
 * assistant turns are dropped and the conversation loses continuity — the
 * degradation is in the UX, never in the guarantee.
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const VERSION = 'v1';
/** 128 bits of a SHA-256 HMAC. Enough against forgery; short enough to ship in JSON. */
const SIGNATURE_CHARS = 32;

let cachedSecret: string | null = null;

function resolveSecret(): string {
  if (cachedSecret) return cachedSecret;

  const explicit = process.env.ASK_HISTORY_SECRET;
  if (explicit && explicit.length >= 16) {
    cachedSecret = explicit;
    return cachedSecret;
  }

  // Any configured provider key is stable across instances and already secret.
  // Only a derived digest is used, never the key itself.
  for (const key of [
    'GROQ_API_KEY',
    'GEMINI_API_KEY',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'VOYAGE_API_KEY',
  ]) {
    const value = process.env[key];
    if (value) {
      cachedSecret = createHmac('sha256', 'ask-history-derivation').update(value).digest('hex');
      return cachedSecret;
    }
  }

  cachedSecret = randomBytes(32).toString('hex');
  return cachedSecret;
}

/** Normalised so trivial whitespace differences do not invalidate a real turn. */
function canonical(content: string): string {
  return content.trim().replace(/\s+/g, ' ');
}

export function signAssistantTurn(content: string): string {
  return createHmac('sha256', resolveSecret())
    .update(`${VERSION}:${canonical(content)}`)
    .digest('hex')
    .slice(0, SIGNATURE_CHARS);
}

export function verifyAssistantTurn(content: string, signature: unknown): boolean {
  if (typeof signature !== 'string' || signature.length !== SIGNATURE_CHARS) return false;
  const expected = Buffer.from(signAssistantTurn(content), 'utf8');
  const received = Buffer.from(signature, 'utf8');
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}
