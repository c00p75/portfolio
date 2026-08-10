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

function Arrow({ d, label }: { d: string; label?: { x: number; y: number; text: string } }) {
  return (
    <g opacity="0.75">
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.5} markerEnd="url(#bp-arrow)" />
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
          viewBox="0 0 940 330"
          role="img"
          aria-labelledby="bp-retrieval-title bp-retrieval-desc"
          className="h-auto w-full min-w-[46rem]"
        >
          <title id="bp-retrieval-title">Hybrid retrieval and generation pipeline</title>
          <desc id="bp-retrieval-desc">
            A visitor query splits into two parallel retrieval paths. The dense path embeds the
            query with Voyage and scores it by cosine similarity against a build-time vector index.
            The lexical path tokenises the query and scores it with BM25 over the same chunks. The
            two ranked lists are combined with reciprocal rank fusion, the top passages are selected,
            and Claude generates an answer streamed to the browser over server-sent events. A
            telemetry channel on the same stream reports the timing of each stage.
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

          {/* Build-time boundary --------------------------------------- */}
          <rect
            x="16"
            y="18"
            width="220"
            height="120"
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
          <Node x={30} y={48} w={90} h={44} title="MDX" sub="corpus" />
          <Node x={140} y={48} w={84} h={44} title="Chunk" sub="~215 tok" />
          <Node x={30} y={100} w={194} h={30} title="Static vector index" accent="#63d6c6" />
          <Arrow d="M 120 70 L 136 70" />
          <Arrow d="M 182 92 L 158 98" />

          {/* Request boundary ------------------------------------------- */}
          <rect
            x="16"
            y="160"
            width="908"
            height="152"
            rx="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 5"
            opacity="0.3"
          />
          <text x="26" y="178" fill="currentColor" className="font-mono" fontSize="9.5" opacity="0.6">
            REQUEST PATH — runs per query
          </text>

          <Node x={30} y={212} w={104} h={52} title="Query" sub="visitor" />

          {/* Dense path */}
          <Node x={180} y={186} w={126} title="Embed" sub="Voyage · 1024d" accent="#63d6c6" />
          <Node x={330} y={186} w={126} title="Cosine top-k" sub="dense" accent="#63d6c6" />

          {/* Lexical path */}
          <Node x={180} y={252} w={126} title="Tokenise" sub="stem · stop" accent="#f7d91c" />
          <Node x={330} y={252} w={126} title="BM25 top-k" sub="lexical" accent="#f7d91c" />

          <Arrow d="M 134 232 L 176 212" />
          <Arrow d="M 134 244 L 176 272" />
          <Arrow d="M 306 213 L 326 213" />
          <Arrow d="M 306 279 L 326 279" />

          {/* Fusion */}
          <Node x={480} y={219} w={112} title="RRF fusion" sub="rank-based" accent="#ff2e6b" />
          <Arrow d="M 456 213 L 476 236" />
          <Arrow d="M 456 279 L 476 258" />

          <Node x={616} y={219} w={104} title="Top passages" sub="with citations" />
          <Arrow d="M 592 245 L 612 245" />

          <Node x={744} y={219} w={112} title="Claude" sub="streamed" accent="#93cc46" />
          <Arrow d="M 720 245 L 740 245" />

          {/* Fallback edge — the degraded path when embedding fails */}
          <Arrow d="M 243 300 C 243 322, 470 322, 480 262" />
          <text x="360" y="322" textAnchor="middle" fill="currentColor" className="font-mono" fontSize="8.5" opacity="0.55">
            fallback: BM25-only if embedding fails
          </text>

          {/* Output */}
          <Node x={744} y={160} w={112} h={40} title="SSE stream" sub="answer + telemetry" accent="#f5821f" />
          <Arrow d="M 800 219 L 800 204" />
        </svg>
      </div>
      <figcaption className="font-mono text-on-ink-muted mt-4 text-[0.6875rem] leading-relaxed tracking-wide uppercase">
        Fig. 1 — Two retrieval paths, fused by rank rather than score. The dashed edge is the
        degraded mode: lexical retrieval still answers if the embedding call fails.
      </figcaption>
    </figure>
  );
}
