/**
 * Fixed-window per-IP rate limiting for the /api/ask endpoint.
 *
 * The counter lives in a shared store when one is configured, and in process
 * memory when it is not. That distinction matters: on a serverless platform an
 * in-process counter is per warm instance, so the effective ceiling becomes
 * `LIMIT × instances` and a cold start resets it. Since the thing being capped
 * is token spend on a public endpoint, the shared store is what makes the cap
 * real; the in-memory path exists so local development and preview builds work
 * with no infrastructure.
 *
 * Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable the shared
 * store (Vercel KV exposes the same REST protocol under its own variable
 * names — see `restConfig`). The REST call adds roughly 10ms, which is noise
 * against a time-to-first-token measured in hundreds.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;
/** Hard ceiling per window regardless of IP, as a backstop on total spend. */
const MAX_GLOBAL = 120;

export type RateLimitResult = {
  ok: boolean;
  retryAfter: number;
  remaining: number;
  /** Whether the decision came from the shared store or the local fallback. */
  durable: boolean;
};

// ---------------------------------------------------------------------------
// Shared store
// ---------------------------------------------------------------------------

/**
 * Upstash and Vercel KV both speak the Upstash REST protocol, so either set of
 * variables works and no client library is needed — one `fetch` per request.
 */
function restConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

/**
 * INCR both counters and set their TTLs in one round trip. `EXPIRE … NX` only
 * applies on the first increment of a window, so the window does not slide
 * forward on every request the way a naive re-EXPIRE would.
 */
async function incrementShared(
  config: { url: string; token: string },
  ipKey: string,
  globalKey: string,
  ttlSeconds: number,
): Promise<{ ip: number; global: number }> {
  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${config.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', ipKey],
      ['EXPIRE', ipKey, String(ttlSeconds), 'NX'],
      ['INCR', globalKey],
      ['EXPIRE', globalKey, String(ttlSeconds), 'NX'],
    ]),
    // The cap is not worth stalling a request over; the catch below falls
    // back to the local counter if the store is slow or unreachable.
    signal: AbortSignal.timeout(1_500),
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`Rate-limit store returned ${response.status}`);

  const results = (await response.json()) as { result?: number; error?: string }[];
  const ip = results[0]?.result;
  const global = results[2]?.result;
  if (typeof ip !== 'number' || typeof global !== 'number') {
    throw new Error('Rate-limit store returned an unexpected payload');
  }
  return { ip, global };
}

// ---------------------------------------------------------------------------
// Local fallback
// ---------------------------------------------------------------------------

type Window = { count: number; resetAt: number };

const perIp = new Map<string, Window>();
let globalWindow: Window = { count: 0, resetAt: Date.now() + WINDOW_MS };

function tick(window: Window, now: number, limit: number) {
  const current = now > window.resetAt ? { count: 0, resetAt: now + WINDOW_MS } : window;
  const ok = current.count < limit;
  if (ok) current.count += 1;
  return { ok, window: current, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
}

function checkInMemory(ip: string, now: number): RateLimitResult {
  // Opportunistic sweep so the map cannot grow without bound.
  if (perIp.size > 5_000) {
    for (const [key, w] of perIp) if (now > w.resetAt) perIp.delete(key);
  }

  const g = tick(globalWindow, now, MAX_GLOBAL);
  globalWindow = g.window;
  if (!g.ok) return { ok: false, retryAfter: g.retryAfter, remaining: 0, durable: false };

  const current = perIp.get(ip) ?? { count: 0, resetAt: now + WINDOW_MS };
  const r = tick(current, now, MAX_REQUESTS);
  perIp.set(ip, r.window);

  return {
    ok: r.ok,
    retryAfter: r.retryAfter,
    remaining: Math.max(0, MAX_REQUESTS - r.window.count),
    durable: false,
  };
}

// ---------------------------------------------------------------------------

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const now = Date.now();
  const config = restConfig();
  if (!config) return checkInMemory(ip, now);

  // Fixed window derived from the clock, so every instance agrees on which
  // bucket a request belongs to without coordinating.
  const bucket = Math.floor(now / WINDOW_MS);
  const ttlSeconds = Math.ceil(WINDOW_MS / 1000) + 5;
  const retryAfter = Math.max(1, Math.ceil(((bucket + 1) * WINDOW_MS - now) / 1000));

  try {
    const counts = await incrementShared(
      config,
      `ratelimit:ask:${bucket}:${ip}`,
      `ratelimit:ask:${bucket}:global`,
      ttlSeconds,
    );

    if (counts.global > MAX_GLOBAL) {
      return { ok: false, retryAfter, remaining: 0, durable: true };
    }
    return {
      ok: counts.ip <= MAX_REQUESTS,
      retryAfter,
      remaining: Math.max(0, MAX_REQUESTS - counts.ip),
      durable: true,
    };
  } catch {
    // Fail over rather than fail open: the local counter is weaker than the
    // shared one but still bounds a single instance, which is strictly better
    // than serving unlimited requests because the store had a bad minute.
    return checkInMemory(ip, now);
  }
}

/**
 * Best-effort client identity. Spoofable, which is why the global ceiling
 * exists alongside the per-IP one.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
