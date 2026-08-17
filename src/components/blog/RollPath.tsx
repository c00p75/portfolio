import { ScrollTrail, type Waypoint } from '@/components/ui/ScrollTrail';

/**
 * The writing route: a discarded draft rolling down the page.
 *
 * Flatter than the flight and shallower than the sail. A ball rolls on ground,
 * so like the robot's walk this spends its length crossing the page rather than
 * diving down it — and no loops, since a ball that left the ground would have
 * nothing to roll on.
 *
 * The route begins under the sheet in the intro — see the offset below — and
 * keeps to the far right the whole way down. The page is a column of reading,
 * and the text starts at the left of every card, so the ball is confined to the
 * strip beside it.
 *
 * The strip is narrow on purpose — 0.86 to 0.97, hugging the right margin. The
 * reading column is the point of the page, and a ball crossing it while a
 * paragraph is being read is worse than no animation at all.
 *
 * Within that strip the rhythm is deliberately uneven. Evenly spaced waypoints
 * of equal amplitude produce a sine wave, which is the one thing a rolling ball
 * should not look like: you can predict where it will be. So the spacing runs
 * from 0.025 to 0.10 of the route and the swings from a hair to the full width
 * of the strip — quick jinks, a long lazy drift, one near-vertical drop, a hard
 * cut back. No two beats repeat.
 */
const ROUTE: Waypoint[] = [
  { x: 0.88, y: 0 },
  { x: 0.95, y: 0.03 },
  // Quick jink.
  { x: 0.91, y: 0.055 },
  { x: 0.97, y: 0.075 },
  // Long run back across the strip.
  { x: 0.87, y: 0.13 },
  // Lazy drift: barely moves for a tenth of the page.
  { x: 0.88, y: 0.23 },
  { x: 0.96, y: 0.27 },
  { x: 0.92, y: 0.305 },
  // Near-vertical drop.
  { x: 0.93, y: 0.4 },
  // Hard cut back.
  { x: 0.86, y: 0.435 },
  { x: 0.9, y: 0.5 },
  { x: 0.89, y: 0.525 },
  { x: 0.97, y: 0.6 },
  { x: 0.94, y: 0.635 },
  // Second long drift, mirrored.
  { x: 0.95, y: 0.73 },
  { x: 0.86, y: 0.775 },
  { x: 0.91, y: 0.82 },
  { x: 0.89, y: 0.9 },
  { x: 0.97, y: 0.95 },
  { x: 0.92, y: 1 },
];

export function RollPath() {
  return (
    <ScrollTrail
      route={ROUTE}
      motion="roll"
      /*
       * Starts the region level with the middle of the sheet in the intro,
       * rather than the component's default head-start *above* the card.
       *
       * The card is the wrong thing to hide behind here: on this theme its
       * panel is the same colour as the page, so it occludes nothing. The sheet
       * image does, being opaque — so the route's first waypoint has to land
       * inside the sheet's own box for the ball to come out from under it.
       * 15rem is the card's top padding plus roughly half the sheet's height,
       * and the sheet scales with the viewport, so this holds across widths.
       */
      className="top-60"
      sprite={{
        src: '/icons/paper-writing-crampled.png',
        width: 656,
        height: 600,
        sizeClass: 'w-14',
        // Must agree with `sizeClass` above: `w-14` is 56px.
        rollDiameter: 56,
      }}
    />
  );
}
