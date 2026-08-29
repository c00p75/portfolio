/**
 * Which corpus a /api/ask request is allowed to see.
 *
 * `site` is Ask George: the whole index. `miyagi` is the product-page assistant
 * and must not retrieve (or answer from) anything that is not Miyagi's own
 * written record — other projects, ADRs, posts, and the profile stay out even
 * when they mention the name.
 */
export type AskScope = 'site' | 'miyagi';

export function isAskScope(value: unknown): value is AskScope {
  return value === 'site' || value === 'miyagi';
}

/**
 * Miyagi's own pages: the case study (`project:miyagi`, `/work/miyagi`) and the
 * product landing (`/miyagi` and its stylings). Match on id/url only — a title
 * or body mention is how other documents leak in.
 */
export function isMiyagiChunk(chunk: { id: string; url: string }): boolean {
  const id = chunk.id.toLowerCase();
  if (id.startsWith('project:miyagi')) return true;

  const path = (chunk.url.split('#')[0] ?? chunk.url).toLowerCase();
  return (
    path === '/work/miyagi' ||
    path.startsWith('/work/miyagi/') ||
    path === '/miyagi' ||
    path.startsWith('/miyagi/')
  );
}
