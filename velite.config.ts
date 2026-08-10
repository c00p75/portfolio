import { defineConfig, defineCollection, s } from 'velite';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';

/**
 * One option that was on the table when the decision was made.
 * `verdict` is deliberately required: an option listed without a verdict is a
 * list of technologies, not a decision record.
 */
const option = s.object({
  name: s.string(),
  summary: s.string(),
  pros: s.array(s.string()).default([]),
  cons: s.array(s.string()).default([]),
  verdict: s.enum(['chosen', 'rejected', 'deferred']),
  /** Why this verdict — the sentence a reviewer would challenge you on. */
  because: s.string(),
});

/**
 * A row of the trade-off matrix. `scores` is keyed by option name, so the
 * renderer can pivot it into a table without the author repeating the columns.
 */
const tradeoff = s.object({
  criterion: s.string(),
  /** e.g. { "Modular monolith": "strong", "Microservices": "weak" } */
  scores: s.record(s.string(), s.enum(['strong', 'adequate', 'weak'])),
  note: s.string().optional(),
});

/** A quantified outcome. Unit economics live here, not in prose. */
const metric = s.object({
  label: s.string(),
  value: s.string(),
  /** Where the number came from — dashboards, load test, billing export. */
  basis: s.string(),
  direction: s.enum(['down-is-good', 'up-is-good', 'neutral']).default('neutral'),
});

/** What breaks, how it is detected, and what the system does about it. */
const failureMode = s.object({
  trigger: s.string(),
  blastRadius: s.string(),
  detection: s.string(),
  mitigation: s.string(),
  severity: s.enum(['critical', 'major', 'minor']).default('major'),
});

const adrs = defineCollection({
  name: 'Adr',
  pattern: 'adr/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      path: s.path(),
      /** Sequence number shown as "ADR-004". */
      number: s.number(),
      status: s.enum(['accepted', 'superseded', 'proposed', 'deprecated']),
      date: s.isodate(),
      /** e.g. "AI Infrastructure", "Data Platform", "Payments" */
      domain: s.string(),
      summary: s.string().max(320),
      /** The business or scale constraint that forced a decision. */
      context: s.string(),
      constraints: s.array(s.string()).default([]),
      options: s.array(option).min(2, 'An ADR needs at least two options considered'),
      tradeoffs: s.array(tradeoff).default([]),
      decision: s.string(),
      /** How lock-in was bounded if the vendor/model/assumption changes. */
      reversibility: s.string(),
      metrics: s.array(metric).default([]),
      failureModes: s.array(failureMode).default([]),
      stack: s.array(s.string()).default([]),
      /** Key of a React diagram registered in src/components/blueprints. */
      diagram: s.string().optional(),
      featured: s.boolean().default(false),
      /** Set true for scaffolded records so the UI can mark them clearly. */
      draft: s.boolean().default(false),
      accent: s.enum(['cyan', 'pink', 'yellow', 'orange', 'lime']).default('cyan'),
      body: s.mdx(),
      raw: s.raw(),
    })
    .transform((data) => {
      const slug = data.path.split('/').pop()!;
      return {
        ...data,
        slug,
        url: `/architecture/${slug}`,
        ref: `ADR-${String(data.number).padStart(3, '0')}`,
      };
    }),
});

const playbooks = defineCollection({
  name: 'Playbook',
  pattern: 'playbooks/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      path: s.path(),
      date: s.isodate(),
      summary: s.string().max(320),
      /** e.g. "AI SDLC Governance", "API Design", "Technical Debt" */
      category: s.string(),
      /** The one-line rule this playbook exists to enforce. */
      principle: s.string(),
      tags: s.array(s.string()).default([]),
      draft: s.boolean().default(false),
      accent: s.enum(['cyan', 'pink', 'yellow', 'orange', 'lime']).default('lime'),
      body: s.mdx(),
      raw: s.raw(),
    })
    .transform((data) => {
      const slug = data.path.split('/').pop()!;
      return { ...data, slug, url: `/playbooks/${slug}` };
    }),
});

const posts = defineCollection({
  name: 'Post',
  pattern: 'blog/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(160),
      path: s.path(),
      publishedAt: s.isodate(),
      updatedAt: s.isodate().optional(),
      description: s.string().max(320),
      image: s.image().optional(),
      isPublished: s.boolean().default(true),
      tags: s.array(s.string()).default([]),
      metadata: s.metadata(),
      body: s.mdx(),
      raw: s.raw(),
    })
    .transform((data) => {
      const slug = data.path.split('/').pop()!;
      return { ...data, slug, url: `/blog/${slug}` };
    }),
});

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { adrs, playbooks, posts },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      [
        rehypePrettyCode,
        {
          theme: { dark: 'github-dark-dimmed', light: 'github-light' },
          keepBackground: false,
        },
      ],
    ],
  },
});
