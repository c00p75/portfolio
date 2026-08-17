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
  { x: 0.92, y: 0.8 },
  /*
   * The last two waypoints break the tacking, because the outro is growing the
   * boat back to hero size across exactly this stretch. At 4.3× it is no longer
   * a small craft that can pass anywhere: it is 30rem wide, and out at the
   * right margin it covers the Contact link in the closing rail, while out at
   * the left it would cover the rail's label.
   *
   * So the run finishes in the open span between the two — pushed as far right
   * as that span allows. At 30rem wide the hull reaches roughly 8% of the page
   * either side of its centre, so 0.74 brings its bow up close to the Contact
   * link without crossing it, rather than parking mid-page with an obvious gap.
   */
  { x: 0.7, y: 0.9 },
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
         * Deliberately the last 3% of the route and not a fifth of it: over a
         * long window the growth is visible for most of the descent and reads as
         * the boat coming towards the reader the whole way down. Confined to the
         * end, it is an arrival — but 1% was too abrupt to read as a movement at
         * all, so this is the shortest window the eye still follows.
         *
         * To 70% of the opening size, not all of it: arriving at exactly the
         * hero size invites the comparison with the top of the page and reads as
         * a reset rather than an ending — and at full size the boat needs more
         * clearance than the closing rail leaves it.
         */
        outro: { from: 0.97, scale: 4.3 * 0.7 },
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
