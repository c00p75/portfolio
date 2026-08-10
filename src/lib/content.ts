import { adrs, playbooks, posts, type Adr, type Playbook, type Post } from '#content';

export type { Adr, Playbook, Post };

const byDateDesc = (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime();

/** Drafts are scaffolds — visible in development, hidden from production listings. */
const showDrafts = process.env.NODE_ENV === 'development';

/* ------------------------------- ADRs ---------------------------------- */

export function allAdrs(): Adr[] {
  return [...adrs]
    .filter((a) => showDrafts || !a.draft)
    .sort((a, b) => b.number - a.number);
}

export function featuredAdrs(limit = 3): Adr[] {
  const featured = allAdrs().filter((a) => a.featured);
  return (featured.length > 0 ? featured : allAdrs()).slice(0, limit);
}

export function adrBySlug(slug: string): Adr | undefined {
  return adrs.find((a) => a.slug === slug);
}

/** Domains with counts, for the architecture index filter rail. */
export function adrDomains(): { domain: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const a of allAdrs()) counts.set(a.domain, (counts.get(a.domain) ?? 0) + 1);
  return [...counts.entries()]
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain));
}

/* ----------------------------- Playbooks -------------------------------- */

export function allPlaybooks(): Playbook[] {
  return [...playbooks]
    .filter((p) => showDrafts || !p.draft)
    .sort((a, b) => byDateDesc(a.date, b.date));
}

export function playbookBySlug(slug: string): Playbook | undefined {
  return playbooks.find((p) => p.slug === slug);
}

/* ------------------------------- Posts ---------------------------------- */

export function allPosts(): Post[] {
  return [...posts]
    .filter((p) => p.isPublished)
    .sort((a, b) => byDateDesc(a.publishedAt, b.publishedAt));
}

export function postBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function postTags(): string[] {
  return [...new Set(allPosts().flatMap((p) => p.tags))].sort();
}

/* ------------------------------ Formatting ------------------------------ */

export function formatDate(value: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
    ...opts,
  }).format(new Date(value));
}
