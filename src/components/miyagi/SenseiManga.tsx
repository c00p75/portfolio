/**
 * The sensei, drawn for the manga page.
 *
 * The classroom mascot is soft: round strokes, closed eyes, pastel fill. Next to
 * hard ink panels and screentone it reads as a sticker from another site, so
 * this is the same character redrawn to the page's own rules: heavy uneven
 * outlines, screentone instead of flat shading, one red spot colour, and an
 * expression with some steel in it.
 *
 * Inline SVG rather than an asset. It inherits the palette, scales without
 * artefacts, adds nothing to the asset budget, and carries no licence.
 */
export function SenseiManga({
  className = '',
  id = 'sm',
}: {
  className?: string;
  /** Unique per instance: two copies on one page must not share pattern ids. */
  id?: string;
}) {
  const tone = `${id}-tone`;
  const toneDark = `${id}-tone-dark`;

  return (
    <svg
      viewBox="0 0 220 260"
      className={className}
      role="img"
      aria-label="A stern sensei in a black belt, arms folded, headband trailing"
    >
      <defs>
        {/* Screentone. Manga shades with dots, not gradients. */}
        <pattern id={tone} width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1.4" cy="1.4" r="1.15" fill="#14100e" opacity="0.5" />
        </pattern>
        <pattern id={toneDark} width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.2" r="1.35" fill="#14100e" opacity="0.72" />
        </pattern>
      </defs>

      {/* ---- Neck. Short and broad: at this scale a long one reads as a
               stick. Drawn first so the collar covers its base and the head
               covers its top, leaving a shallow visible band. ---- */}
      <path d="M88 104 h44 v44 h-44 Z" fill="#f0d3ad" stroke="#14100e" strokeWidth="6" />
      {/* jaw shadow only. A toned stripe down the neck read as a seam. */}
      <path d="M88 104 h44 v16 q-22 11 -44 0 Z" fill={`url(#${toneDark})`} />

      {/* ---- Gi. One garment path, one centre seam, two sleeve seams.
               The earlier version stroked the collar V twice, once on the gi
               and again on a lapel laid over it, which fused into a black bib.
               The folded arms went the same way: at 56px they read as a lump
               with an ear attached, so the character is carried by the face and
               the headband instead. ---- */}
      <path
        d="M34 252 Q40 152 76 134 L110 160 L144 134 Q180 152 186 252 Z"
        fill="#fffdf7"
        stroke="#14100e"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* shadow side, screentoned rather than filled */}
      <path d="M110 160 L144 134 Q180 152 186 252 L110 252 Z" fill={`url(#${tone})`} />

      {/* Undershirt filling the collar notch. Without it the neck showed past
          the gi's collar edges as a pale floating triangle. */}
      <path
        d="M86 134 L134 134 L110 162 Z"
        fill="#f3ece0"
        stroke="#14100e"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* one centre seam only. A second diagonal crossed it into a T. */}
      <path d="M110 162 L110 252" stroke="#14100e" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* sleeve seams, enough to imply arms without drawing them */}
      <path d="M72 150 q-9 46 -7 102" stroke="#14100e" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M148 150 q9 46 7 102" stroke="#14100e" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* ---- Belt: solid black, ends flicking out ---- */}
      <rect x="52" y="206" width="116" height="22" rx="2" fill="#14100e" />
      <path d="M98 228 l-8 26 M126 228 l9 25" stroke="#14100e" strokeWidth="9" strokeLinecap="round" />

      {/* ---- Head ---- */}
      <path
        d="M110 30 q42 0 42 44 q0 44 -42 44 q-42 0 -42 -44 q0 -44 42 -44 Z"
        fill="#f6dcb8"
        stroke="#14100e"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* screentone on the shadow side of the face */}
      <path d="M128 50 q24 8 23 30 q-1 32 -29 36 q25 -32 6 -66 Z" fill={`url(#${tone})`} />

      {/* ---- Eyes: angular brows, narrowed, deliberate ---- */}
      <path d="M82 66 L104 74" stroke="#14100e" strokeWidth="8" strokeLinecap="round" />
      <path d="M138 66 L116 74" stroke="#14100e" strokeWidth="8" strokeLinecap="round" />
      <path d="M84 84 q11 -8 22 -1 q-11 6 -22 1 Z" fill="#14100e" />
      <path d="M136 84 q-11 -8 -22 -1 q11 6 22 1 Z" fill="#14100e" />
      <circle cx="94" cy="82" r="1.7" fill="#fffdf7" />
      <circle cx="126" cy="82" r="1.7" fill="#fffdf7" />

      {/* ---- Moustache and set mouth ---- */}
      <path d="M92 98 q18 10 36 0" stroke="#14100e" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M101 107 q9 4 18 0" stroke="#14100e" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* ---- Headband, tails trailing as though mid-turn ---- */}
      <path d="M64 52 q46 -18 92 0" stroke="#d81f26" strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M64 52 q46 -18 92 0" stroke="#14100e" strokeWidth="3" fill="none" opacity="0.65" />
      <path d="M154 50 q30 6 44 -6 q-26 22 -40 20 Z" fill="#d81f26" stroke="#14100e" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M156 58 q28 16 40 12 q-24 16 -42 0 Z" fill="#d81f26" stroke="#14100e" strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="110" cy="44" r="9" fill="#d81f26" stroke="#14100e" strokeWidth="3.5" />

      {/* ---- Hair wedges at the temples ---- */}
      <path d="M68 62 q-8 22 2 40 q-12 -16 -6 -42 Z" fill="#14100e" />
      <path d="M152 62 q8 22 -2 40 q12 -16 6 -42 Z" fill="#14100e" />

      {/* Ground shadow, toned rather than soft */}
      <ellipse cx="110" cy="252" rx="62" ry="7" fill={`url(#${toneDark})`} />
    </svg>
  );
}
