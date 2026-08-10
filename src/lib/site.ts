export const site = {
  name: "George M'sapenda",
  shortName: 'George',
  /** The two words that set the ceiling on how a visitor reads the whole page. */
  role: 'Systems Architect',
  title: "George M'sapenda — Systems Architect",
  description:
    'Full-stack engineer and systems architect. Architecture decision records, system blueprints, AI orchestration patterns, and the unit economics behind them.',
  url: 'https://georgemsapenda.me',
  locale: 'en_US',
  location: 'Lusaka, Zambia',
  email: 'hello@georgemsapenda.me',
  since: 2021,
  socials: {
    github: 'https://github.com/c00p75',
    linkedin: 'https://www.linkedin.com/in/georgemsapenda/',
    x: 'https://twitter.com/GeorgeMsapenda',
  },
  nav: [
    { href: '/architecture', label: 'Architecture' },
    { href: '/sandbox', label: 'Sandbox' },
    { href: '/playbooks', label: 'Playbooks' },
    { href: '/blog', label: 'Writing' },
    { href: '/about', label: 'About' },
  ],
} as const;

export type Site = typeof site;
