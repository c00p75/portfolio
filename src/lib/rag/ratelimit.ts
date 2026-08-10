/**
 * Fixed-window per-IP rate limiting.
 *
 * Honest about its limits: this counter lives in the process, so on a
 * serverless platform each warm instance keeps its own window and the effective
 * limit is `LIMIT × instances`. That is acceptable here because the cap exists
 * to bound token spend on a personal demo, not to enforce a security boundary —
 * and the alternative (a network round-trip to Redis on every request) would
 * cost more latency than the abuse it prevents. If this ever guards something
 * that matters, it moves to a shared store.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;
/** Hard ceiling per window regardless of IP, as a backstop on total spend. */
const MAX_GLOBAL = 120;

type Window = { count: number; resetAt: number };

const perIp = new Map<string, Window>();
let global: Window = { count: 0, resetAt: Date.now() + WINDOW_MS };

function tick(window: Window, now: number, limit: number): { ok: boolean; window: Window; retryAfter: number } {
  if (now > window.resetAt) {
    window = { count: 0, resetAt: now + WINDOW_MS };
  }
  const ok = window.count < limit;
  if (ok) window.count += 1;
  return { ok, window, retryAfter: Math.max(1, Math.ceil((window.resetAt - now) / 1000)) };
}

export function checkRateLimit(ip: string): { ok: boolean; retryAfter: number; remaining: number } {
  const now = Date.now();

  // Opportunistic sweep so the map cannot grow without bound.
  if (perIp.size > 5_000) {
    for (const [key, w] of perIp) if (now > w.resetAt) perIp.delete(key);
  }

  const g = tick(global, now, MAX_GLOBAL);
  global = g.window;
  if (!g.ok) return { ok: false, retryAfter: g.retryAfter, remaining: 0 };

  const current = perIp.get(ip) ?? { count: 0, resetAt: now + WINDOW_MS };
  const r = tick(current, now, MAX_REQUESTS);
  perIp.set(ip, r.window);

  return { ok: r.ok, retryAfter: r.retryAfter, remaining: Math.max(0, MAX_REQUESTS - r.window.count) };
}

/** Best-effort client identity. Spoofable — see the note above on what this is for. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
