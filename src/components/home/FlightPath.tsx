import { ScrollTrail, type Waypoint } from '@/components/ui/ScrollTrail';

/**
 * The homepage route. Loop positions were chosen against the measured section
 * boundaries so each one happens in open background rather than behind an
 * opaque card: `how-i-work` runs 0.30–0.46 of the trail box, `stack` 0.62–0.79.
 */
const ROUTE: Waypoint[] = [
  { x: 0.06, y: 0 },
  { x: 0.32, y: 0.05 },
  { x: 0.6, y: 0.1 },
  { x: 0.8, y: 0.17 },
  { x: 0.72, y: 0.25 },
  { x: 0.5, y: 0.29 },
  // Loop one, in the open band at the top of "How I work".
  { x: 0.66, y: 0.325, loop: true },
  { x: 0.84, y: 0.38 },
  { x: 0.6, y: 0.44 },
  { x: 0.26, y: 0.48 },
  { x: 0.2, y: 0.55 },
  { x: 0.42, y: 0.62 },
  { x: 0.72, y: 0.68 },
  // Loop two, in the gap where Tooling meets Writing.
  { x: 0.78, y: 0.755, loop: true },
  { x: 0.6, y: 0.85 },
  { x: 0.38, y: 0.92 },
  { x: 0.28, y: 1 },
];

export function FlightPath() {
  return (
    <ScrollTrail
      route={ROUTE}
      motion="fly"
      sprite={{
        src: '/icons/new-paper-airplane.png',
        width: 850,
        height: 586,
        sizeClass: 'w-20',
        // The sprite's nose points up and to the right, about -41°.
        noseOffset: 41,
      }}
    />
  );
}
