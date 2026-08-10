import artifact from '@/data/embeddings.json';
import { StaticHybridRetriever } from './retriever';
import type { IndexArtifact, Retriever } from './types';

/**
 * Built once per server instance and reused across requests. Constructing the
 * BM25 index costs a few milliseconds over this corpus, and doing it per request
 * would put that on every user's latency for no reason.
 */
let cached: StaticHybridRetriever | null = null;

export function getRetriever(): Retriever {
  if (!cached) cached = new StaticHybridRetriever(artifact as IndexArtifact);
  return cached;
}

export function indexMeta() {
  const a = artifact as IndexArtifact;
  return { model: a.model, dimensions: a.dimensions, builtAt: a.builtAt, chunks: a.chunks.length };
}

/** True when `npm run ingest` has not been run — the UI says so rather than failing opaquely. */
export function indexIsEmpty(): boolean {
  return (artifact as IndexArtifact).chunks.length === 0;
}
