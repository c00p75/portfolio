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
import type { Chunk, IndexArtifact, IndexedChunk } from '../src/lib/rag/types';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = join(root, 'src/data/embeddings.json');

/** Bumped when chunking or the embedding model changes incompatibly. */
const ARTIFACT_VERSION = 1;

/** Guardrails from ADR-001: the build fails rather than shipping a slow index. */
const MAX_CHUNKS = 4000;
const MAX_ARTIFACT_BYTES = 24 * 1024 * 1024;

const BATCH_SIZE = 96;

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
type PlaybookDoc = { slug: string; url: string; title: string; raw: string; summary: string; principle: string; category: string; draft: boolean };
type PostDoc = { slug: string; url: string; title: string; raw: string; description: string; isPublished: boolean };

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
    `${adr.ref} — ${adr.title}. Domain: ${adr.domain}.`,
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

async function main() {
  console.log('Building retrieval index…\n');

  const [adrs, playbooks, posts] = await Promise.all([
    readCollection<AdrDoc>('adrs'),
    readCollection<PlaybookDoc>('playbooks'),
    readCollection<PostDoc>('posts'),
  ]);

  const chunks: Chunk[] = [];

  for (const adr of adrs) {
    if (adr.draft) continue; // Scaffolds are placeholders; never index them.
    chunks.push(
      ...chunkDocument({
        id: `adr:${adr.slug}`,
        url: adr.url,
        title: `${adr.ref} — ${adr.title}`,
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

  const totalTokens = chunks.reduce((sum, c) => sum + c.tokens, 0);
  console.log(`  documents : ${adrs.length} ADRs, ${playbooks.length} playbooks, ${posts.length} posts`);
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
   * Without a key we still build a usable index — the lexical half of hybrid
   * retrieval needs no model. The artifact records `dimensions: 0` so the
   * retriever knows to run lexical-only and say so, rather than scoring against
   * meaningless vectors and quietly returning worse answers.
   */
  const canEmbed = Boolean(process.env.VOYAGE_API_KEY);
  if (!canEmbed) {
    console.warn(
      '\n  ! VOYAGE_API_KEY not set — building a LEXICAL-ONLY index.' +
        '\n    Retrieval will work (BM25) but paraphrased questions will do worse.' +
        '\n    Set the key and re-run to enable the dense half.',
    );
    for (const chunk of chunks) embedded.push({ ...chunk, embedding: [] });
  }

  if (canEmbed) console.log(`\n  embedding with ${EMBED_MODEL} (${EMBED_DIMENSIONS}d)…`);

  for (let i = 0; canEmbed && i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
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

  const artifact: IndexArtifact = {
    version: ARTIFACT_VERSION,
    model: canEmbed ? EMBED_MODEL : 'none (lexical-only)',
    dimensions: canEmbed ? EMBED_DIMENSIONS : 0,
    builtAt: new Date().toISOString(),
    chunks: embedded,
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
