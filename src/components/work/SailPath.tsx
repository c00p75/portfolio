import { ScrollTrail, type Pin, type Waypoint } from '@/components/ui/ScrollTrail';

/**
 * "Also worth a look" is a dense, left-aligned list — the one section on the
 * page where a boat crossing the column is a distraction rather than a
 * decoration. The route holds to the right margin for its whole measured
 * height instead.
 */
/*
 * Facing left for the held run, since a pinned stretch has no direction of
 * travel to read a facing from. Left has the boat looking in at the list rather
 * than off the edge of the page.
 */
const PINS: Pin[] = [{ id: 'more-projects', x: 0.84, face: 'left' }];

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
   * Only now does it start to sail — and it sails, rather than tacks. The
   * earlier route crossed the page five times between x 0.2 and 0.82, which at
   * this width reads as a zigzag: each crossing is a decision, and a drifting
   * boat does not make five of them.
   *
   * This is one long sweep out to the left and back, with the swings both
   * fewer and shallower — roughly half the old lateral range. The vertical
   * spacing is wider too, so what lateral movement remains is spread over more
   * page and stays gentle.
   */
  { x: 0.68, y: 0.28 },
  { x: 0.55, y: 0.38 },
  { x: 0.42, y: 0.5 },
  { x: 0.38, y: 0.62 },
  { x: 0.46, y: 0.74 },
  { x: 0.58, y: 0.86 },
  { x: 0.64, y: 1 },
];

export function SailPath() {
  return (
    <ScrollTrail
      route={ROUTE}
      motion="sail"
      pins={PINS}
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
