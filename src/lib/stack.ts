import type { Accent } from '@/components/ui/Sticker';

/**
 * Tooling grouped by architectural concern rather than by language. The grouping
 * is the point: it shows which layers of a system I actually operate at.
 */
export const stackDomains: {
  domain: string;
  accent: Accent;
  note: string;
  items: string[];
}[] = [
  {
    domain: 'Interface & Edge',
    accent: 'cyan',
    note: 'Streaming UIs, optimistic state, and the rendering choice that follows from the latency budget.',
    items: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Server Components', 'SSE / WebSockets'],
  },
  {
    domain: 'Services & APIs',
    accent: 'pink',
    note: 'Async pipelines that keep slow model calls off fast request paths.',
    items: ['Node.js', 'Python', 'Ruby on Rails', 'REST', 'Route Handlers', 'Queues & workers'],
  },
  {
    domain: 'AI Orchestration',
    accent: 'yellow',
    note: 'Routing, retrieval and guardrails — the parts that decide whether an LLM feature is reliable or a demo.',
    items: [
      'Claude / Anthropic SDK',
      'Embeddings',
      'Hybrid retrieval',
      'Reranking',
      'Eval harnesses',
      'Prompt-injection defence',
    ],
  },
  {
    domain: 'Data & Storage',
    accent: 'orange',
    note: 'Schema design, access patterns, and knowing when a vector index is not the answer.',
    items: ['PostgreSQL', 'pgvector', 'SQL', 'Redis', 'Schema design', 'Migrations'],
  },
  {
    domain: 'Delivery & Operations',
    accent: 'lime',
    note: 'The feedback loops that make fast change safe.',
    items: ['Git / GitHub', 'CI pipelines', 'AWS', 'Vercel', 'Structured logging', 'Tracing'],
  },
  {
    domain: 'Verification',
    accent: 'cyan',
    note: 'The gate that has to scale when code generation gets cheap.',
    items: ['Jest', 'RSpec', 'Playwright', 'Integration tests', 'TDD', 'Contract tests'],
  },
];
