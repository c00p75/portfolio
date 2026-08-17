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

/**
 * A system I built, written up as a case study. This is the collection the
 * portfolio leads with; ADRs hang off it as the evidence behind individual
 * decisions rather than standing in for the work itself.
 */
const projects = defineCollection({
  name: 'Project',
  pattern: 'projects/**/*.mdx',
  schema: s
    .object({
      /** The product's own name, not a description of it. */
      title: s.string().max(80),
      path: s.path(),
      /** One line a non-engineer would understand. Shown under the title. */
      tagline: s.string().max(140),
      /** Card and hero copy: what it is and what made it hard, in a paragraph. */
      summary: s.string().max(420),
      /** Who it was for — client, employer, or a product of my own. */
      client: s.string(),
      /** What I did on it. Be specific about scope of ownership. */
      role: s.string(),
      /** e.g. "2025 — present". Free text so open-ended work reads honestly. */
      period: s.string(),
      /**
       * Deliberately not a boolean "shipped". Several of these systems have
       * parts in production and parts still specified-not-built, and a card
       * that implies otherwise is the one thing this section must not do.
       */
      status: s.enum(['production', 'in-build', 'prototype', 'archived']),
      /** Optional qualifier on `status`, e.g. "server live, scanner in build". */
      statusNote: s.string().max(160).optional(),
      /** Ordering on the index and home page. Lower sorts first. */
      order: s.number().default(99),
      featured: s.boolean().default(false),
      draft: s.boolean().default(false),
      accent: s.enum(['cyan', 'pink', 'yellow', 'orange', 'lime']).default('cyan'),
      /** The capability areas this project demonstrates; drives home-page grouping. */
      disciplines: s.array(s.enum(['architecture', 'ai', 'mobile', 'payments', 'frontend', 'data'])).default([]),
      stack: s.array(s.string()).default([]),
      /** The two or three problems worth reading about, as prose bullets. */
      highlights: s.array(s.string()).default([]),
      /** Headline figures. Same shape as an ADR metric so `basis` stays required. */
      metrics: s.array(metric).default([]),
      /** Key of a React diagram registered in src/components/blueprints. */
      diagram: s.string().optional(),
      links: s
        .array(s.object({ label: s.string(), href: s.string(), kind: s.enum(['live', 'repo', 'writeup', 'other']).default('other') }))
        .default([]),
      /**
       * Card/hero image. Paths are relative to the MDX file (see blog posts)
       * and are copied into /static by Velite.
       */
      cover: s.image().optional(),
      /** Additional product screenshots shown on the case study. */
      gallery: s
        .array(
          s.object({
            image: s.image(),
            alt: s.string().max(160),
            caption: s.string().max(200).optional(),
          }),
        )
        .default([]),
      /**
       * Optional screen recording. `src` is a public URL path (e.g.
       * /videos/projects/balloads-demo.mp4) so large mp4s stay out of Velite's
       * asset pipeline. `poster` is an image processed like cover.
       */
      video: s
        .object({
          src: s.string(),
          poster: s.image().optional(),
          caption: s.string().max(200).optional(),
        })
        .optional(),
      body: s.mdx(),
      raw: s.raw(),
    })
    .transform((data) => {
      const slug = data.path.split('/').pop()!;
      return { ...data, slug, url: `/work/${slug}` };
    }),
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
      /**
       * Slug of the project in `content/projects` this decision belongs to.
       * Records are surfaced through their project's case study, so one without
       * a project is reachable only by direct link.
       */
      project: s.string().optional(),
      /** Short label for the decision, for the "hard calls" list on a case
       *  study, where the full title is too long to scan. */
      shortTitle: s.string().max(70).optional(),
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
      /** Heading tree for the in-page contents rail. Ids come from rehypeSlug. */
      toc: s.toc(),
      body: s.mdx(),
      raw: s.raw(),
    })
    .transform((data) => {
      const slug = data.path.split('/').pop()!;
      return { ...data, slug, url: `/playbooks/${slug}` };
    }),
});

/**
 * Authored biography the chat can retrieve against. Not a public page of its
 * own — it is the feed for questions about George (education, certifications,
 * career) that the case studies and ADRs do not cover.
 */
const profiles = defineCollection({
  name: 'Profile',
  pattern: 'profile/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      path: s.path(),
      summary: s.string().max(420),
      /** Where the facts were transcribed from, so a citation can say so. */
      source: s.enum(['authored', 'linkedin', 'github']).default('authored'),
      draft: s.boolean().default(false),
      body: s.mdx(),
      raw: s.raw(),
    })
    .transform((data) => {
      const slug = data.path.split('/').pop()!;
      return { ...data, slug, url: '/about' };
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
      /** Heading tree for the in-page contents rail. Ids come from rehypeSlug. */
      toc: s.toc(),
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
  collections: { projects, adrs, playbooks, posts, profiles },
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
