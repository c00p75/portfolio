/**
 * The embedding provider boundary.
 *
 * Everything provider-specific lives in this file on purpose: moving off Voyage
 * means rewriting `embed` and re-running the ingest, and touching nothing else.
 * Anthropic does not offer an embeddings endpoint, so this is a second vendor by
 * necessity — which is exactly why it is isolated behind one function.
 */

export const EMBED_MODEL = 'voyage-3.5-lite';
export const EMBED_DIMENSIONS = 1024;

const ENDPOINT = 'https://api.voyageai.com/v1/embeddings';

/** Voyage distinguishes corpus vs query embeddings; using the wrong one costs recall. */
export type EmbedKind = 'document' | 'query';

export class EmbeddingError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'EmbeddingError';
  }
}

async function callVoyage(texts: string[], kind: EmbedKind, signal?: AbortSignal): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new EmbeddingError('VOYAGE_API_KEY is not set');

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: texts,
      input_type: kind,
      output_dimension: EMBED_DIMENSIONS,
    }),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new EmbeddingError(
      `Voyage returned ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`,
      response.status,
    );
  }

  const json = (await response.json()) as {
    data?: { embedding: number[]; index: number }[];
  };
  if (!json.data) throw new EmbeddingError('Voyage response had no data field');

  // The API does not guarantee ordering; index explicitly rather than assuming.
  const out: number[][] = new Array(texts.length);
  for (const item of json.data) out[item.index] = item.embedding;

  if (out.some((v) => !v)) throw new EmbeddingError('Voyage response was missing embeddings');
  return out;
}

/** Embed a batch of texts. Batched by the caller for ingest; single for queries. */
export async function embed(
  texts: string[],
  kind: EmbedKind,
  signal?: AbortSignal,
): Promise<number[][]> {
  if (texts.length === 0) return [];
  return callVoyage(texts, kind, signal);
}

export async function embedQuery(text: string, signal?: AbortSignal): Promise<number[]> {
  const [vector] = await embed([text], 'query', signal);
  if (!vector) throw new EmbeddingError('No embedding returned for query');
  return vector;
}

/**
 * Cosine similarity. Vectors from Voyage arrive L2-normalised, so this is a dot
 * product in practice — but the norms are computed anyway, because silently
 * depending on an undocumented provider guarantee is how retrieval quality
 * degrades without anyone noticing.
 */
export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i]!;
    const y = b[i]!;
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
