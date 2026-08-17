/**
 * Loose architecture sketches drawn on the hero's grid paper — the kind of
 * marks you'd make on engineering paper while arguing about a boundary.
 *
 * Each doodle is inline SVG so the strokes inherit the panel's ink colour and
 * re-tone with the theme. Motion comes from the `.doodle-*` classes in
 * globals.css: every stroke runs the endless self-drawing dash loop (a dash
 * sweeps along the path, completes the stroke, then retreats), over a slow
 * float. Each path declares `pathLength="360"`, so
 * one set of keyframes fits every geometry regardless of its real length. The
 * reduced-motion rule in the base layer collapses all of it.
 *
 * `spot` positions are percentages of the cream panel and are chosen to sit
 * clear of the portrait (centre) and the sticker wall. Below `lg` the whole
 * layer is hidden: there is no free paper on a narrow viewport.
 */

/**
 * Shared stroke setup: round joins, no fill — pen on paper. Width lives in CSS
 * (`.doodle svg :is(path, rect, …)`) rather than here, because `vector-effect`
 * doesn't inherit through a <g>: every shape has to carry it individually or
 * the stroke scales with that doodle's viewBox and the big diagrams come out
 * heavier than the small ones.
 */
const pen = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** Every stroke in a doodle lives under one of these, which drives the sweep. */
function Ink({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <g {...pen} className={className ? `doodle-draw ${className}` : 'doodle-draw'}>
      {children}
    </g>
  );
}

/** Short helper: paths repeat enough that the `pathLength` noise is worth hiding. */
function P({ d, dashed }: { d: string; dashed?: boolean }) {
  // Dashed strokes opt out of the sweep: the draw keyframes animate
  // `stroke-dasharray` themselves, and an animation always beats the attribute,
  // so a swept path cannot also be dashed. These stay drawn and static.
  return (
    <path
      d={d}
      pathLength="360"
      strokeDasharray={dashed ? '4 4' : undefined}
      className={dashed ? 'doodle-static' : undefined}
    />
  );
}

/**
 * The main system sketch: client → edge → gateway → three services behind a
 * trust boundary, fanning into a cache, a store and a queue.
 */
export function SystemTopology() {
  return (
    <svg viewBox="0 0 260 150" className="h-auto w-full" aria-hidden="true">
      <Ink>
        {/* Clients */}
        <rect x="2" y="60" width="34" height="22" rx="3" pathLength="360" />
        <P d="M8 66h10M8 71h16M8 76h6" />
        {/* Edge / CDN */}
        <P d="M36 71h14" />
        <P d="M47 67l4 4-4 4" />
        <P d="M52 60l16 11-16 11z" />
        {/* Gateway: auth + rate limit ticks on the side */}
        <rect x="76" y="54" width="36" height="34" rx="3" pathLength="360" />
        <P d="M68 71h8" />
        <P d="M82 62h24M82 68h24M82 74h16" />
        <P d="M94 88v10" />
        {/* Trust boundary around the services */}
        <rect
          x="124"
          y="8"
          width="72"
          height="134"
          rx="6"
          strokeDasharray="4 4"
          className="doodle-static"
        />
        {/* Three services */}
        <rect x="136" y="18" width="48" height="26" rx="3" pathLength="360" />
        <rect x="136" y="62" width="48" height="26" rx="3" pathLength="360" />
        <rect x="136" y="106" width="48" height="26" rx="3" pathLength="360" />
        <P d="M143 26h14M143 32h22" />
        <P d="M143 70h20M143 76h12" />
        <P d="M143 114h18M143 120h24" />
        {/* Gateway → services */}
        <P d="M112 71h12v-40h12" />
        <P d="M112 71h24" />
        <P d="M112 71h12v48h12" />
        <P d="M131 28l5 3-5 3M131 68l5 3-5 3M131 116l5 3-5 3" />
        {/* Services → cache (rounded), store (cylinder), queue (partitioned) */}
        <rect x="216" y="16" width="40" height="20" rx="10" pathLength="360" />
        <P d="M184 31h32" />
        <ellipse cx="236" cy="66" rx="20" ry="6" pathLength="360" />
        <P d="M216 66v22c0 3.3 9 6 20 6s20-2.7 20-6V66" />
        <P d="M216 77c0 3.3 9 6 20 6s20-2.7 20-6" />
        <P d="M184 75h32" />
        <rect x="216" y="116" width="40" height="18" rx="2" pathLength="360" />
        <P d="M226 116v18M236 116v18M246 116v18" />
        <P d="M184 119h32" />
      </Ink>
    </svg>
  );
}

/**
 * The retrieval pipeline: query → embed → hybrid search over a vector index →
 * rerank → generate, with the eval loop hanging off the answer.
 */
export function RetrievalPipeline() {
  return (
    <svg viewBox="0 0 250 120" className="h-auto w-full" aria-hidden="true">
      <Ink>
        {/* Query */}
        <circle cx="14" cy="40" r="10" pathLength="360" />
        <P d="M24 40h14" />
        {/* Embed */}
        <rect x="38" y="28" width="34" height="24" rx="3" pathLength="360" />
        <P d="M44 40h6M54 36h4M54 44h4M62 40h4" />
        <P d="M72 40h10" />
        {/* Split: lexical + dense */}
        <P d="M82 40h6v-24h10M82 40h6v24h10" />
        <rect x="98" y="4" width="40" height="24" rx="3" pathLength="360" />
        <P d="M104 12h20M104 18h26" />
        {/* Vector index: a little lattice of points */}
        <rect x="98" y="52" width="40" height="30" rx="3" pathLength="360" />
        <circle cx="108" cy="61" r="2" pathLength="360" />
        <circle cx="118" cy="67" r="2" pathLength="360" />
        <circle cx="128" cy="59" r="2" pathLength="360" />
        <circle cx="112" cy="74" r="2" pathLength="360" />
        <circle cx="127" cy="73" r="2" pathLength="360" />
        {/* Fuse */}
        <P d="M138 16h8v20h8M138 67h8V44h8" />
        <circle cx="160" cy="40" r="8" pathLength="360" />
        <P d="M156 40h8M160 36v8" />
        {/* Rerank, then generate */}
        <P d="M168 40h8" />
        <rect x="176" y="26" width="26" height="28" rx="3" pathLength="360" />
        <P d="M181 33h16M181 40h16M181 47h10" />
        <P d="M202 40h8" />
        <rect x="210" y="24" width="36" height="32" rx="8" pathLength="360" />
        <P d="M218 36c4-6 10-6 14 0M218 46h20" />
        {/* Eval loop back to the query */}
        <P d="M228 56v50H14v-56" dashed />
        <P d="M10 54l4-6 4 6" />
        <P d="M96 100h16M120 100h10" />
      </Ink>
    </svg>
  );
}

/**
 * Event backbone: producers → partitioned log → consumer groups, with a
 * dead-letter branch off the failing consumer.
 */
export function EventBackbone() {
  return (
    <svg viewBox="0 0 230 130" className="h-auto w-full" aria-hidden="true">
      <Ink>
        {/* Producers */}
        <rect x="2" y="14" width="30" height="18" rx="3" pathLength="360" />
        <rect x="2" y="44" width="30" height="18" rx="3" pathLength="360" />
        <rect x="2" y="74" width="30" height="18" rx="3" pathLength="360" />
        <P d="M32 23h16v20h6M32 53h22M32 83h16V63h6" />
        <P d="M50 49l6 4-6 4" />
        {/* The log, with offsets marked along it */}
        <rect x="60" y="34" width="86" height="38" rx="3" pathLength="360" />
        <P d="M74 34v38M88 34v38M102 34v38M116 34v38M130 34v38" />
        <P d="M60 82h86" />
        <P d="M64 86v-4M92 86v-4M120 86v-4M144 86v-4" />
        {/* Consumer groups */}
        <P d="M146 43h14v-24h8M146 53h22M146 63h14v24h8" />
        <rect x="168" y="8" width="40" height="22" rx="3" pathLength="360" />
        <rect x="168" y="42" width="40" height="22" rx="3" pathLength="360" />
        <rect x="168" y="76" width="40" height="22" rx="3" pathLength="360" />
        <P d="M174 16h22M174 22h28M174 50h18M174 56h26M174 84h24M174 90h14" />
        {/* Dead letter queue */}
        <P d="M188 98v14h-40" dashed />
        <P d="M152 108l-6 4 6 4" />
        <P d="M110 106h28" />
      </Ink>
    </svg>
  );
}

/** Replicated store — the classic cylinder with a replication edge. */
export function Datastore() {
  return (
    <svg viewBox="0 0 72 76" className="h-auto w-full" aria-hidden="true">
      <Ink>
        <ellipse cx="30" cy="12" rx="22" ry="8" pathLength="360" />
        <P d="M8 12v40c0 4.4 9.8 8 22 8s22-3.6 22-8V12" />
        <P d="M8 26c0 4.4 9.8 8 22 8s22-3.6 22-8" />
        <P d="M8 39c0 4.4 9.8 8 22 8s22-3.6 22-8" />
        <P d="M52 32h16" />
      </Ink>
    </svg>
  );
}

/** A small feed-forward net — the AI mark. */
export function NeuralNet() {
  return (
    <svg viewBox="0 0 110 96" className="h-auto w-full" aria-hidden="true">
      <Ink>
        {[24, 48, 72].map((y) => (
          <circle key={`i${y}`} cx="12" cy={y} r="6" pathLength="360" />
        ))}
        {[14, 38, 62, 86].map((y) => (
          <circle key={`h${y}`} cx="55" cy={y} r="6" pathLength="360" />
        ))}
        {[36, 60].map((y) => (
          <circle key={`o${y}`} cx="98" cy={y} r="6" pathLength="360" />
        ))}
        {[24, 48, 72].map((from) =>
          [14, 38, 62, 86].map((to) => (
            <path key={`${from}-${to}`} d={`M18 ${from}L49 ${to}`} pathLength="360" />
          )),
        )}
        {[14, 38, 62, 86].map((from) =>
          [36, 60].map((to) => (
            <path key={`${from}~${to}`} d={`M61 ${from}L92 ${to}`} pathLength="360" />
          )),
        )}
      </Ink>
    </svg>
  );
}

/** An ADR: status, context, decision, consequences — and an approval stamp. */
export function DecisionRecord() {
  return (
    <svg viewBox="0 0 90 116" className="h-auto w-full" aria-hidden="true">
      <Ink>
        <P d="M6 4h56l22 22v86H6z" />
        <P d="M62 4v22h22" />
        <P d="M16 38h30" />
        <P d="M16 50h20M16 58h52M16 66h44" />
        {/* Options: two rejected, one accepted */}
        <P d="M16 78h6M28 78h30" />
        <P d="M16 88h6M28 88h40" />
        <P d="M15 96l4 4 6-8M28 98h34" />
        {/* Stamp */}
        <circle cx="68" cy="94" r="14" strokeDasharray="3 4" className="doodle-static" />
      </Ink>
    </svg>
  );
}

/** Sequence diagram — lifelines and a round trip with a timeout. */
export function SequenceDiagram() {
  return (
    <svg viewBox="0 0 120 120" className="h-auto w-full" aria-hidden="true">
      <Ink>
        <rect x="2" y="2" width="26" height="14" rx="2" pathLength="360" />
        <rect x="46" y="2" width="26" height="14" rx="2" pathLength="360" />
        <rect x="90" y="2" width="28" height="14" rx="2" pathLength="360" />
        <P d="M15 16v100" dashed />
        <P d="M59 16v100" dashed />
        <P d="M104 16v100" dashed />
        <P d="M15 32h44M55 28l4 4-4 4" />
        <P d="M59 50h45M100 46l4 4-4 4" />
        <P d="M104 70H59M63 66l-4 4 4 4" />
        <P d="M59 88H15M19 84l-4 4 4 4" />
        {/* The timeout box on the second hop */}
        <rect
          x="66"
          y="56"
          width="30"
          height="12"
          rx="2"
          strokeDasharray="4 4"
          className="doodle-static"
        />
      </Ink>
    </svg>
  );
}

/** Commit graph with a branch and a merge — the delivery mark. */
export function CommitGraph() {
  return (
    <svg viewBox="0 0 140 74" className="h-auto w-full" aria-hidden="true">
      <Ink>
        <P d="M6 52h24" />
        <circle cx="34" cy="52" r="5" pathLength="360" />
        <P d="M38 52h20" />
        <circle cx="62" cy="52" r="5" pathLength="360" />
        <P d="M66 52h22" />
        <circle cx="92" cy="52" r="5" pathLength="360" />
        <P d="M96 52h20" />
        <circle cx="120" cy="52" r="5" pathLength="360" />
        {/* Feature branch off the second commit, merged before the last */}
        <P d="M62 47c0-14 6-20 18-20h4" />
        <circle cx="90" cy="27" r="5" pathLength="360" />
        <P d="M94 27h4c14 0 18 6 18 20" />
        <P d="M6 16h20M6 22h12" />
      </Ink>
    </svg>
  );
}

/**
 * Placement. Every box is a percentage of the cream panel — width in `%` with
 * the height following each viewBox — so the layout keeps its proportions at
 * any viewport instead of drifting as `rem` sizes stay fixed against a fluid
 * panel. The boxes are laid out against the fixed furniture (portrait dead
 * centre, bottom-anchored; the five stickers; the rotating seal) so nothing
 * overlaps: the two big diagrams take the left and right halves, the log sits
 * in the lower-left band, and the smaller marks fill the top-centre strip the
 * bottom-anchored portrait leaves open. Sizes are pushed to whatever the
 * neighbouring furniture allows, so moving any one of them — or the portrait,
 * or a sticker — means re-checking the boxes around it.
 */
const doodles = [
  { Mark: SystemTopology, spot: 'left-[20%] top-[5%] w-[23%]', delay: '3s' },
  { Mark: RetrievalPipeline, spot: 'left-[64%] top-[45%] w-[22%]', delay: '0.7s' },
  { Mark: EventBackbone, spot: 'left-[1%] top-[45%] w-[22%]', delay: '1.4s' },
  { Mark: CommitGraph, spot: 'left-[65%] top-[-3%] w-[20%]', delay: '1.8s' },
  { Mark: SequenceDiagram, spot: 'left-[30%] top-[60%] w-[15%]', delay: '2.1s' },
  { Mark: DecisionRecord, spot: 'left-[1%] top-[2%] w-[10%]', delay: '2.6s' },
  { Mark: NeuralNet, spot: 'left-[10%] top-[80%] w-[11%]', delay: '1.1s' },
  { Mark: Datastore, spot: 'left-[65%] top-[80%] w-[8%]', delay: '3s' }
];

export function ArchitectureDoodles() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block z-0">
      {doodles.map(({ Mark, spot, delay }, i) => (
        <div
          key={i}
          // `--d` staggers the draw loop (the stroke keyframes read it) while
          // animationDelay staggers the float, so the layer never sweeps in
          // lockstep — that would read as a UI spinner, not marks on paper.
          style={{ animationDelay: delay, '--d': delay } as React.CSSProperties}
          className={`doodle absolute ${spot}`}
        >
          <Mark />
        </div>
      ))}
    </div>
  );
}
