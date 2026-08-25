export const site = {
  name: "George M'sapenda",
  shortName: 'George',
  /** The two words that set the ceiling on how a visitor reads the whole page. */
  role: 'Software Engineer',
  title: "George M'sapenda — Software Engineer",
  /** Reads as one role, deliberately: an engineer with an architecture bias.
   *  The homepage headline, the résumé and this string must not disagree. */
  description:
    'Software engineer in Lusaka, Zambia, building web and mobile systems end to end: payments, offline-first mobile, and the retrieval layer behind AI features. I design the architecture, then build it with the team.',
  url: 'https://georgemsapenda.me',
  locale: 'en_US',
  location: 'Lusaka, Zambia',
  email: 'georgecoopmsapenda@gmail.com',
  since: 2021,
  /**
   * The previous portfolio, kept live rather than deleted, and reachable from
   * the footer.
   *
   * A path, not an absolute URL: v1 is its own deployment — a Next 13 app on
   * contentlayer and bootstrap, which cannot share a build with this one — but
   * it is proxied onto this domain at `/v1` (see the rewrite in
   * next.config.mjs), so the visitor stays put either way.
   *
   * `NEXT_PUBLIC_V1_URL` overrides it, for pointing at a subdomain or a
   * preview deployment instead.
   */
  previousVersionUrl: process.env.NEXT_PUBLIC_V1_URL || '/v1',
  socials: {
    github: 'https://github.com/c00p75',
    linkedin: 'https://www.linkedin.com/in/georgemsapenda/',
    x: 'https://twitter.com/GeorgeMsapenda',
  },
  /**
   * Four items. Decision records are no longer top-level — they are reached
   * through the case study for the system they belong to, and playbooks are
   * part of Writing rather than a section of their own.
   */
  nav: [
    { href: '/work', label: 'Work' },
    { href: '/sandbox', label: 'Sandbox' },
    { href: '/blog', label: 'Writing' },
    { href: '/about', label: 'About' },
  ],
} as const;

export type Site = typeof site;
