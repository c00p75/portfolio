/**
 * A small BM25 implementation over the in-process corpus.
 *
 * BM25 exists here because dense retrieval is reliably bad at exactly the
 * queries this assistant gets asked: ones containing a rare, specific token
 * ("pgvector", "RRF", "429"). Embeddings smooth those away; a lexical index
 * does not.
 */

const K1 = 1.5;
const B = 0.75;

/** Common English words plus terms so frequent in this corpus they carry no signal. */
const STOP = new Set(
  `a an the and or but if then than that this these those is are was were be been being
   of in on at to for from with without by as into over under about across it its
   i you he she they we do does did doing have has had not no so such can could
   will would should may might must own same too very just also here there when where
   how what which who whom why all any both each few more most other some only`.split(/\s+/),
);

/**
 * Very small stemmer: strips the handful of English suffixes that actually cause
 * misses in this corpus. A full Porter stemmer would be more correct and is not
 * worth the bytes at this scale.
 */
function stem(token: string): string {
  if (token.length <= 4) return token;
  for (const suffix of ['ations', 'ation', 'ingly', 'edly', 'ing', 'ies', 'ers', 'er', 'es', 's']) {
    if (token.endsWith(suffix) && token.length - suffix.length >= 3) {
      const base = token.slice(0, -suffix.length);
      return suffix === 'ies' ? `${base}y` : base;
    }
  }
  return token;
}

export function tokenize(text: string): string[] {
  return (
    text
      .toLowerCase()
      // Keep intra-word dots/dashes so "next.js" and "rate-limit" survive.
      .split(/[^a-z0-9.\-+#]+/)
      .map((t) => t.replace(/^[.\-]+|[.\-]+$/g, ''))
      .filter((t) => t.length > 1 && !STOP.has(t))
      .map(stem)
  );
}

export type Bm25Index = {
  /** term -> (docIndex -> term frequency) */
  postings: Map<string, Map<number, number>>;
  docLengths: number[];
  avgDocLength: number;
  docCount: number;
};

export function buildBm25Index(documents: string[]): Bm25Index {
  const postings = new Map<string, Map<number, number>>();
  const docLengths: number[] = [];

  documents.forEach((doc, docIndex) => {
    const terms = tokenize(doc);
    docLengths.push(terms.length);
    for (const term of terms) {
      let posting = postings.get(term);
      if (!posting) postings.set(term, (posting = new Map()));
      posting.set(docIndex, (posting.get(docIndex) ?? 0) + 1);
    }
  });

  const total = docLengths.reduce((a, b) => a + b, 0);
  return {
    postings,
    docLengths,
    avgDocLength: documents.length > 0 ? total / documents.length : 0,
    docCount: documents.length,
  };
}

/** Returns `[docIndex, score]` pairs, highest score first, zero scores dropped. */
export function bm25Search(index: Bm25Index, query: string, topK: number): [number, number][] {
  const terms = tokenize(query);
  const scores = new Map<number, number>();

  for (const term of terms) {
    const posting = index.postings.get(term);
    if (!posting) continue;

    // Robertson/Sparck-Jones IDF with the +1 that keeps it non-negative for
    // terms appearing in more than half the corpus — without it, common terms
    // in a small corpus actively subtract from the score.
    const df = posting.size;
    const idf = Math.log(1 + (index.docCount - df + 0.5) / (df + 0.5));

    for (const [docIndex, tf] of posting) {
      const len = index.docLengths[docIndex] ?? 0;
      const norm = 1 - B + (B * len) / (index.avgDocLength || 1);
      const contribution = (idf * (tf * (K1 + 1))) / (tf + K1 * norm);
      scores.set(docIndex, (scores.get(docIndex) ?? 0) + contribution);
    }
  }

  return [...scores.entries()]
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK);
}
