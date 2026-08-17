/**
 * Work that is real and substantial but does not carry a case study — either
 * because the interesting engineering is covered better by one of the featured
 * projects, or because it belongs to a client or employer and there is only so
 * much that can be said about it without naming them.
 *
 * Kept as a plain list rather than a content collection: these have no write-up
 * to author, and a one-line entry is the honest size for them.
 */
export const otherWork: { title: string; note: string; stack: string[] }[] = [
  {
    title: 'Internal business operations platform',
    note: 'Client onboarding through to payment: contracts with e-signature, invoicing, card payments, payroll with statutory deductions, and an append-only ledger with a full audit trail. Built for an employer; not named here.',
    stack: ['Next.js', 'tRPC', 'Firebase Functions', 'Firestore', 'Turborepo'],
  },
  {
    title: 'Social commerce marketplace',
    note: 'A mobile-first marketplace for the Zambian market, pairing a storefront with community features that let buyers back local creators directly, plus a wallet service alongside it.',
    stack: ['React', 'TypeScript', 'Firebase', 'Tailwind'],
  },
  {
    title: 'E-commerce storefront and API',
    note: 'A retail storefront and the service behind it — catalogue, cart, checkout and order management. Client work, so not named.',
    stack: ['Next.js', 'NestJS', 'TypeScript'],
  },
  {
    title: 'Company site, CMS and internal tools',
    note: 'The public site for the company I am CTO of, plus the CMS behind it and the back-office and CRM surfaces the team works in day to day.',
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind'],
  },
];
