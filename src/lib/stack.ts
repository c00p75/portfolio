import type { Accent } from '@/components/ui/Sticker';

/**
 * Grouped by the layer each tool sits in rather than by language, so the list
 * says something about where I work rather than just what I have installed.
 */
export const stackDomains: {
  domain: string;
  accent: Accent;
  note: string;
  items: string[];
}[] = [
  {
    domain: 'Interface & Mobile',
    accent: 'cyan',
    note: 'Web and mobile from the same design language, including apps that have to keep working when the connection does not.',
    items: [
      'TypeScript',
      'React',
      'Next.js',
      'React Native',
      'Flutter',
      'Tailwind',
      'Offline-first',
    ],
  },
  {
    domain: 'Services & APIs',
    accent: 'pink',
    note: 'Endpoint and payload design, and keeping the contract between client and server something the compiler can check.',
    items: ['FastAPI', 'NestJS', '.NET', 'Node.js', 'Ruby on Rails', 'tRPC', 'REST'],
  },
  {
    domain: 'AI & Retrieval',
    accent: 'yellow',
    note: 'Most of the work in an LLM feature is getting the right context in front of the model and being able to tell whether it helped.',
    items: [
      'Anthropic / Claude',
      'Groq',
      'OpenAI',
      'Gemini',
      'Vertex AI',
      'RAG',
      'Hybrid retrieval',
      'Embeddings',
      'Eval harnesses',
    ],
  },
  {
    domain: 'Data & Infrastructure',
    accent: 'orange',
    note: 'Schemas shaped around how they will actually be read, and enough infrastructure to deploy them repeatably.',
    items: ['PostgreSQL', 'Supabase', 'Prisma', 'Firebase', 'Docker', 'GCP', 'Vercel'],
  },
  {
    domain: 'Payments & Messaging',
    accent: 'lime',
    note: 'Mobile money and SMS are the default rails in the markets I build for, which makes them an architectural constraint rather than an integration detail.',
    items: [
      'DPO Pay',
      'Mobile Money',
      'SMPP',
      'SMS gateways',
      'Firebase Cloud Messaging',
      'Webhook reconciliation',
    ],
  },
  {
    domain: 'Architecture & Practice',
    accent: 'cyan',
    note: 'The habits that let a small team keep changing a system quickly without losing track of why it is shaped the way it is.',
    items: [
      'Hexagonal architecture',
      'Event-driven systems',
      'Monorepos',
      'ADRs',
      'CI/CD',
      'Vitest',
      'RSpec',
      'TypeScript strict',
    ],
  },
];
