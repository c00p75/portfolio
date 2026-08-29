import artifact from '@/data/embeddings.json';
import { StaticHybridRetriever } from './retriever';
import { isMiyagiChunk, type AskScope } from './scope';
import type { IndexArtifact, Retriever } from './types';

/**
 * Built once per server instance and reused across requests. Constructing the
 * BM25 index costs a few milliseconds over this corpus, and doing it per request
 * would put that on every user's latency for no reason. Miyagi is a separate
 * index over the same artifact so BM25 and dense never see another project's
 * chunks — filtering after top-K would still leak them.
 */
let cachedSite: StaticHybridRetriever | null = null;
let cachedMiyagi: StaticHybridRetriever | null = null;

function scopedChunks(scope: AskScope) {
  const a = artifact as IndexArtifact;
  if (scope === 'miyagi') return a.chunks.filter(isMiyagiChunk);
  return a.chunks;
}

export function getRetriever(scope: AskScope = 'site'): Retriever {
  if (scope === 'miyagi') {
    if (!cachedMiyagi) {
      const a = artifact as IndexArtifact;
      cachedMiyagi = new StaticHybridRetriever({ ...a, chunks: scopedChunks('miyagi') });
    }
    return cachedMiyagi;
  }
  if (!cachedSite) cachedSite = new StaticHybridRetriever(artifact as IndexArtifact);
  return cachedSite;
}

export function indexMeta(scope: AskScope = 'site') {
  const a = artifact as IndexArtifact;
  return {
    model: a.model,
    dimensions: a.dimensions,
    builtAt: a.builtAt,
    chunks: scopedChunks(scope).length,
  };
}

/** True when `npm run ingest` has not been run — the UI says so rather than failing opaquely. */
export function indexIsEmpty(scope: AskScope = 'site'): boolean {
  return scopedChunks(scope).length === 0;
}
