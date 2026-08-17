import { ScrollTrail, type Waypoint, type WalkFrame } from '@/components/ui/ScrollTrail';

/**
 * The sandbox route.
 *
 * Flatter than the flight and the sail: a robot walks on ground, so the path
 * keeps its descents gentle and spends its length crossing the page rather
 * than diving down it. No loops, for the obvious reason.
 *
 * The whole route is confined to the right margin (x 0.62–0.95) so the walk
 * stays in peripheral vision instead of tracking across the prose column.
 */
const ROUTE: Waypoint[] = [
  { x: 0.95, y: 0 },
  { x: 0.87, y: 0.08 },
  { x: 0.72, y: 0.15 },
  { x: 0.62, y: 0.24 },
  { x: 0.69, y: 0.34 },
  { x: 0.84, y: 0.41 },
  { x: 0.95, y: 0.5 },
  { x: 0.85, y: 0.6 },
  { x: 0.7, y: 0.67 },
  { x: 0.63, y: 0.77 },
  { x: 0.75, y: 0.86 },
  { x: 0.87, y: 0.94 },
  { x: 0.82, y: 1 },
];

/**
 * The three exports, measured rather than guessed. Their content boxes are
 * 679, 698 and 640px tall inside images of 701, 769 and 769px, with different
 * amounts of blank space under the feet — so each frame carries the two ratios
 * `ScrollTrail` needs to scale them to a common height and land the feet on
 * one line.
 *
 * Order matters: [pass, left contact, right contact]. Index 0 is also the
 * pose the robot rests in when the page stops scrolling.
 *
 * The step frames are `-cut` copies: the originals ship with an opaque white
 * background, which would render as a white box on the page.
 */
const FRAMES: WalkFrame[] = [
  {
    src: '/icons/paper-robot-standing.png',
    width: 561,
    height: 701,
    heightScale: 701 / 679,
    bottomGap: 13 / 679,
  },
  {
    src: '/icons/paper-robot-leftstep-cut.png',
    width: 512,
    height: 769,
    heightScale: 769 / 698,
    bottomGap: 36 / 698,
  },
  {
    src: '/icons/paper-robot-rightstep-cut.png',
    width: 512,
    height: 769,
    heightScale: 769 / 640,
    bottomGap: 77 / 640,
  },
];

/**
 * The robot walks nearer as the page runs out: it spends the route at 96px of
 * content height and arrives at the full 184. Declared as the arrival size with
 * a scale-down, not the other way round, so the closing frames stay sharp —
 * a composited layer is rasterised at its layout size.
 */
const GROW = { from: 0.62, scale: 184 / 96 };

export function WalkPath() {
  return (
    <ScrollTrail
      route={ROUTE}
      motion="walk"
      sprite={{ frames: FRAMES, contentHeight: 184, grow: GROW }}
    />
  );
}
