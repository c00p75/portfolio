import {
  adrs,
  playbooks,
  posts,
  profiles,
  projects,
  type Adr,
  type Playbook,
  type Post,
  type Profile,
  type Project,
} from '#content';

export type { Adr, Playbook, Post, Profile, Project };

const byDateDesc = (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime();

/** Drafts are scaffolds — visible in development, hidden from production listings. */
const showDrafts = process.env.NODE_ENV === 'development';

/* ------------------------------ Projects -------------------------------- */

export function allProjects(): Project[] {
  return [...projects]
    .filter((p) => showDrafts || !p.draft)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function featuredProjects(limit = 3): Project[] {
  const featured = allProjects().filter((p) => p.featured);
  return (featured.length > 0 ? featured : allProjects()).slice(0, limit);
}

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Projects that demonstrate a given capability, for the home page's two showcase strips. */
export function projectsByDiscipline(discipline: Project['disciplines'][number]): Project[] {
  return allProjects().filter((p) => p.disciplines.includes(discipline));
}

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

/**
 * The decision records belonging to one project, newest decision first. This is
 * how ADRs reach a reader now — through the case study for the system they were
 * made in, rather than through an index of their own.
 */
export function adrsByProject(projectSlug: string): Adr[] {
  return allAdrs().filter((a) => a.project === projectSlug);
}

/** The project an ADR belongs to, for the backlink on a record page. */
export function projectForAdr(adr: Adr): Project | undefined {
  return adr.project ? projectBySlug(adr.project) : undefined;
}

/** Every record that has no project set — reachable only by direct link. */
export function orphanAdrs(): Adr[] {
  return allAdrs().filter((a) => !a.project);
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

/* ------------------------------ Profile --------------------------------- */

export function allProfiles(): Profile[] {
  return [...profiles].filter((p) => showDrafts || !p.draft);
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
