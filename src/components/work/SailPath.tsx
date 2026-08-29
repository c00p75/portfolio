import { ScrollTrail, type Waypoint } from '@/components/ui/ScrollTrail';

/**
 * The work page route.
 *
 * Wider and lazier than the homepage flight, and with no loops: a boat drifts
 * on a current, it does not stunt. The waypoints stay clear of the middle
 * where the case-study cards sit, so the boat crosses open background between
 * them rather than disappearing behind card after card.
 */
const ROUTE: Waypoint[] = [
  /*
   * The berth. Measured, not guessed: the intro card's reserved column centres
   * at x 0.744 of the trail box, so the boat opens exactly where a hero image
   * would have sat.
   *
   * The next two waypoints share that x deliberately. The intro is a straight
   * vertical drop, and it has to land exactly where path-following takes over
   * — so the opening leg of the route is vertical, and the landing point is
   * directly below the berth however far along it falls.
   */
  { x: 0.744, y: 0.09 },
  { x: 0.744, y: 0.13 },
  { x: 0.744, y: 0.18 },
  /*
   * Only now does it start to sail — and it tacks: full width left, full width
   * right, repeatedly.
   *
   * The reason is the facing. A boat never rotates to its heading — it only
   * mirrors, left or right — so the *only* heading it can honestly express is a
   * horizontal one. On a steeply descending leg the hull points sideways while
   * the motion is mostly downward, and the two visibly disagree. Keeping each
   * leg shallow makes horizontal the dominant component of every movement, so
   * the direction it faces is the direction it is going.
   *
   * That is what sets the vertical spacing: each crossing drops only 0.10 of
   * the page while covering better than half its width, which at this page's
   * proportions is roughly 30° off horizontal. Fewer, longer legs would be
   * calmer but steeper — and steeper is precisely the thing that breaks.
   *
   * The two ends are not symmetrical. The far left stops around 0.38, short of
   * the margin, because that side is where every heading, lead and body
   * paragraph on the page begins and a boat out there sits on the text. The
   * right has nothing to collide with, so it runs out to the edge. The
   * amplitudes vary by a couple of points either side to keep the tacking off
   * a metronome.
   */
  { x: 0.38, y: 0.3 },
  { x: 0.92, y: 0.4 },
  { x: 0.36, y: 0.5 },
  { x: 0.9, y: 0.6 },
  { x: 0.4, y: 0.7 },
  /*
   * Coming into the berth. The last wide tack used to run out to 0.92 and then
   * drop almost straight down onto 0.74 — a hook, then a vertical slide. The
   * hull only mirrors left or right, so a steep finish looks like the boat is
   * being dragged sideways.
   *
   * Last come-about, then a run to the quay. The page is much taller than it
   * is wide, so a short last hop in x over the remaining y is still a steep
   * slide on screen. The final tack therefore stays full-width (0.86 → 0.38)
   * and the dock is one shallow rightward glide (0.38 → 0.56 → 0.74), three
   * colinear points, no hook.
   *
   * 0.74 is still the park: at the outro scale the hull is ~8% of the page
   * either side of centre, which brings the bow up to the Contact link without
   * covering it.
   */
  { x: 0.86, y: 0.82 },
  { x: 0.38, y: 0.934 },
  { x: 0.56, y: 0.967 },
  { x: 0.74, y: 1 },
];

export function SailPath() {
  return (
    <ScrollTrail
      route={ROUTE}
      motion="sail"
      sprite={{
        src: '/icons/paper-boat.png',
        width: 2800,
        height: 1800,
        // Opens at hero size in the intro card's empty column, then shrinks
        // into the travelling boat over the first stretch of the route.
        intro: { scale: 4.3, until: 0.06 },
        /*
         * And grows back right at the very end, so the run finishes on a boat
         * with some presence rather than a thumbnail drifting off the bottom of
         * the page.
         *
         * Over the last 8% — the coast into the berth — so the growth and the
         * slowing glide are one arrival. The old 3% window fired after the
         * boat had already stopped moving sideways, which read as a pop.
         *
         * To 70% of the opening size, not all of it: arriving at exactly the
         * hero size invites the comparison with the top of the page and reads as
         * a reset rather than an ending — and at full size the boat needs more
         * clearance than the closing rail leaves it.
         */
        outro: { from: 0.92, scale: 4.3 * 0.7 },
        /*
         * The hero size, not the travelling size — see `intro` below. At
         * 4.3× this lays out at 30rem and the boat travels at 1/4.3 of it,
         * which is the same ~126px it was before, but rasterised from a
         * layer that is never scaled up.
         */
        sizeClass: 'w-[30rem]',
      }}
    />
  );
}
