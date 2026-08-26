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

      {/* ---- Gi: broad, angular, folds drawn as hard wedges ---- */}
      <path
        d="M40 250 Q44 168 78 152 L110 168 L142 152 Q176 168 180 250 Z"
        fill="#fffdf7"
        stroke="#14100e"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* right side in shadow, screentoned */}
      <path d="M110 168 L142 152 Q176 168 180 250 L110 250 Z" fill={`url(#${tone})`} />
      {/* lapels */}
      <path
        d="M78 152 L110 168 L142 152 L128 250 L92 250 Z"
        fill="#f3ece0"
        stroke="#14100e"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M110 168 L142 152 L128 250 L110 250 Z" fill={`url(#${tone})`} />

      {/* ---- Folded arms across the chest ---- */}
      <path
        d="M52 196 Q104 176 168 194 Q170 214 166 222 Q104 202 56 220 Z"
        fill="#fffdf7"
        stroke="#14100e"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M110 187 Q142 189 168 194 Q170 214 166 222 Q140 212 110 205 Z" fill={`url(#${tone})`} />
      {/* sleeve creases */}
      <path d="M74 192 l7 24 M92 187 l5 24" stroke="#14100e" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* hands tucked */}
      <path d="M152 200 q14 4 16 14 q-10 4 -18 -2 z" fill="#f0d3ad" stroke="#14100e" strokeWidth="5" strokeLinejoin="round" />

      {/* ---- Belt: solid black, knotted, ends flicking out ---- */}
      <rect x="60" y="222" width="100" height="20" rx="2" fill="#14100e" />
      <path d="M100 242 l-9 26 M120 242 l10 25" stroke="#14100e" strokeWidth="9" strokeLinecap="round" />

      {/* ---- Head ---- */}
      <path
        d="M110 26 q42 0 42 46 q0 44 -42 44 q-42 0 -42 -44 q0 -46 42 -46 Z"
        fill="#f6dcb8"
        stroke="#14100e"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* cheek shading on the shadow side */}
      <path d="M130 54 q22 6 21 32 q-1 32 -30 33 q26 -30 9 -65 Z" fill={`url(#${tone})`} />

      {/* ---- Eyes: hard angular brows, narrowed, deliberate ---- */}
      <path d="M82 66 L104 74" stroke="#14100e" strokeWidth="8" strokeLinecap="round" />
      <path d="M138 66 L116 74" stroke="#14100e" strokeWidth="8" strokeLinecap="round" />
      <path d="M84 84 q11 -8 22 -1 q-11 6 -22 1 Z" fill="#14100e" />
      <path d="M136 84 q-11 -8 -22 -1 q11 6 22 1 Z" fill="#14100e" />
      {/* a single catchlight in each, which is what stops it reading as a mask */}
      <circle cx="94" cy="82" r="1.7" fill="#fffdf7" />
      <circle cx="126" cy="82" r="1.7" fill="#fffdf7" />

      {/* ---- Moustache and set mouth ---- */}
      <path d="M92 98 q18 10 36 0" stroke="#14100e" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M100 108 q10 5 20 0" stroke="#14100e" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* ---- Headband, tails trailing as though mid-turn ---- */}
      <path d="M64 52 q46 -18 92 0" stroke="#d81f26" strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M64 52 q46 -18 92 0" stroke="#14100e" strokeWidth="3" fill="none" opacity="0.65" />
      <path
        d="M154 50 q30 6 44 -6 q-26 22 -40 20 Z"
        fill="#d81f26"
        stroke="#14100e"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M156 58 q28 16 40 12 q-24 16 -42 0 Z"
        fill="#d81f26"
        stroke="#14100e"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* the sun disc, the one deliberate flat red */}
      <circle cx="110" cy="44" r="9" fill="#d81f26" stroke="#14100e" strokeWidth="3.5" />

      {/* ---- Hair at the temples, brushed in as wedges ---- */}
      <path d="M68 62 q-8 22 2 40 q-12 -16 -6 -42 Z" fill="#14100e" />
      <path d="M152 62 q8 22 -2 40 q12 -16 6 -42 Z" fill="#14100e" />

      {/* Ground shadow, toned rather than soft */}
      <ellipse cx="110" cy="252" rx="62" ry="7" fill={`url(#${toneDark})`} />
    </svg>
  );
}
