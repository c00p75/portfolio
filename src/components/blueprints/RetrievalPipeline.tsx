/**
 * Data-flow diagram for the retrieval pipeline described in ADR-001.
 *
 * Drawn as inline SVG rather than an image so it inherits the theme's text
 * colour, stays sharp at any zoom, and keeps its labels as real text for
 * search and screen readers.
 */

const BOX = { rx: 6, h: 54 } as const;

function Node({
  x,
  y,
  w = 132,
  h = BOX.h,
  title,
  sub,
  accent,
  dashed,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  title: string;
  sub?: string;
  accent?: string;
  dashed?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={BOX.rx}
        fill={accent ? `${accent}1f` : 'transparent'}
        stroke={accent ?? 'currentColor'}
        strokeWidth={1.5}
        strokeDasharray={dashed ? '5 4' : undefined}
        opacity={accent ? 1 : 0.5}
      />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 3 : y + h / 2 + 4}
        textAnchor="middle"
        fill="currentColor"
        className="font-sans"
        fontSize="12.5"
        fontWeight="600"
      >
        {title}
      </text>
      {sub ? (
        <text
          x={x + w / 2}
          y={y + h / 2 + 14}
          textAnchor="middle"
          fill="currentColor"
          className="font-mono"
          fontSize="9.5"
          opacity="0.62"
        >
          {sub}
        </text>
      ) : null}
    </g>
  );
}

function Arrow({
  d,
  label,
  dashed,
}: {
  d: string;
  label?: { x: number; y: number; text: string };
  /** The degraded path. The caption refers to this, so it has to actually dash. */
  dashed?: boolean;
}) {
  return (
    <g opacity={dashed ? 0.6 : 0.75}>
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeDasharray={dashed ? '5 4' : undefined}
        markerEnd="url(#bp-arrow)"
      />
      {label ? (
        <text
          x={label.x}
          y={label.y}
          textAnchor="middle"
          fill="currentColor"
          className="font-mono"
          fontSize="9"
          opacity="0.7"
        >
          {label.text}
        </text>
      ) : null}
    </g>
  );
}

export function RetrievalPipeline() {
  return (
    <figure className="not-prose">
      <div className="scroll-x">
        <svg
          viewBox="0 0 940 376"
          role="img"
          aria-labelledby="bp-retrieval-title bp-retrieval-desc"
          className="h-auto w-full min-w-[46rem]"
        >
          <title id="bp-retrieval-title">Hybrid retrieval and generation pipeline</title>
          <desc id="bp-retrieval-desc">
            At deploy time the MDX corpus is chunked, each chunk is embedded with Voyage, and the
            result is written to a static index that ships with the build and is loaded into memory
            on cold start. Per request, a visitor query splits into two parallel retrieval paths
            that read that same index. The dense path embeds the query and scores it by cosine
            similarity; the lexical path tokenises the query and scores it with BM25 over the same
            chunks. The two ranked lists are combined with reciprocal rank fusion, the top passages
            are selected, and the first available model provider in an ordered chain generates an
            answer, streamed to the browser over server-sent events. A dashed edge shows the
            degraded path: if the query embedding fails, the BM25 ranking alone feeds fusion. A
            telemetry channel on the same stream reports the timing of each stage and which
            provider served the answer.
          </desc>

          <defs>
            <marker
              id="bp-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>

          {/*
           * Colour carries one meaning only: teal is the dense/vector path,
           * yellow is the lexical path. Fusion, generation and the stream are
           * left uncoloured — an extra hue there just invites the reader to
           * hunt for a distinction that does not exist.
           */}

          {/* Build-time boundary --------------------------------------- */}
          <rect
            x="16"
            y="18"
            width="300"
            height="132"
            rx="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 5"
            opacity="0.3"
          />
          <text x="26" y="36" fill="currentColor" className="font-mono" fontSize="9.5" opacity="0.6">
            BUILD TIME — runs on deploy
          </text>
          <Node x={30} y={48} w={80} h={44} title="MDX" sub="corpus" />
          <Node x={126} y={48} w={80} h={44} title="Chunk" sub="~215 tok" />
          {/* The corpus embed. Without it the index below appears from nowhere,
              and it is the expensive half of the whole pipeline. */}
          <Node x={222} y={48} w={80} h={44} title="Embed" sub="corpus" accent="#63d6c6" />
          <Node x={30} y={108} w={272} h={30} title="Static vector index" accent="#63d6c6" />
          <Arrow d="M 110 70 L 122 70" />
          <Arrow d="M 206 70 L 218 70" />
          <Arrow d="M 262 92 L 262 104" />

          {/* Request boundary ------------------------------------------- */}
          <rect
            x="16"
            y="178"
            width="908"
            height="168"
            rx="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 5"
            opacity="0.3"
          />
          <text x="26" y="196" fill="currentColor" className="font-mono" fontSize="9.5" opacity="0.6">
            REQUEST PATH — runs per query
          </text>

          {/* The link the diagram was missing: the artefact built on deploy is
              what the request path scores against. */}
          <Arrow d="M 302 120 C 344 128, 372 166, 392 209" />
          {/* Right-aligned and clear of the curve it labels — centred on the
              path put the text underneath the stroke. */}
          <text x="322" y="170" textAnchor="end" fill="currentColor" className="font-mono" fontSize="8.5" opacity="0.55">
            loaded on cold start
          </text>

          <Node x={30} y={247} w={104} h={52} title="Query" sub="visitor" />

          {/* Dense path */}
          <Node x={180} y={213} w={126} title="Embed" sub="query · 1024d" accent="#63d6c6" />
          <Node x={330} y={213} w={126} title="Cosine top-k" sub="dense" accent="#63d6c6" />

          {/* Lexical path */}
          <Node x={180} y={279} w={126} title="Tokenise" sub="stem · stop" accent="#f7d91c" />
          <Node x={330} y={279} w={126} title="BM25 top-k" sub="same chunks" accent="#f7d91c" />

          <Arrow d="M 134 262 L 176 245" />
          <Arrow d="M 134 284 L 176 301" />
          <Arrow d="M 306 240 L 326 240" />
          <Arrow d="M 306 306 L 326 306" />

          {/* Fusion */}
          <Node x={480} y={246} w={112} title="RRF fusion" sub="rank-based" />
          <Arrow d="M 456 240 L 476 262" />
          <Arrow d="M 456 306 L 476 284" />

          <Node x={616} y={246} w={104} title="Top passages" sub="with citations" />
          <Arrow d="M 592 273 L 612 273" />

          <Node x={744} y={246} w={112} title="Generation" sub="first of chain" />
          <Arrow d="M 720 273 L 740 273" />

          {/* Degraded path. Anchored to BM25, not to Tokenise: what survives a
              failed query embedding is the finished lexical ranking. */}
          <Arrow dashed d="M 393 333 C 393 348, 462 350, 498 306" />
          <text x="446" y="368" textAnchor="middle" fill="currentColor" className="font-mono" fontSize="8.5" opacity="0.55">
            fallback: BM25-only if the query embedding fails
          </text>

          {/* Output */}
          <Node x={744} y={190} w={112} h={40} title="SSE stream" sub="answer + telemetry" />
          <Arrow d="M 800 246 L 800 234" />
        </svg>
      </div>
      <figcaption className="font-mono text-on-ink-muted mt-4 text-[0.6875rem] leading-relaxed tracking-wide uppercase">
        Fig. 1 — The index is built on deploy and read on every request. Two retrieval paths score
        against it — teal is dense, yellow is lexical — and are fused by rank rather than score.
        The dashed edge is the degraded mode: the BM25 ranking alone answers if the query embedding
        fails.
      </figcaption>
    </figure>
  );
}
