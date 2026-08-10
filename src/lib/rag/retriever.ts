import { buildBm25Index, bm25Search, type Bm25Index } from './bm25';
import { cosineSimilarity, embedQuery, EmbeddingError } from './embed';
import type { IndexArtifact, Retrieved, RetrievalResult, Retriever } from './types';

/**
 * Reciprocal rank fusion constant. 60 is the value from the original Cormack et
 * al. paper and it is used unchanged here for a specific reason: RRF consumes
 * *rank positions*, not scores, so it needs no calibration between BM25 (an
 * unbounded relevance score) and cosine similarity (bounded, −1..1). Trying to
 * fuse them by weighted score sum would require re-tuning every time the corpus
 * changes; RRF does not.
 */
const RRF_K = 60;

/** How many candidates each path contributes before fusion. */
const CANDIDATES = 12;

function rrfScore(rank: number): number {
  return 1 / (RRF_K + rank);
}

/**
 * The in-process retriever backing ADR-001. Brute-force scoring over an index
 * small enough to hold in memory — correct at this corpus size, deliberately
 * not correct past a few thousand chunks (the ingest script enforces the ceiling).
 */
export class StaticHybridRetriever implements Retriever {
  private readonly lexical: Bm25Index;

  constructor(private readonly artifact: IndexArtifact) {
    this.lexical = buildBm25Index(
      // Index the section heading alongside the body so a query naming a section
      // can find it even when the body never repeats the heading's words.
      artifact.chunks.map((c) => `${c.title}\n${c.section}\n${c.text}`),
    );
  }

  size(): number {
    return this.artifact.chunks.length;
  }

  async search(query: string, topK = 6): Promise<RetrievalResult> {
    const t0 = performance.now();

    // --- Lexical path (never fails, needs no network) --------------------
    const tLex = performance.now();
    const lexicalHits = bm25Search(this.lexical, query, CANDIDATES);
    const lexicalMs = performance.now() - tLex;

    // --- Dense path (network; degrades to lexical-only on failure) -------
    let denseHits: [number, number][] = [];
    let embedMs = 0;
    let denseMs = 0;
    let degradedReason: string | undefined;

    // An artifact built without an embedding key carries no vectors. That is a
    // known degraded mode, not an error — skip the dense path rather than
    // scoring against empty arrays and pretending the result is hybrid.
    const hasVectors = this.artifact.dimensions > 0;

    try {
      if (!hasVectors) throw new EmbeddingError('index built without embeddings');
      const tEmbed = performance.now();
      const vector = await embedQuery(query);
      embedMs = performance.now() - tEmbed;

      const tDense = performance.now();
      const scored: [number, number][] = this.artifact.chunks.map((chunk, i) => [
        i,
        cosineSimilarity(vector, chunk.embedding),
      ]);
      scored.sort((a, b) => b[1] - a[1]);
      denseHits = scored.slice(0, CANDIDATES);
      denseMs = performance.now() - tDense;
    } catch (error) {
      // This is the documented degraded mode, not an outage: lexical retrieval
      // still answers, and the telemetry stream says the answer is degraded.
      degradedReason = !hasVectors
        ? 'Index was built without embeddings — lexical (BM25) retrieval only. Run `npm run ingest` with VOYAGE_API_KEY set to enable dense retrieval.'
        : error instanceof EmbeddingError
          ? `Embedding unavailable (${error.message}) — lexical retrieval only`
          : 'Embedding unavailable — lexical retrieval only';
    }

    // --- Fusion ----------------------------------------------------------
    const tFuse = performance.now();
    const fused = new Map<number, { score: number; denseRank: number | null; lexicalRank: number | null }>();

    lexicalHits.forEach(([docIndex], i) => {
      const rank = i + 1;
      const entry = fused.get(docIndex) ?? { score: 0, denseRank: null, lexicalRank: null };
      entry.score += rrfScore(rank);
      entry.lexicalRank = rank;
      fused.set(docIndex, entry);
    });

    denseHits.forEach(([docIndex], i) => {
      const rank = i + 1;
      const entry = fused.get(docIndex) ?? { score: 0, denseRank: null, lexicalRank: null };
      entry.score += rrfScore(rank);
      entry.denseRank = rank;
      fused.set(docIndex, entry);
    });

    const passages: Retrieved[] = [...fused.entries()]
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, topK)
      .flatMap(([docIndex, meta]) => {
        const indexed = this.artifact.chunks[docIndex];
        if (!indexed) return [];
        // Drop the embedding — it is large and the caller never needs it.
        const { embedding: _embedding, ...chunk } = indexed;
        return [{ chunk, score: meta.score, denseRank: meta.denseRank, lexicalRank: meta.lexicalRank }];
      });
    const fuseMs = performance.now() - tFuse;

    return {
      passages,
      mode: degradedReason ? 'lexical-only' : 'hybrid',
      degradedReason,
      timings: {
        embedMs: round(embedMs),
        lexicalMs: round(lexicalMs),
        denseMs: round(denseMs),
        fuseMs: round(fuseMs),
        totalMs: round(performance.now() - t0),
      },
    };
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
