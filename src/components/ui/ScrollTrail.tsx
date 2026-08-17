'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

/**
 * A paper craft that travels down a page as you scroll, drawing its trail
 * behind it — the effect from the Ballo Innovations about page, rebuilt
 * without GSAP.
 *
 * Ballo does this with ScrollTrigger + MotionPathPlugin, and reveals the trail
 * by scrubbing the SVG's width from 0. Two reasons not to port it literally:
 * GSAP with both plugins is ~70KB for a decoration on a site with no animation
 * dependency at all, and a width scrub reveals the line by clipping rather
 * than drawing it, so its leading edge is a vertical wipe instead of the
 * craft's nose.
 *
 * Native: `getPointAtLength` for position, a sample just ahead for heading,
 * and `stroke-dashoffset` for the trail — so the line is genuinely drawn to
 * exactly where the craft is.
 */

/**
 * The route, as waypoints the craft passes through — not Bézier control
 * points. Hand-placed control points make every join a potential kink: two
 * curves meeting at a shared point still jerk unless their handles are
 * collinear. These are anchors; the handles are derived below, so the whole
 * run is tangent-continuous.
 *
 * Coordinates are fractions of the trail box, so a route keeps its shape at
 * any page length.
 */
export type Waypoint = { x: number; y: number; loop?: boolean };

/**
 * How the craft carries itself.
 *
 * `fly` turns to face the direction of travel, banks into corners, and can
 * fly loops. `sail` stays upright and rocks: a boat that pitched over to
 * follow a descending path — let alone inverted through a loop — would read
 * as a shipwreck, so heading is deliberately ignored.
 *
 * `roll` spins by distance covered rather than by a clock, so the ball turns
 * exactly once per circumference travelled — rolling without slipping. Get that
 * wrong in either direction and it reads as a ball skidding.
 */
export type TrailMotion = 'fly' | 'sail' | 'walk' | 'roll';

/**
 * One frame of a walk cycle.
 *
 * `heightScale` and `bottomGap` exist because the three robot exports are not
 * consistently cropped: their content boxes are 679, 698 and 640px tall inside
 * images of 701 and 769px, with different amounts of empty space beneath the
 * feet. Rendered naively at one width the robot would change size and hop
 * between frames. Both numbers are expressed relative to the frame's own
 * content height, so the component can scale every frame to a common content
 * height and drop each one so its feet land on the same line.
 */
export type WalkFrame = {
  src: string;
  width: number;
  height: number;
  /** imageHeight / contentHeight. */
  heightScale: number;
  /** Empty pixels below the content, over contentHeight. */
  bottomGap: number;
};

/** Pixels of travel between frame changes. Roughly one pace. */
const STRIDE = 34;

/**
 * Frame order while moving: left contact, right contact. The standing pose is
 * deliberately not in the cycle — it means "stopped", and putting it between
 * steps would read as the robot hesitating on every stride.
 */
const WALK_CYCLE = [1, 2] as const;

/** Change in progress below which a single update counts as no movement. */
const STILL = 1e-5;

/**
 * How long after the last movement the craft still counts as moving, in ms.
 *
 * Scroll events and animation frames do not line up: at any given frame the
 * head may not have advanced even though the reader is very much still
 * scrolling. Testing the instantaneous delta therefore flickers the walk
 * cycle back to standing between steps; a short grace window is what makes
 * "moving" mean what a reader means by it.
 */
const MOVE_GRACE = 160;

/** Cubic approximation constant for a 90° arc: (4/3)·tan(45°/2). */
const ARC_K = 0.5522847498;

/** Loop radius in pixels, so every loop is the same size on screen. */
const LOOP_RADIUS = 78;

/**
 * Degrees of heading change (over the lookahead below) that count as a loop
 * rather than a turn. Gentle curves move a few degrees; loops turn twenty-odd.
 */
const LOOP_TURN = 11;

/**
 * The trail is drawn as a run of short sub-paths rather than one stroke, which
 * is the only way to fade a line along its own length when that line bends:
 * an SVG gradient runs in a fixed direction, so on a meandering path it would
 * fade by position on the page instead of by distance behind the craft.
 */
const SEGMENTS = 8;

/** Longest the trail gets, as a fraction of the whole route. */
const MAX_TRAIL = 0.13;

/**
 * Time constant for the tail catching the craft up, in seconds. While the
 * reader scrolls, the head outruns this and the trail sits at `MAX_TRAIL`;
 * when they stop, the head stops and the tail closes the gap — the contrail
 * dispersing behind an aircraft that has passed.
 */
const CATCH_UP_TAU = 0.62;

/**
 * How many footprints a walker leaves behind. One per stride, so this only
 * has to cover `MAX_TRAIL` of the longest page the component runs on; any
 * spare marks simply stay hidden.
 */
const PRINTS = 26;

/**
 * How far the reader has to scroll before the craft lets go of its berth.
 *
 * The drop is triggered, not scrubbed. Scrubbing it against scroll position —
 * which is what this did — means every scroll pause leaves the craft frozen
 * halfway down, hanging in mid-air with nothing holding it up. A fall is not a
 * thing you can be partway through and stationary: either it is up, or it is
 * falling, or it has landed.
 */
const DROP_TRIGGER = 0.012;

/**
 * Seconds the fall itself takes, once triggered. Short on purpose: the craft
 * covers most of a screen height, and anything slower reads as lowering rather
 * than dropping — the acceleration curve cannot sell weight on its own if the
 * whole fall lasts longer than a real one would.
 */
const DROP_SECONDS = 0.42;

/** Seconds to return to the berth when the reader scrolls back up. */
const RISE_SECONDS = 0.34;

/**
 * The impact. A hull hitting water does not settle in one motion — it slaps,
 * rings, and damps out fast. This is deliberately shorter, faster and harsher
 * than the swell the boat rides afterwards: a fraction of a second of real
 * shake is what sells the fall as having had weight behind it.
 */
const SHAKE_SECONDS = 0.55;

/** Peak roll of the impact shake, in degrees, before damping. */
const SHAKE_DEG = 15;

/** Oscillations per second. High enough to read as a judder, not a rock. */
const SHAKE_HZ = 9.5;

/** Peak vertical judder of the impact, in pixels. */
const SHAKE_LIFT = 6;

/**
 * Droplets thrown up by the landing, as offsets in rem from the point of
 * impact. Hand-placed rather than generated: a splash is not symmetrical, and
 * an even spread reads as a decoration. Negative `dy` is upward.
 */
const SPLASH_DROPS = [
  { dx: -2.6, dy: -1.5, delay: 0 },
  { dx: -1.5, dy: -2.2, delay: 0.02 },
  { dx: -0.6, dy: -1.7, delay: 0 },
  { dx: 0.7, dy: -2.4, delay: 0.03 },
  { dx: 1.6, dy: -1.6, delay: 0.01 },
  { dx: 2.4, dy: -2.1, delay: 0.04 },
  { dx: 3.2, dy: -1.1, delay: 0.02 },
] as const;

/** Share of the intro spent falling; the rest is the landing. */
const DROP_FALL = 0.78;

/** Height of the first rebound after the craft lands, in pixels. */
const DROP_BOUNCE = 24;

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

/**
 * Catmull-Rom handles, which is what makes the run smooth: each anchor's
 * outgoing handle points along the line between its neighbours, so incoming
 * and outgoing tangents match exactly at every join.
 */
function handles(prev: number[], a: number[], b: number[], next: number[]) {
  return [
    [a[0]! + (b[0]! - prev[0]!) / 6, a[1]! + (b[1]! - prev[1]!) / 6],
    [b[0]! - (next[0]! - a[0]!) / 6, b[1]! - (next[1]! - a[1]!) / 6],
  ];
}

/**
 * A full circle starting at `p`, entered along `tangent`, as four cubic arcs.
 * It ends where it began travelling the same way, so the glide either side is
 * undisturbed — a loop splices into a smooth path without breaking it.
 */
function loopAt(p: number[], tangent: number[], r: number) {
  const len = Math.hypot(tangent[0]!, tangent[1]!) || 1;
  const t = [tangent[0]! / len, tangent[1]! / len];
  // Centre sits 90° off the direction of travel; on screen (y down) that is
  // (-ty, tx), which puts the loop below a craft heading right.
  const c = [p[0]! + r * -t[1]!, p[1]! + r * t[0]!];
  const start = Math.atan2(p[1]! - c[1]!, p[0]! - c[0]!);

  let d = '';
  for (let i = 0; i < 4; i += 1) {
    const a0 = start + (i * Math.PI) / 2;
    const a1 = a0 + Math.PI / 2;
    const p0 = [c[0]! + r * Math.cos(a0), c[1]! + r * Math.sin(a0)];
    const p1 = [c[0]! + r * Math.cos(a1), c[1]! + r * Math.sin(a1)];
    const c1 = [p0[0]! - ARC_K * r * Math.sin(a0), p0[1]! + ARC_K * r * Math.cos(a0)];
    const c2 = [p1[0]! + ARC_K * r * Math.sin(a1), p1[1]! - ARC_K * r * Math.cos(a1)];
    d += ` C ${c1[0]!.toFixed(1)} ${c1[1]!.toFixed(1)}, ${c2[0]!.toFixed(1)} ${c2[1]!.toFixed(1)}, ${p1[0]!.toFixed(1)} ${p1[1]!.toFixed(1)}`;
  }
  return d;
}

/**
 * A stretch of the page the craft should keep to one side of, so it is not
 * crossing the column while the reader is trying to read it.
 *
 * Given as an element id rather than as y fractions, because the fractions
 * that line up with a section today stop lining up the moment its content
 * changes length — and this route is shared by a page whose sections are
 * generated from content files.
 */
export type Pin = {
  id: string;
  x: number;
  /**
   * Which way the craft should face for the pinned stretch.
   *
   * Needed because facing is normally read from the direction of travel, and a
   * pinned run has none — it holds one `x`, so the craft simply keeps whatever
   * heading it arrived with, which is a coin toss decided by the waypoint
   * before the section.
   */
  face?: 'left' | 'right';
};

/** A resolved pin: the span it holds, in pixels down the trail box. */
type PinSpan = { from: number; to: number; face: 'left' | 'right' };

/**
 * Rewrite the route so it holds at `pin.x` for the vertical span of each
 * pinned element.
 *
 * Waypoints inside the span are dropped and replaced with held ones, and the
 * held run is entered and left one waypoint early on each side. Without that
 * lead-in the spline would still be swinging across the page as it arrived and
 * would bulge back over the column — Catmull-Rom handles are derived from the
 * neighbours, so a point's position is not enough to control its tangent.
 */
function applyPins(route: Waypoint[], pins: Pin[], root: HTMLElement, h: number) {
  const spans: PinSpan[] = [];
  if (!pins.length || !h) return { route, spans };
  const rootTop = root.getBoundingClientRect().top + window.scrollY;
  let out = route;

  for (const pin of pins) {
    const el = document.getElementById(pin.id);
    if (!el) continue;
    const box = el.getBoundingClientRect();
    const y0 = (box.top + window.scrollY - rootTop) / h;
    const y1 = (box.bottom + window.scrollY - rootTop) / h;
    if (y1 <= 0 || y0 >= 1 || y1 <= y0) continue;

    // A lead of roughly one waypoint's worth of page, so the approach is
    // already tracking the pinned side before the section begins.
    const lead = Math.min(0.05, (y1 - y0) / 2);
    const from = Math.max(0, y0 - lead);
    const to = Math.min(1, y1 + lead);

    out = [
      ...out.filter((p) => p.y < from),
      { x: pin.x, y: from },
      { x: pin.x, y: (from + to) / 2 },
      { x: pin.x, y: to },
      ...out.filter((p) => p.y > to),
    ];

    // Kept in pixels, matching the units the craft's sampled position comes
    // back in, so the facing test is a plain comparison per frame.
    if (pin.face) spans.push({ from: from * h, to: to * h, face: pin.face });
  }

  return { route: out, spans };
}

/** Build the whole route in pixels: smooth spline, with loops spliced in. */
function buildPath(route: Waypoint[], w: number, h: number) {
  const pts = route.map((p) => [p.x * w, p.y * h]);
  const get = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))]!;

  let d = `M ${get(0)[0]!.toFixed(1)} ${get(0)[1]!.toFixed(1)}`;

  for (let i = 0; i < pts.length - 1; i += 1) {
    const [c1, c2] = handles(get(i - 1), get(i), get(i + 1), get(i + 2));
    d += ` C ${c1![0]!.toFixed(1)} ${c1![1]!.toFixed(1)}, ${c2![0]!.toFixed(1)} ${c2![1]!.toFixed(1)}, ${get(i + 1)[0]!.toFixed(1)} ${get(i + 1)[1]!.toFixed(1)}`;

    if (route[i + 1]?.loop) {
      const p = get(i + 1);
      d += loopAt(p, [(get(i + 2)[0]! - get(i)[0]!) / 2, (get(i + 2)[1]! - get(i)[1]!) / 2], LOOP_RADIUS);
    }
  }

  return d;
}

/**
 * Scroll progress remapped so the craft does not travel at a constant rate.
 *
 * Each term is a sine whose amplitude is divided by its own frequency, making
 * the derivative `1 + Σ aᵢ·cos(…)`. Keeping `Σ|aᵢ| < 1` therefore keeps it
 * strictly increasing — it surges and eases but never stalls or reverses,
 * whichever way the page is scrolled. Integer frequencies land the curve back
 * on 0 and 1, so the ends still line up with the top and bottom of the page.
 */
function paceRaw(p: number) {
  const a1 = 0.3;
  const a2 = 0.16;
  return (
    p +
    (a1 / (2 * Math.PI * 2)) * Math.sin(2 * Math.PI * 2 * p) +
    (a2 / (2 * Math.PI * 3)) * Math.sin(2 * Math.PI * 3 * p + 1.1)
  );
}

/**
 * The second term carries a phase offset, so the raw curve does not start at
 * zero. Both ends are off by the same amount — integer frequencies see to
 * that — so subtracting the value at zero lands it exactly on 0 and 1 without
 * touching the shape between.
 */
const PACE_AT_ZERO = paceRaw(0);

function pace(p: number) {
  return paceRaw(p) - PACE_AT_ZERO;
}

export function ScrollTrail({
  route,
  motion,
  sprite,
  pins,
  className,
}: {
  route: Waypoint[];
  motion: TrailMotion;
  /** Sections to hold to one side of, measured at layout. */
  pins?: Pin[];
  sprite: {
    src?: string;
    width?: number;
    height?: number;
    /** Tailwind width for the rendered sprite, e.g. `w-14`. */
    sizeClass?: string;
    /**
     * `fly` only: the sprite's own nose angle, where 0° is pointing right.
     * Swapping artwork means changing this and nothing else.
     */
    noseOffset?: number;
    alt?: string;
    /** `walk` only: [pass, leftContact, rightContact]. */
    frames?: WalkFrame[];
    /** `walk` only: the height every frame's content is scaled to, in px. */
    contentHeight?: number;
    /**
     * `roll` only: the ball's rendered diameter in px, which sets how far it
     * travels per turn. Must match `sizeClass` or the spin will look like a
     * skid.
     */
    rollDiameter?: number;
    /**
     * Start the craft at its full laid-out size and shrink it to 1/`scale` of
     * that over the opening stretch of the route, so it can double as a page's
     * hero image instead of being a second copy of the same artwork.
     *
     * `sizeClass` must therefore be the *hero* size, not the travelling size.
     * That is not a detail: a composited layer is rasterised at its layout
     * size, so scaling one up blurs it no matter how large the source file is.
     * Laying it out big and only ever scaling down keeps every size sharp.
     */
    intro?: { scale: number; until: number };
    /**
     * Grow back up over the closing stretch of the route, from this fraction of
     * it onwards. Requires `intro`, since that is where the hero size is
     * declared — and because the element is laid out at hero size, the return
     * leg is still only ever scaling down from it.
     *
     * `scale` is the size to arrive at, in the same units as `intro.scale`, and
     * defaults to it. Coming back to a little under the opening size is usually
     * the better read: the same size exactly invites the comparison and makes
     * the arrival look like a reset rather than an ending.
     */
    outro?: { from: number; scale?: number };
    /**
     * Grow toward the reader over the closing stretch, without the hero drop
     * `intro`/`outro` imply — the craft simply walks nearer as the page ends.
     *
     * Same rasterisation rule as `intro`: the sprite is laid out at its
     * *arrival* size and travels at `1/scale` of it, so the whole run is a
     * scale-down and never blurs. `contentHeight` (or `sizeClass`) must
     * therefore be the arrival size, not the travelling one.
     */
    grow?: { from: number; scale: number };
  };
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathsRef = useRef<(SVGPathElement | null)[]>([]);
  /** Footprints (ellipses) or wake arcs (paths), depending on the motion. */
  const printsRef = useRef<(SVGGraphicsElement | null)[]>([]);
  const craftRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const wakeRef = useRef<HTMLSpanElement>(null);
  /** The element carrying the idle float, so it can be held off until landing. */
  const floatRef = useRef<HTMLDivElement>(null);
  const splashRef = useRef<HTMLSpanElement>(null);
  const framesRef = useRef<(HTMLElement | null)[]>([]);
  /** Which walk frame is showing, so we only touch the DOM when it changes. */
  const frameShown = useRef(-1);
  const frame = useRef(0);
  /** Mirror state, held across frames so a loop cannot toggle it. */
  const flipRef = useRef(false);
  /**
   * `roll` only: accumulated spin in degrees, and where it was last measured.
   * The angle has to be integrated rather than computed from the absolute
   * distance: the sign depends on which way the route is heading, so a
   * closed-form angle would jump every time the ball rounded a bend.
   */
  const spinRef = useRef(0);
  const lastHereRef = useRef<number | null>(null);

  /** The sprite's own nose angle. Also aims the airflow, below. */
  const nose = sprite.noseOffset ?? 0;
  const frames = sprite.frames ?? [];
  /* A walker leaves footprints, not vapour. */
  const prints = motion === 'walk';
  const marks = prints;
  /*
   * Neither a rolling ball nor a boat leaves anything behind.
   *
   * The ball has no real-world equivalent to draw — a line behind it just reads
   * as the ball dragging a pen. The boat did have one, and it was drawn as
   * spreading arcs rather than a stroke, but the hull already carries its own
   * rings: two wakes competing for the same idea, with the trailing one adding
   * clutter down the length of the page for no gain.
   */
  const trailless = motion === 'roll' || motion === 'sail';
  const contentHeight = sprite.contentHeight ?? 96;
  const intro = sprite.intro;
  const outro = sprite.outro;
  /**
   * How far through the drop the craft is, 0 (berthed) to 1 (landed). Advanced
   * on a clock by the animation loop rather than read from scroll, so the fall
   * always completes once it starts.
   */
  const dropRef = useRef(0);
  /** When the craft last touched down, for the impact shake. Null if it has not. */
  const landedAtRef = useRef<number | null>(null);
  const grow = sprite.grow;
  const rollDiameter = sprite.rollDiameter ?? 56;
  /** Pinned spans that dictate a facing, measured on layout. */
  const pinSpansRef = useRef<PinSpan[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    /** Rebuild the path in pixels. Called on mount and on every resize. */
    const layout = () => {
      const root = rootRef.current;
      const svg = svgRef.current;
      if (!root || !svg) return;
      const { width, height } = root.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      // Every segment carries the whole route; each one just exposes a
      // different window of it through its dash pattern.
      const pinned = applyPins(route, pins ?? [], root, height);
      pinSpansRef.current = pinned.spans;
      const d = buildPath(pinned.route, width, height);
      for (const path of pathsRef.current) path?.setAttribute('d', d);
    };

    /**
     * Footprints, one per stride behind the walker, fading with distance.
     *
     * They use the same `tail`..`head` window as the drawn trails, so they
     * inherit the same behaviour: a full set while the reader scrolls, and a
     * set that empties from the back as the tail catches up once they stop.
     * Left and right alternate by stride index, matching the frame the robot
     * is showing, and each print sits a few pixels off the centre line on its
     * own side.
     */
    const paintMarks = (head: number, tail: number) => {
      const path = pathsRef.current[0];
      if (!path) return;
      const total = path.getTotalLength();
      if (!total) return;

      const headPx = head * total;
      const tailPx = tail * total;
      const window = Math.max(1, headPx - tailPx);
      const spacing = STRIDE;

      for (let i = 0; i < PRINTS; i += 1) {
        const mark = printsRef.current[i];
        if (!mark) continue;

        // Snapped to a fixed grid so marks stay put on the ground — or the
        // water — as the craft advances, instead of sliding along with it.
        const stride = Math.floor(headPx / spacing) - i;
        const dist = stride * spacing;

        if (stride < 0 || dist < tailPx) {
          mark.style.opacity = '0';
          continue;
        }

        const at = path.getPointAtLength(dist);
        const ahead = path.getPointAtLength(Math.min(total, dist + 6));
        const dx = ahead.x - at.x;
        const dy = ahead.y - at.y;
        const len = Math.hypot(dx, dy) || 1;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        /** 0 at the craft, 1 at the far end of the trail. */
        const age = (headPx - dist) / window;

        // Offset to one side of the centre line; which side alternates with
        // the stride, so the tracks read as two feet rather than one.
        const side = stride % 2 === 0 ? 1 : -1;
        const ox = (-dy / len) * 4.5 * side;
        const oy = (dx / len) * 4.5 * side;
        mark.setAttribute(
          'transform',
          `translate(${(at.x + ox).toFixed(1)} ${(at.y + oy).toFixed(1)}) rotate(${angle.toFixed(1)})`,
        );
        mark.style.opacity = String(0.42 * Math.pow(1 - age, 1.3));
      }
    };

    /**
     * Paint the visible stretch of trail between `tail` and `head`, split into
     * segments that fade toward the far end. Each segment shows its slice
     * through a one-dash pattern: the gap of 1 guarantees the pattern cannot
     * repeat inside the path, and a negative offset slides the dash to where
     * the slice starts.
     */
    const paintTrail = (head: number, tail: number) => {
      if (trailless) return;
      if (marks) return paintMarks(head, tail);
      const span = head - tail;
      for (let i = 0; i < SEGMENTS; i += 1) {
        const path = pathsRef.current[i];
        if (!path) continue;
        const f0 = i / SEGMENTS;
        const f1 = (i + 1) / SEGMENTS;
        const a = tail + span * f0;
        const b = tail + span * f1;
        const length = Math.abs(b - a);
        path.style.strokeDasharray = `${length} 1`;
        path.style.strokeDashoffset = `${-Math.min(a, b)}`;
        // `f1` is how close this slice sits to the craft, so the ramp fades
        // with distance behind it rather than with position on the page.
        path.style.opacity = String(0.5 * Math.pow(f1, 1.8));
      }
    };

    const positionCraft = (progress: number, moving: boolean) => {
      const path = pathsRef.current[0];
      const craft = craftRef.current;
      if (!path || !craft) return;

      // Path units are screen pixels, so the sampled point needs no conversion
      // and the dash and the craft read the same parameterisation.
      const total = path.getTotalLength();
      if (!total) return;
      /*
       * Once it has landed the craft never goes back above its landing point
       * while it is still down: the reader can stop just past the trigger, so
       * the raw progress at that moment still maps to the berth, and following
       * it would yank the boat back up the instant it touched down.
       */
      const along = intro && dropRef.current >= 1 ? Math.max(progress, intro.until) : progress;
      const here = along * total;
      let at = path.getPointAtLength(here);
      let squash = 0;

      /*
       * The intro is a drop, not a glide: the craft falls from its hero berth
       * to the point where it starts travelling, the same way the About page's
       * blocks land. Free fall is `y ∝ t²` — real gravity, accelerating rather
       * than easing out — and the last stretch is the landing: a couple of
       * decaying rebounds with a squash on first contact.
       *
       * Both ends are points on the route, so when the drop finishes the craft
       * is exactly where normal path-following expects it to be.
       */
      /** In the middle of the drop: not on the route, and not yet on water. */
      const airborne = !!intro && dropRef.current > 0 && dropRef.current < 1;
      /**
       * Actually on the water. Everything that means "floating" — the wake,
       * the idle bob — is gated on this, so none of it plays while the craft
       * is still berthed or still falling.
       */
      const afloat = !intro || dropRef.current >= 1;

      if (intro && dropRef.current < 1) {
        const t = dropRef.current;
        const from = path.getPointAtLength(0);
        const to = path.getPointAtLength(intro.until * total);

        if (t < DROP_FALL) {
          const u = t / DROP_FALL;
          at = {
            // Drifts across on a smooth curve while gravity does the rest.
            x: from.x + (to.x - from.x) * (u * u * (3 - 2 * u)),
            y: from.y + (to.y - from.y) * (u * u),
          } as DOMPoint;
        } else {
          const b = (t - DROP_FALL) / (1 - DROP_FALL);
          const decay = (1 - b) * (1 - b);
          at = {
            x: to.x,
            y: to.y - DROP_BOUNCE * Math.abs(Math.sin(b * Math.PI * 2.2)) * decay,
          } as DOMPoint;
          squash = Math.max(0, 1 - b * 5) * decay;
        }
      }

      // A slow breath in and out of the page, so it is not perfectly flat
      // against the background.
      let scale = 0.9 + 0.16 * Math.sin(progress * Math.PI * 2.5 + 0.6);

      /**
       * How close the craft is to its hero size: 1 in the berth, 0 travelling.
       * Read further down by the wake, which has to be far fainter at hero
       * scale than it is on the travelling boat.
       */
      let heroness = 0;

      if (intro) {
        // Smoothstep rather than a straight ramp: the shrink should ease out
        // of its resting size and settle, not start and stop abruptly.
        // Normalised by `intro.scale` so this runs 1 → 1/scale: the element is
        // laid out at hero size and only ever scaled down from it.
        // Driven by the drop clock, not by scroll, so the shrink and the fall
        // are the same single event.
        const t = dropRef.current;
        let ramp = intro.scale + (1 - intro.scale) * (t * t * (3 - 2 * t));

        /*
         * The return leg. The craft grows back to the size it opened at over
         * the closing stretch, so the route reads as an arrival rather than the
         * craft simply running out of page at thumbnail size. Same smoothstep,
         * same size — this is the intro ramp run backwards.
         */
        if (outro && progress > outro.from) {
          const target = outro.scale ?? intro.scale;
          const u = clamp01((progress - outro.from) / (1 - outro.from));
          ramp = 1 + (target - 1) * (u * u * (3 - 2 * u));
        }

        scale *= ramp / intro.scale;
        heroness = clamp01((ramp - 1) / (intro.scale - 1));
      } else if (grow) {
        /*
         * Walking nearer. The element is laid out at the arrival size, so this
         * runs 1/scale → 1: small for the length of the page, easing up over
         * the closing stretch. Smoothstep so the approach starts and settles
         * gently rather than switching on.
         */
        const u = clamp01((progress - grow.from) / Math.max(1e-6, 1 - grow.from));
        scale *= (1 + (grow.scale - 1) * (u * u * (3 - 2 * u))) / grow.scale;
      }

      let orientation: string;
      /** `sail` only: the hull's tilt, which the wake has to cancel out. */
      let rock = 0;

      /*
       * The impact shake, as a fraction of full violence: 1 at the instant of
       * contact, 0 once it has rung out. Squared so it collapses fast — a hull
       * that damped linearly would look like it was bobbing, not recovering.
       */
      let impact = 0;
      if (landedAtRef.current !== null) {
        const elapsed = (performance.now() - landedAtRef.current) / 1000;
        if (elapsed < SHAKE_SECONDS) {
          const remaining = 1 - elapsed / SHAKE_SECONDS;
          impact = remaining * remaining;
        }
      }
      /** Phase of the judder. Shared by the roll and the lift below. */
      const impactPhase =
        landedAtRef.current === null
          ? 0
          : ((performance.now() - landedAtRef.current) / 1000) * Math.PI * 2 * SHAKE_HZ;

      if (motion === 'walk') {
        /*
         * The frame is chosen by distance covered, never by a timer: legs that
         * keep moving while the page is still are the giveaway that a walk
         * cycle is on the wrong clock. `here` is already in pixels along the
         * route, so one stride is simply a fixed number of those.
         */
        const step = Math.floor(here / STRIDE) % WALK_CYCLE.length;
        // Frame 0 is the standing pose, used only when the page is still.
        const wanted = moving
          ? WALK_CYCLE[(step + WALK_CYCLE.length) % WALK_CYCLE.length]!
          : 0;
        if (wanted !== frameShown.current) {
          frameShown.current = wanted;
          framesRef.current.forEach((el, i) => {
            if (el) el.style.opacity = i === wanted ? '1' : '0';
          });
        }

        /*
         * Which way it is walking. The sprite is drawn facing left, so the
         * mirror goes on when the route carries it right — the same rule the
         * boat uses. Read over a long lookahead and ignored below a few
         * pixels, so a near-vertical stretch cannot spin it on the spot.
         */
        const ahead = path.getPointAtLength(Math.min(total, here + 40));
        if (Math.abs(ahead.x - at.x) > 4) flipRef.current = ahead.x > at.x;

        // A small bounce, in step with the cycle rather than free-running: the
        // body rises as it passes over the planted foot.
        const bob = moving ? Math.abs(Math.sin((here / STRIDE) * Math.PI)) * -3 : 0;
        orientation =
          ` translateY(${bob.toFixed(1)}px)` + (flipRef.current ? ' scaleX(-1)' : '');
      } else if (motion === 'roll') {
        /*
         * Rolling without slipping: one full turn per circumference covered.
         * The spin is integrated from the change in distance, so scrolling back
         * up unrolls it and a bend cannot make the angle jump.
         */
        const ahead = path.getPointAtLength(Math.min(total, here + 40));
        const dx = ahead.x - at.x;
        if (Math.abs(dx) > 4) flipRef.current = dx > 0;

        const previous = lastHereRef.current;
        lastHereRef.current = here;
        if (previous !== null) {
          const travelled = here - previous;
          const perDegree = (Math.PI * rollDiameter) / 360;
          spinRef.current += (travelled / perDegree) * (flipRef.current ? 1 : -1);
        }

        orientation = ` rotate(${spinRef.current.toFixed(1)}deg)`;
      } else if (motion === 'sail') {
        /*
         * A boat keeps its mast up — it never rotates to the heading. What it
         * does do is come about: the sprite is drawn facing left, so it is
         * mirrored whenever the route is carrying it right.
         *
         * The direction is read over a long lookahead and only acted on past a
         * few pixels of travel, so near-vertical stretches — where the sign of
         * dx is basically noise — do not make it flap between headings.
         */
        const ahead = path.getPointAtLength(Math.min(total, here + 40));
        const dx = ahead.x - at.x;
        /*
         * A pinned stretch dictates the facing outright, because it holds one
         * `x`: `dx` there is noise around zero, so the boat would otherwise keep
         * whatever facing the approach happened to leave it with.
         *
         * Otherwise the heading decides — except while the craft is dropping.
         * During the fall `at` has been replaced by the drop position while
         * `ahead` is still sampled from the route near its start, so the two are
         * not on the same stretch and their difference is meaningless. Reading it
         * made the boat come about and back again mid-air.
         */
        const pin = pinSpansRef.current.find((s) => at.y >= s.from && at.y <= s.to);
        if (pin) flipRef.current = pin.face === 'right';
        else if (!airborne && Math.abs(dx) > 4) flipRef.current = dx > 0;

        // Rock on a slow swell, independent of which way the route curves —
        // plus, for a fraction of a second after touchdown, the judder of a
        // hull that has just hit the water hard. The two simply add: the swell
        // is already there underneath as the impact rings out.
        rock =
          6 * Math.sin(progress * Math.PI * 2 * 5) +
          2 * Math.sin(progress * Math.PI * 2 * 11) +
          SHAKE_DEG * impact * Math.sin(impactPhase);

        // A vertical judder off the same phase but a different multiple, so
        // the hull is not simply pivoting about a point — it is being thrown.
        const lift = SHAKE_LIFT * impact * Math.sin(impactPhase * 1.7);

        orientation =
          ` translateY(${lift.toFixed(1)}px) rotate(${rock.toFixed(1)}deg)` +
          (flipRef.current ? ' scaleX(-1)' : '');
      } else {
        const ahead = path.getPointAtLength(Math.min(total, here + 2));
        const heading = (Math.atan2(ahead.y - at.y, ahead.x - at.x) * 180) / Math.PI;

        // How hard the path is turning over the next stretch.
        const soon = path.getPointAtLength(Math.min(total, here + 26));
        const nextHeading = (Math.atan2(soon.y - ahead.y, soon.x - ahead.x) * 180) / Math.PI;
        let turn = nextHeading - heading;
        // Keep the difference in (-180, 180] so a wrap does not read as a spin.
        if (turn > 180) turn -= 360;
        if (turn < -180) turn += 360;

        /*
         * A craft drawn in perspective has a top face, so following a leftward
         * heading past ±90° leaves it belly-up; mirroring puts the top back on
         * top, and because the mirror negates the sprite's own nose angle the
         * rotation flips sign with it.
         *
         * Inside a loop that rule has to stop applying: the heading sweeps the
         * whole circle, so re-deciding the mirror would flip the sprite twice
         * per loop — and being inverted at the top of a loop is the point. The
         * mirror is only re-evaluated while the path runs roughly straight.
         */
        const looping = Math.abs(turn) > LOOP_TURN;
        if (!looping) flipRef.current = Math.abs(heading) > 90;
        const flipped = flipRef.current;
        const rotation = flipped ? heading - nose : heading + nose;

        // Bank into turns — but not in a loop, where the roll is the loop
        // itself and a clamped lean would just sit it at an angle.
        const bank = looping ? 0 : Math.max(-16, Math.min(16, turn * 0.55)) * (flipped ? -1 : 1);

        orientation = ` rotate(${(rotation + bank).toFixed(1)}deg)` + (flipped ? ' scaleY(-1)' : '');
      }

      // Position on the outer element, orientation on the sprite. Keeping them
      // apart means the ripples — which sit in the outer one — stay flat on
      // the water instead of rocking and mirroring along with the hull.
      craft.style.transform = `translate(calc(${at.x.toFixed(1)}px - 50%), calc(${at.y.toFixed(1)}px - 50%))`;
      const squashY = 1 - squash * 0.13;
      const squashX = 1 + squash * 0.09;
      /*
       * Hidden before it sets off, always. Hidden at the finish only for a
       * plane, which reads as flying off the page; a boat or a robot simply
       * arrives, and a trail region always ends above the footer, so making
       * them vanish there would look like a bug rather than an exit.
       */
      // A craft that opens as the hero has to be visible before the reader
      // scrolls; everything else stays hidden until it sets off.
      const gone = (progress <= 0.002 && !intro) || (motion === 'fly' && progress >= 0.999);
      craft.style.opacity = gone ? '0' : '1';

      /*
       * A craft that opens as the hero has to paint over the card it sits in,
       * but only while it is sitting there. Once it has dropped and set off it
       * belongs to the background like every other trail — passing behind the
       * cards rather than over them. One stacking level, switched at the
       * handover, rather than two elements.
       */
      if (intro && rootRef.current) {
        rootRef.current.style.zIndex = progress < intro.until ? '20' : '0';
      }

      const sprite = spriteRef.current;
      if (sprite) {
        /*
         * Scaled about its centre, which is where the translation above puts
         * the route's point. Anchoring the scale to the bottom instead — as
         * this did, for the sake of the landing squash — leaves the craft
         * hanging half a hero-height below its own position once it has shrunk,
         * and detaches it from the wake, which is anchored to the box.
         */
        sprite.style.transform =
          `${orientation} scale(${(scale * squashX).toFixed(3)}, ${(scale * squashY).toFixed(3)})`;
      }

      /*
       * The wake rides inside the scaled sprite so it stays fixed to the
       * hull's waterline at any size, and cancels the hull's tilt so the rings
       * lie flat on the water rather than rocking with the boat. Under a
       * mirrored parent a rotation composes with its sign reversed, hence the
       * flip term.
       */
      const wake = wakeRef.current;
      if (wake) {
        /*
         * Only the tilt is cancelled — the scale is inherited on purpose, so
         * the rings stay proportional to the hull at any size. Holding them at
         * a constant size instead left them as a small ellipse tucked under
         * the hero boat, which is why there appeared to be no wake at rest.
         *
         * The CSS sizes them for the hero, and `--wake-k` divides that back
         * out (see below) so the travelling boat keeps the wake it had.
         */
        wake.style.transform = `rotate(${(flipRef.current ? rock : -rock).toFixed(1)}deg)`;
        /*
         * Hidden only while the craft is genuinely airborne — not while it is
         * parked at the top of the page. A boat sitting in its berth is still
         * a boat sitting on water, and before the reader has scrolled at all
         * the wake is the only thing telling them so.
         *
         * But barely there at hero size. The rings inherit the hull's scale, so
         * at 4× they are 4× the line weight and 4× the spread of the travelling
         * wake — plenty to read as a graphic drawn around the boat rather than a
         * disturbance in a surface. Fading them to a fifth is what keeps the
         * berth still.
         */
        wake.style.opacity = afloat ? String(1 - 0.8 * heroness) : '0';
      }

      /*
       * The idle float is held off for the same reason. It is the animation
       * that says "sitting on water", and a boat still in its berth in mid-air
       * is doing neither — bobbing gently while suspended is what made the
       * hero read as floating in space rather than waiting to fall.
       *
       * Cleared to '' rather than set to a value, so the stylesheet's own
       * animation resumes ownership instead of being overridden forever.
       */
      if (floatRef.current && intro) {
        floatRef.current.style.animation = afloat ? '' : 'none';
      }
    };

    /*
     * `head` is where the craft is, driven by scroll. `tail` chases it on a
     * clock of its own, which is what makes the trail behave like vapour: it
     * lags while the reader scrolls, and closes up when they stop.
     */
    let head = 0;
    let tail = 0;
    let last = 0;
    let lastMoveAt = -Infinity;
    let animating = false;

    const isMoving = () => performance.now() - lastMoveAt < MOVE_GRACE;

    const step = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      /*
       * The drop runs on this clock, not on scroll. Scroll only picks the
       * target — up while the reader is at the very top, down once they have
       * moved past the trigger — and the fall covers the distance at its own
       * rate. That is what makes it impossible to catch the craft suspended:
       * pausing a scroll no longer pauses a fall.
       *
       * It is reversible for the same reason the About page's blocks are:
       * scroll back to the top and the craft climbs home rather than
       * teleporting.
       */
      if (intro) {
        const target = head > DROP_TRIGGER ? 1 : 0;
        const rate = dt / (target === 1 ? DROP_SECONDS : RISE_SECONDS);
        const before = dropRef.current;
        dropRef.current =
          target === 1
            ? Math.min(1, dropRef.current + rate)
            : Math.max(0, dropRef.current - rate);

        // Impact is an event, so it is stamped on the frame the fall completes
        // rather than derived from the drop position — which would restart the
        // shake every frame the craft sat at 1.
        if (before < 1 && dropRef.current >= 1) {
          landedAtRef.current = now;
          /*
           * Restart the splash. Re-adding the class is not enough on its own —
           * the browser coalesces the remove and the add into no change at all
           * — so the layout read between them is load-bearing: it forces the
           * style recalculation that makes this two events rather than none.
           */
          const splash = splashRef.current;
          if (splash) {
            splash.classList.remove('is-splashing');
            void splash.offsetWidth;
            splash.classList.add('is-splashing');
          }
        }
        // Lifting off again clears it, so climbing home does not shake.
        if (dropRef.current < 1) landedAtRef.current = null;
      }

      tail += (head - tail) * (1 - Math.exp(-dt / CATCH_UP_TAU));
      // Nothing trails a craft that has not landed yet.
      if (intro && dropRef.current < 1) tail = head;
      // Cap the length in whichever direction the reader is scrolling.
      if (Math.abs(head - tail) > MAX_TRAIL) {
        tail = head - Math.sign(head - tail) * MAX_TRAIL;
      }

      // Movement comes from when the head last changed, not from the trail:
      // waiting for the trail to converge would leave a walker mid-stride for
      // the seconds it takes to catch up.
      paintTrail(head, tail);
      positionCraft(head, isMoving());

      // A drop in flight keeps the loop alive on its own account: the reader
      // may well have stopped scrolling the moment they triggered it.
      const dropping = !!intro && dropRef.current > 0 && dropRef.current < 1;
      // The shake outlives the fall, and the reader has almost certainly
      // stopped scrolling by the time it starts.
      const ringing =
        landedAtRef.current !== null && now - landedAtRef.current < SHAKE_SECONDS * 1000;

      if (Math.abs(head - tail) > 0.0008 || isMoving() || dropping || ringing) {
        frame.current = requestAnimationFrame(step);
      } else {
        // Fully caught up: hide the segments outright rather than painting a
        // zero-length trail. `stroke-linecap: round` renders a zero-length
        // dash as a dot, which would leave a bead sitting under the craft.
        for (const p of pathsRef.current) {
          if (p) p.style.opacity = '0';
        }
        for (const m of printsRef.current) {
          if (m) m.style.opacity = '0';
        }
        // Stopped: both feet down.
        if (motion === 'walk') positionCraft(head, false);
        animating = false;
        frame.current = 0;
      }
    };

    const nudge = () => {
      if (animating) return;
      animating = true;
      last = performance.now();
      frame.current = requestAnimationFrame(step);
    };

    const draw = (scrolled: number) => {
      const next = clamp01(pace(scrolled));
      if (Math.abs(next - head) > STILL) lastMoveAt = performance.now();
      head = next;
      positionCraft(head, isMoving());
      nudge();
    };

    layout();

    if (reduced.matches) {
      // No journey. The whole route is shown at rest, craft parked at the end
      // — which means the drop is over, not un-started.
      dropRef.current = 1;
      paintTrail(1, 0);
      positionCraft(1, false);
      return;
    }

    let scrollFrame = 0;

    const measure = () => {
      scrollFrame = 0;
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const scrolled = window.scrollY;
      const top = rect.top + scrolled;

      /*
       * Mapped against absolute scroll positions rather than the element's
       * offset from the fold. The earlier form assumed the region began below
       * the first screen; a region that starts at the top of the page — as it
       * does when the craft opens as the hero — was already a tenth of the way
       * along before the reader had scrolled at all.
       *
       * Centred on the middle of the viewport: both ends are offset by the same
       * half-screen, which makes progress track `(scrolled + vh/2 - top) /
       * height` — the craft sits level with the reader's eye the whole way
       * down. Offsetting the two ends by different amounts, as this did
       * before, runs the craft ahead of the scroll and leaves it below the
       * fold for most of the page.
       */
      const startAt = Math.max(0, top - vh * 0.5);
      const endAt = Math.max(startAt + 1, top + rect.height - vh * 0.5);
      draw(clamp01((scrolled - startAt) / (endAt - startAt)));
    };

    // Deliberately its own handle: `frame` belongs to the trail animation, and
    // sharing one would let a pending trail frame swallow scroll updates.
    const onScroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(measure);
    };
    const onResize = () => {
      layout();
      onScroll();
    };

    measure();

    /*
     * A page restored mid-scroll — a reload, or a back navigation — should
     * find the craft already sailing. Without this the drop would play from
     * the berth on arrival, at a point where the berth is far off screen.
     */
    if (intro && head > DROP_TRIGGER) {
      dropRef.current = 1;
      positionCraft(head, false);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [route, motion, nose, intro, outro, grow, rollDiameter, trailless, pins]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      // Starts above its container so the first stretch happens behind the
      // page's opening card, which sits at a higher stacking level. No
      // clipping, for the same reason.
      className={cn(
        'pointer-events-none absolute inset-x-0 -top-32 bottom-0 hidden lg:block',
        // Behind the page's cards by default; above them when the craft opens
        // as the hero, since it has to be visible inside the intro card.
        intro ? 'z-20' : 'z-0',
        className,
      )}
    >
      {/* One path per trail segment. They all carry the same `d` — set from
          the measured box in `layout()` — and differ only in the window their
          dash pattern exposes and how faint they are. */}
      <svg ref={svgRef} className="text-on-page-muted h-full w-full">
        {marks || trailless ? (
          <>
            {/* Unstroked: it exists only so the marks — and the craft itself —
                have a curve to be measured against. */}
            <path
              ref={(el) => {
                pathsRef.current[0] = el;
              }}
              fill="none"
              stroke="none"
            />
            {/* A footprint is a pressed mark, so it is a filled ellipse. */}
            {trailless
              ? null
              : Array.from({ length: PRINTS }, (_, i) => (
                  <ellipse
                    key={i}
                    ref={(el) => {
                      printsRef.current[i] = el;
                    }}
                    rx="5.6"
                    ry="3"
                    fill="currentColor"
                    opacity={0}
                  />
                ))}
          </>
        ) : (
          Array.from({ length: SEGMENTS }, (_, i) => (
          <path
            key={i}
            ref={(el) => {
              pathsRef.current[i] = el;
            }}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            pathLength={1}
            style={{ strokeDasharray: '0 1', opacity: 0 }}
          />
          ))
        )}
      </svg>

      {/* Positioned from the top-left and moved entirely by transform, so the
          journey never triggers layout. */}
      <div ref={craftRef} className="absolute top-0 left-0 opacity-0 will-change-transform">
        {/*
         * The hover sits between the position and the orientation: outside the
         * rotation, so the bob stays vertical on screen rather than tilting
         * with the plane, and inside the translation, so it rides along.
         */}
        <div
          ref={floatRef}
          className={
            motion === 'fly' ? 'craft-float' : motion === 'sail' ? 'boat-bob' : undefined
          }
        >
          <div ref={spriteRef} className="will-change-transform">
            {/*
             * The wake. Rings sit at the hull's waterline and run on their own
             * clock rather than on scroll: water keeps moving when the reader
             * stops, and a ripple that only advances while scrolling reads as a
             * glitch. The base-layer reduced-motion rule stops them with
             * everything else.
             *
             * Inside the scaled sprite, so it stays welded to the waterline at
             * hero size and travelling size alike; the tilt is cancelled above.
             */}
            {motion === 'sail' ? (
              <span
                ref={wakeRef}
                aria-hidden="true"
                className="text-on-page-muted absolute top-[62%] left-1/2 z-[-1]"
                /*
                 * The rings inherit the sprite's scale, and the sprite is laid
                 * out at hero size. `--wake-k` is the shrink the travelling
                 * boat ends up at, so multiplying the CSS sizes by it makes
                 * the *travelling* wake the designed one and the hero's
                 * proportionally larger — rather than the other way round.
                 */
                style={{ '--wake-k': 1 / (intro?.scale ?? 1) } as CSSProperties}
              >
                <span className="boat-ripple" />
                <span className="boat-ripple" style={{ animationDelay: '1.2s' }} />
                <span className="boat-ripple" style={{ animationDelay: '2.4s' }} />
              </span>
            ) : null}

            {/*
             * The landing splash. A one-shot, so it lives outside the wake —
             * the wake's opacity is driven every frame and would fight it —
             * and it is triggered by a class the component re-applies on
             * impact rather than by anything scroll-derived.
             */}
            {motion === 'sail' && intro ? (
              <span
                ref={splashRef}
                aria-hidden="true"
                className="splash text-on-page-muted"
                style={{ '--wake-k': 1 / intro.scale } as CSSProperties}
              >
                {SPLASH_DROPS.map((d) => (
                  <span
                    key={`${d.dx},${d.dy}`}
                    className="splash-drop"
                    style={
                      {
                        '--dx': `${d.dx}rem`,
                        '--dy': `${d.dy}rem`,
                        animationDelay: `${d.delay}s`,
                      } as CSSProperties
                    }
                  />
                ))}
                <span className="splash-ring" />
              </span>
            ) : null}

            {/*
             * Airflow off the tail. Unlike the boat's wake this belongs to the
             * craft, not the world, so it lives inside the rotating element
             * and streams backwards along the fuselage. The container is
             * turned to the sprite's own axis — hence the nose offset — and
             * the streaks run from there.
             */}
            {motion === 'fly' ? (
              <span
                aria-hidden="true"
                className="airflow text-on-page-muted"
                style={{ rotate: `${-nose}deg` }}
              >
                <span className="airflow-line" style={{ top: '-5px' }} />
                <span className="airflow-line" style={{ top: '1px', animationDelay: '0.55s' }} />
                <span className="airflow-line" style={{ top: '7px', animationDelay: '1.1s' }} />
              </span>
            ) : null}

            {frames.length > 0 ? (
              /*
               * Frames are stacked and cross-faded rather than swapped in the
               * `src`, so the browser never has to fetch or decode mid-walk.
               * Each is scaled to a shared content height and pushed down by
               * its own empty space, which is what keeps the feet on one line
               * and the body the same size from frame to frame.
               */
              <span
                className="relative block"
                style={{ height: `${contentHeight}px`, width: `${contentHeight}px` }}
              >
                {frames.map((f, i) => (
                  <Image
                    key={f.src}
                    ref={(el) => {
                      framesRef.current[i] = el;
                    }}
                    src={f.src}
                    alt=""
                    width={f.width}
                    height={f.height}
                    style={{
                      height: `${contentHeight * f.heightScale}px`,
                      bottom: `${-contentHeight * f.bottomGap}px`,
                      opacity: i === 0 ? 1 : 0,
                    }}
                    className="absolute left-1/2 w-auto max-w-none -translate-x-1/2 drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]"
                  />
                ))}
              </span>
            ) : (
              <Image
                src={sprite.src ?? ''}
                alt={sprite.alt ?? ''}
                width={sprite.width ?? 0}
                height={sprite.height ?? 0}
                className={cn('h-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]', sprite.sizeClass)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
