/**
 * Build the retrieval index.
 *
 * Reads the Velite output, chunks every document, embeds the chunks with Voyage,
 * and writes a static artifact that ships with the deploy. Run it whenever
 * content changes:
 *
 *   VOYAGE_API_KEY=... npm run ingest
 *
 * The artifact is committed so a deploy never needs an embedding API key and the
 * index versions and rolls back with the content it describes. Re-run this after
 * changing content, or the index and the site drift apart.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chunkDocument } from '../src/lib/rag/chunk';
import { embed, EMBED_DIMENSIONS, EMBED_MODEL } from '../src/lib/rag/embed';
import { ALL_SUGGESTIONS, queryKey } from '../src/lib/rag/suggestions';
import type { CachedQuery, Chunk, IndexArtifact, IndexedChunk } from '../src/lib/rag/types';
import { githubDocument, refreshSnapshot } from './github-snapshot';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = join(root, 'src/data/embeddings.json');

/** Bumped when chunking or the embedding model changes incompatibly. */
const ARTIFACT_VERSION = 2;

/** Guardrails from ADR-001: the build fails rather than shipping a slow index. */
const MAX_CHUNKS = 4000;
const MAX_ARTIFACT_BYTES = 24 * 1024 * 1024;

const BATCH_SIZE = 96;

/**
 * Voyage's no-payment-method tier allows 3 requests and 10K tokens per minute,
 * and it enforces both — a 20K-token corpus sent as one burst is rejected with
 * a 429 no matter how few requests it takes. So batches are capped by *tokens*
 * rather than count, and paced far enough apart to stay under the token
 * ceiling as well as the request one. On a paid key this costs a couple of
 * minutes on a full rebuild and nothing else; correctness beats speed for a
 * script that runs when content changes.
 */
const TIER_TOKENS_PER_MIN = 10_000;
const BATCH_TOKEN_BUDGET = 4_000;
/** 4K tokens every 30s ≈ 8K/min, comfortably inside both limits. */
const BATCH_PAUSE_MS = 30_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function readCollection<T>(name: string): Promise<T[]> {
  try {
    return JSON.parse(await readFile(join(root, '.velite', `${name}.json`), 'utf8')) as T[];
  } catch {
    console.warn(`  ! no ${name}.json — run \`npx velite build\` first`);
    return [];
  }
}

type AdrDoc = {
  slug: string; url: string; title: string; raw: string; summary: string;
  context: string; decision: string; reversibility: string; ref: string; domain: string;
  options: { name: string; summary: string; because: string; verdict: string }[];
  failureModes: { trigger: string; blastRadius: string; detection: string; mitigation: string }[];
  metrics: { label: string; value: string; basis: string }[];
  draft: boolean;
};
type ProjectDoc = {
  slug: string; url: string; title: string; raw: string; tagline: string; summary: string;
  client: string; role: string; period: string; status: string; statusNote?: string;
  highlights: string[]; stack: string[]; draft: boolean;
  metrics: { label: string; value: string; basis: string }[];
};
type PlaybookDoc = { slug: string; url: string; title: string; raw: string; summary: string; principle: string; category: string; draft: boolean };
type PostDoc = { slug: string; url: string; title: string; raw: string; description: string; isPublished: boolean };
type ProfileDoc = { slug: string; url: string; title: string; raw: string; summary: string; source: string; draft: boolean };

/**
 * The structured ADR fields are the most information-dense text on the site and
 * live in frontmatter, not the MDX body — so they are flattened into a synthetic
 * preamble. Without this, a query like "why did he reject pgvector" could not
 * match anything, because that reasoning is in a YAML field.
 */
function adrPreamble(adr: AdrDoc): string {
  const options = adr.options
    .map((o) => `Option "${o.name}" (${o.verdict}): ${o.summary} Rationale: ${o.because}`)
    .join('\n');
  const failures = adr.failureModes
    .map((f) => `Failure mode: ${f.trigger}. Blast radius: ${f.blastRadius}. Detection: ${f.detection}. Mitigation: ${f.mitigation}`)
    .join('\n');
  const metrics = adr.metrics.map((m) => `Metric ${m.label}: ${m.value} (${m.basis})`).join('\n');

  return [
    `${adr.ref}: ${adr.title}. Domain: ${adr.domain}.`,
    adr.summary,
    `Context: ${adr.context}`,
    options,
    `Decision: ${adr.decision}`,
    `Reversibility: ${adr.reversibility}`,
    failures,
    metrics,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Same reasoning as `adrPreamble`: the parts of a case study a visitor is most
 * likely to ask about — what it is, what made it hard, what is not built yet —
 * are frontmatter fields rather than body prose, so they have to be flattened
 * in or they cannot be retrieved at all.
 */
function projectPreamble(p: ProjectDoc): string {
  const metrics = p.metrics.map((m) => `Metric ${m.label}: ${m.value} (${m.basis})`).join('\n');

  return [
    `${p.title}: ${p.tagline}. Built for ${p.client}. Status: ${p.status}.`,
    p.statusNote,
    p.summary,
    `My role: ${p.role} (${p.period})`,
    p.highlights.length > 0 ? `What made it hard:\n${p.highlights.join('\n')}` : '',
    p.stack.length > 0 ? `Built with: ${p.stack.join(', ')}` : '',
    metrics,
  ]
    .filter(Boolean)
    .join('\n\n');
}

async function main() {
  console.log('Building retrieval index…\n');

  const [projects, adrs, playbooks, posts, profiles] = await Promise.all([
    readCollection<ProjectDoc>('projects'),
    readCollection<AdrDoc>('adrs'),
    readCollection<PlaybookDoc>('playbooks'),
    readCollection<PostDoc>('posts'),
    readCollection<ProfileDoc>('profiles'),
  ]);

  const github = await refreshSnapshot();

  const chunks: Chunk[] = [];

  for (const p of projects) {
    if (p.draft) continue;
    chunks.push(
      ...chunkDocument({
        id: `project:${p.slug}`,
        url: p.url,
        title: p.title,
        kind: 'project',
        raw: p.raw,
        preamble: projectPreamble(p),
      }),
    );
  }

  for (const adr of adrs) {
    if (adr.draft) continue; // Scaffolds are placeholders; never index them.
    chunks.push(
      ...chunkDocument({
        id: `adr:${adr.slug}`,
        url: adr.url,
        title: `${adr.ref}: ${adr.title}`,
        kind: 'adr',
        raw: adr.raw,
        preamble: adrPreamble(adr),
      }),
    );
  }

  for (const p of playbooks) {
    if (p.draft) continue;
    chunks.push(
      ...chunkDocument({
        id: `playbook:${p.slug}`,
        url: p.url,
        title: p.title,
        kind: 'playbook',
        raw: p.raw,
        preamble: `${p.title}. Category: ${p.category}. Principle: ${p.principle}\n\n${p.summary}`,
      }),
    );
  }

  for (const post of posts) {
    if (!post.isPublished) continue;
    chunks.push(
      ...chunkDocument({
        id: `post:${post.slug}`,
        url: post.url,
        title: post.title,
        kind: 'post',
        raw: post.raw,
        preamble: `${post.title}\n\n${post.description}`,
      }),
    );
  }

  for (const profile of profiles) {
    if (profile.draft) continue;
    chunks.push(
      ...chunkDocument({
        id: `profile:${profile.slug}`,
        url: profile.url,
        title: profile.title,
        kind: 'profile',
        raw: profile.raw,
        preamble: `${profile.title}. Source: ${profile.source}.\n\n${profile.summary}`,
      }),
    );
  }

  const gh = githubDocument(github);
  chunks.push(
    ...chunkDocument({
      id: gh.id,
      url: gh.url,
      title: gh.title,
      kind: 'profile',
      raw: gh.raw,
      preamble: gh.preamble,
    }),
  );

  const totalTokens = chunks.reduce((sum, c) => sum + c.tokens, 0);
  console.log(
    `  documents : ${projects.length} projects, ${adrs.length} ADRs, ${playbooks.length} playbooks, ${posts.length} posts, ${profiles.length} profile, github snapshot`,
  );
  console.log(`  chunks    : ${chunks.length}`);
  console.log(`  tokens    : ~${totalTokens.toLocaleString()} (mean ${Math.round(totalTokens / (chunks.length || 1))}/chunk)`);

  if (chunks.length === 0) {
    console.error('\n  ✗ No chunks produced — nothing to index.');
    process.exit(1);
  }

  // ADR-001 documents this as the trigger to move to pgvector. Fail loudly at
  // build time rather than silently shipping a linearly-slower index.
  if (chunks.length > MAX_CHUNKS) {
    console.error(
      `\n  ✗ ${chunks.length} chunks exceeds the ${MAX_CHUNKS} ceiling for brute-force scoring.` +
        `\n    This is the documented trigger in ADR-001 to swap StaticHybridRetriever for a` +
        `\n    pgvector-backed Retriever. Raising this limit is not the fix.`,
    );
    process.exit(1);
  }

  const embedded: IndexedChunk[] = [];
  const started = Date.now();

  /**
   * Reuse vectors for chunks whose text has not changed. A full re-embed of an
   * unchanged corpus is a waste of the Voyage quota and twenty minutes of
   * pacing; only new or edited passages should hit the API.
   */
  const previous = await readFile(OUTPUT, 'utf8')
    .then((json) => JSON.parse(json) as IndexArtifact)
    .catch(() => null);
  const reuse =
    previous && previous.model === EMBED_MODEL && previous.dimensions === EMBED_DIMENSIONS
      ? new Map(
          previous.chunks
            .filter((c) => c.embedding.length === EMBED_DIMENSIONS)
            .map((c) => [`${c.id}\0${c.title}\0${c.section}\0${c.text}`, c.embedding] as const),
        )
      : null;

  /** Suggestion vectors survive a rebuild too, for the same reason. */
  const reuseQueries = new Map((previous?.queryCache ?? []).map((q) => [q.key, q.embedding] as const));

  /**
   * Without a key we still build a usable index — the lexical half of hybrid
   * retrieval needs no model. The artifact records `dimensions: 0` so the
   * retriever knows to run lexical-only and say so, rather than scoring against
   * meaningless vectors and quietly returning worse answers.
   */
  const canEmbed = Boolean(process.env.VOYAGE_API_KEY);
  if (!canEmbed) {
    for (const chunk of chunks) {
      const cached = reuse?.get(`${chunk.id}\0${chunk.title}\0${chunk.section}\0${chunk.text}`);
      embedded.push({ ...chunk, embedding: cached ?? [] });
    }
    const missing = embedded.filter((c) => c.embedding.length === 0).length;
    if (missing === embedded.length) {
      console.warn(
        '\n  ! VOYAGE_API_KEY not set — building a LEXICAL-ONLY index.' +
          '\n    Retrieval will work (BM25) but paraphrased questions will do worse.' +
          '\n    Set the key and re-run to enable the dense half.',
      );
    } else if (missing > 0) {
      console.warn(
        `\n  ! VOYAGE_API_KEY not set — reused ${embedded.length - missing} vectors; ${missing} new chunks are lexical-only.`,
      );
    } else {
      console.log(`  reused    : ${embedded.length} vectors (no key, nothing new to embed)`);
    }
  }

  if (canEmbed) console.log(`\n  embedding with ${EMBED_MODEL} (${EMBED_DIMENSIONS}d)…`);

  // Token-budgeted batches, so a single request can never exceed the tier's
  // per-minute token allowance on its own. Chunks whose text already has a
  // vector in the previous artifact are skipped.
  const batches: Chunk[][] = [];
  if (canEmbed) {
    const pending: Chunk[] = [];
    for (const chunk of chunks) {
      const cached = reuse?.get(`${chunk.id}\0${chunk.title}\0${chunk.section}\0${chunk.text}`);
      if (cached) {
        embedded.push({ ...chunk, embedding: cached });
      } else {
        pending.push(chunk);
      }
    }
    if (reuse && embedded.length > 0) {
      console.log(`  reused    : ${embedded.length} unchanged vectors`);
    }

    let current: Chunk[] = [];
    let currentTokens = 0;
    for (const chunk of pending) {
      const tokens = chunk.tokens || 0;
      if (current.length >= BATCH_SIZE || (current.length > 0 && currentTokens + tokens > BATCH_TOKEN_BUDGET)) {
        batches.push(current);
        current = [];
        currentTokens = 0;
      }
      current.push(chunk);
      currentTokens += tokens;
    }
    if (current.length > 0) batches.push(current);

    const minutes = ((batches.length - 1) * BATCH_PAUSE_MS) / 60_000;
    if (minutes > 0) {
      console.log(
        `  ${batches.length} batches, paced for the ${TIER_TOKENS_PER_MIN.toLocaleString()} tok/min tier — about ${minutes.toFixed(1)} min…`,
      );
    }
  }

  for (let b = 0; b < batches.length; b++) {
    if (b > 0) await sleep(BATCH_PAUSE_MS);
    const batch = batches[b]!;
    const vectors = await embed(
      batch.map((c) => `${c.title}\n${c.section}\n\n${c.text}`),
      'document',
    );
    batch.forEach((chunk, j) => {
      const vector = vectors[j];
      if (!vector) throw new Error(`Missing embedding for chunk ${chunk.id}`);
      embedded.push({
        ...chunk,
        // Trimming to 6 decimals costs ~1e-6 of cosine precision and roughly
        // halves the artifact — a good trade when the file ships in the bundle.
        embedding: vector.map((v) => Number(v.toFixed(6))),
      });
    });
    process.stdout.write(`\r  embedded  : ${embedded.length}/${chunks.length}`);
  }

  /**
   * Precompute the suggested prompts.
   *
   * They are a fixed set and they dominate real traffic — the chips are the
   * most-clicked queries on the site — so embedding them here means a click
   * costs no request at all at answer time. That matters more than it sounds
   * on a free tier metered at three requests a minute: without this, four
   * visitors clicking a suggestion inside one minute is enough to knock dense
   * retrieval out and degrade the fourth answer to lexical-only.
   */
  const queryCache: CachedQuery[] = [];
  if (canEmbed) {
    const missing = ALL_SUGGESTIONS.filter((text) => !reuseQueries.has(queryKey(text)));
    if (missing.length > 0) {
      // One request: the suggestion set is small enough to never approach the
      // per-request token budget, so it does not need the batching above.
      if (batches.length > 0) await sleep(BATCH_PAUSE_MS);
      const vectors = await embed(missing, 'query');
      missing.forEach((text, i) => {
        const vector = vectors[i];
        if (!vector) throw new Error(`Missing embedding for suggestion: ${text}`);
        reuseQueries.set(queryKey(text), vector.map((v) => Number(v.toFixed(6))));
      });
    }
    for (const text of ALL_SUGGESTIONS) {
      const embedding = reuseQueries.get(queryKey(text));
      if (embedding) queryCache.push({ key: queryKey(text), embedding });
    }
    console.log(`\n  prompts   : ${queryCache.length} suggestion vectors cached`);
  }

  const denseCount = embedded.filter((c) => c.embedding.length === EMBED_DIMENSIONS).length;
  const artifact: IndexArtifact = {
    version: ARTIFACT_VERSION,
    model: denseCount > 0 ? EMBED_MODEL : 'none (lexical-only)',
    dimensions: denseCount > 0 ? EMBED_DIMENSIONS : 0,
    builtAt: new Date().toISOString(),
    chunks: embedded,
    queryCache,
  };

  const json = JSON.stringify(artifact);
  if (json.length > MAX_ARTIFACT_BYTES) {
    console.error(`\n\n  ✗ Artifact is ${(json.length / 1e6).toFixed(1)} MB, over the ceiling.`);
    process.exit(1);
  }

  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, json, 'utf8');

  console.log(`\n\n  ✓ wrote ${OUTPUT.replace(root + '/', '')}`);
  console.log(`    ${(json.length / 1024).toFixed(0)} KB · ${embedded.length} chunks · ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

main().catch((error) => {
  console.error('\n✗ Ingest failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
