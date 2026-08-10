/**
 * Retrieval evaluation harness.
 *
 * Runs a golden set of question → expected-document pairs through the retriever
 * and reports recall@k and MRR, plus per-stage latency. Run it after changing
 * chunking, the fusion constant, or the embedding model — retrieval quality
 * regressions are invisible without a measurement like this.
 *
 *   npm run eval              # lexical-only (no API key needed)
 *   VOYAGE_API_KEY=... npm run eval   # full hybrid
 */
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StaticHybridRetriever } from '../src/lib/rag/retriever';
import type { IndexArtifact } from '../src/lib/rag/types';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Each case names the document that *should* be retrieved. Deliberately mixes
 * paraphrase queries (where dense retrieval should win) with rare-term queries
 * (where BM25 should win), because the point of hybrid is that neither path
 * covers both.
 */
const GOLDEN: { q: string; expect: string; probes: 'lexical' | 'semantic' }[] = [
  { q: 'why was a managed vector database rejected', expect: 'adr:portfolio-retrieval-architecture', probes: 'semantic' },
  { q: 'pgvector', expect: 'adr:portfolio-retrieval-architecture', probes: 'lexical' },
  { q: 'reciprocal rank fusion', expect: 'adr:portfolio-retrieval-architecture', probes: 'lexical' },
  { q: 'what happens if the embedding call fails', expect: 'adr:portfolio-retrieval-architecture', probes: 'semantic' },
  { q: 'how much does one query cost', expect: 'adr:portfolio-retrieval-architecture', probes: 'semantic' },
  { q: 'BM25', expect: 'adr:portfolio-retrieval-architecture', probes: 'lexical' },
  { q: 'how should teams review AI generated code', expect: 'playbook:ai-accelerated-architecture-gated-sdlc', probes: 'semantic' },
  { q: 'spec before generation', expect: 'playbook:ai-accelerated-architecture-gated-sdlc', probes: 'lexical' },
  { q: 'does test coverage percentage mean anything', expect: 'playbook:ai-accelerated-architecture-gated-sdlc', probes: 'semantic' },
  { q: 'why use TypeScript', expect: 'post:why-typescript', probes: 'semantic' },
  { q: 'stimulus rails', expect: 'post:getting-started-with-stimulus-in-a-rails-app', probes: 'lexical' },
  { q: 'improving search engine ranking', expect: 'post:seo-best-practices', probes: 'semantic' },
];

const K = 6;

async function main() {
  const artifact = JSON.parse(
    await readFile(join(root, 'src/data/embeddings.json'), 'utf8'),
  ) as IndexArtifact;

  if (artifact.chunks.length === 0) {
    console.error('✗ Index is empty. Run `npm run ingest` first.');
    process.exit(1);
  }

  const hasKey = Boolean(process.env.VOYAGE_API_KEY);
  console.log(`\nRetrieval eval — ${artifact.chunks.length} chunks, ${hasKey ? 'hybrid' : 'lexical-only (no VOYAGE_API_KEY)'}\n`);

  const retriever = new StaticHybridRetriever(artifact);

  let hits = 0;
  let reciprocalRankSum = 0;
  const latencies: number[] = [];
  const failures: string[] = [];

  for (const testCase of GOLDEN) {
    const result = await retriever.search(testCase.q, K);
    latencies.push(result.timings.totalMs);

    // A hit is any retrieved chunk belonging to the expected document.
    const rank = result.passages.findIndex((p) => p.chunk.id.startsWith(`${testCase.expect}#`)) + 1;
    const hit = rank > 0;
    if (hit) {
      hits += 1;
      reciprocalRankSum += 1 / rank;
    } else {
      failures.push(`${testCase.q}  (expected ${testCase.expect})`);
    }

    const top = result.passages[0];
    console.log(
      `  ${hit ? '✓' : '✗'} ${testCase.probes.padEnd(8)} rank ${hit ? String(rank).padStart(2) : ' –'}  ` +
        `${result.timings.totalMs.toFixed(1).padStart(6)}ms  “${testCase.q}”` +
        (top ? `\n      top: ${top.chunk.section} [dense ${top.denseRank ?? '–'} / bm25 ${top.lexicalRank ?? '–'}]` : ''),
    );
  }

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] ?? 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] ?? 0;

  console.log(`\n  recall@${K} : ${hits}/${GOLDEN.length} (${((hits / GOLDEN.length) * 100).toFixed(0)}%)`);
  console.log(`  MRR      : ${(reciprocalRankSum / GOLDEN.length).toFixed(3)}`);
  console.log(`  latency  : p50 ${p50.toFixed(2)}ms · p95 ${p95.toFixed(2)}ms`);

  if (failures.length > 0) {
    console.log(`\n  misses:`);
    for (const f of failures) console.log(`    – ${f}`);
  }
  console.log();
}

main().catch((error) => {
  console.error('✗ Eval failed:', error);
  process.exit(1);
});
