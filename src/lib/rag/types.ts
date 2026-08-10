/** A retrievable unit of the corpus. */
export type Chunk = {
  id: string;
  /** Page this chunk came from, for citation. */
  url: string;
  title: string;
  /** Nearest enclosing heading, so a citation can point at a section. */
  section: string;
  kind: 'adr' | 'playbook' | 'post';
  text: string;
  tokens: number;
};

/** A chunk with its embedding, as persisted in the build artifact. */
export type IndexedChunk = Chunk & { embedding: number[] };

export type IndexArtifact = {
  /** Bumped when the chunking or embedding scheme changes incompatibly. */
  version: number;
  model: string;
  dimensions: number;
  builtAt: string;
  chunks: IndexedChunk[];
};

/** One retrieved passage plus the scoring provenance behind it. */
export type Retrieved = {
  chunk: Chunk;
  /** Final fused score (reciprocal rank fusion). */
  score: number;
  /** 1-based rank in each individual ranking; null when that path didn't return it. */
  denseRank: number | null;
  lexicalRank: number | null;
};

export type RetrievalMode = 'hybrid' | 'lexical-only';

export type RetrievalResult = {
  passages: Retrieved[];
  mode: RetrievalMode;
  timings: {
    embedMs: number;
    lexicalMs: number;
    denseMs: number;
    fuseMs: number;
    totalMs: number;
  };
  /** Set when dense retrieval was skipped, so the UI can say so honestly. */
  degradedReason?: string;
};

/**
 * The seam this whole design turns on. Swapping the in-process index for
 * pgvector means writing one more implementation of this — the route handler
 * never learns which one it has.
 */
export interface Retriever {
  search(query: string, topK: number): Promise<RetrievalResult>;
  /** Number of chunks in the index, for telemetry. */
  size(): number;
}
