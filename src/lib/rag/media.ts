import type { StaticImageData } from 'next/image';
import awardSolo from '../../../public/images/ZABA.jpeg';
import awardGroup from '../../../public/images/ZABA-2.jpeg';
import presenting from '../../../public/images/presenting.jpeg';
import portrait from '../../../public/images/suit-portrait.jpg';
import teamPhoto from '../../../public/images/team.jpg';
import type { Retrieved } from './types';

/** An image shown under an answer. Plain data so it crosses the SSE stream. */
export type ChatMedia = {
  /** Stable key the client sends back so a thread never shows a photo twice. */
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  /** Where the picture's story lives on the site, if anywhere. */
  href?: string;
};

type Photo = {
  id: string;
  image: StaticImageData;
  alt: string;
  caption: string;
  href?: string;
};

/**
 * Photos tied to one specific fact. A fact is illustrated only when its
 * `pattern` matches the answer *and* a passage the answer cited — the first so
 * the picture shows what the visitor is reading, the second so a model that
 * says "I can't find an award" does not get a trophy photo underneath.
 *
 * Patterns name the fact, not the topic: a picture is evidence for a claim,
 * not decoration for a subject. When a fact has several photos, each answer
 * that earns one gets the next the thread has not seen yet.
 */
const FACTS: { pattern: RegExp; photos: Photo[] }[] = [
  {
    pattern: /Company of the Year|Zambia Business Awards?/i,
    photos: [
      {
        id: 'award-certificate',
        image: awardSolo,
        alt: "George M'sapenda holding the Ballo Innovations Company of the Year certificate",
        caption: 'Ballo Innovations, Company of the Year for ICT Services — Zambia Business Awards.',
        href: '/about',
      },
      {
        id: 'award-night',
        image: awardGroup,
        alt: 'Three Ballo Innovations team members holding Zambia Business Awards certificates',
        caption: 'Zambia Business Awards night, with the two other Ballo winners.',
        href: '/about',
      },
    ],
  },
  {
    pattern: /lead\w*[^.]{0,30}engineering team/i,
    photos: [
      {
        id: 'ballo-team',
        image: teamPhoto,
        alt: 'The Ballo Innovations team outside the office in football shirts',
        caption: 'The Ballo Innovations engineering team.',
        href: '/about',
      },
    ],
  },
  {
    pattern: /architecture review/i,
    photos: [
      {
        id: 'architecture-review',
        image: presenting,
        alt: 'Presenting a retrieval architecture diagram on a projector screen',
        caption: 'Architecture review: walking a retrieval pipeline through the team.',
        href: '/about',
      },
    ],
  },
  {
    pattern: /based in Lusaka/i,
    photos: [
      {
        id: 'portrait',
        image: portrait,
        alt: "Portrait of George M'sapenda in a navy suit",
        caption: "George M'sapenda — software engineer and CTO, Lusaka.",
        href: '/about',
      },
    ],
  },
];

/** Enough to illustrate an answer without turning the chat into a gallery. */
const MAX_MEDIA = 2;

/** Passages the answer actually cited with [n]. */
function citedPassages(answer: string, passages: Retrieved[]): Retrieved[] {
  const cited = new Set<number>();
  for (const match of answer.matchAll(/\[(\d+)\]/g)) cited.add(Number(match[1]));
  return [...cited].flatMap((n) => passages[n - 1] ?? []);
}

/**
 * Fact photos grounded in the passages this answer cited, skipping any the
 * thread has already shown (`seen` holds their ids).
 */
export function mediaForAnswer(
  answer: string,
  passages: Retrieved[],
  seen: ReadonlySet<string> = new Set(),
): ChatMedia[] {
  const cited = citedPassages(answer, passages);
  if (cited.length === 0) return [];

  // Models space numbers and names with narrow no-break spaces
  // ("Company\u202fof\u202fthe\u202fYear"), which a literal space in a pattern misses.
  const flat = (text: string) => text.replace(/\s+/g, ' ');
  const said = flat(answer);

  return FACTS.filter(
    ({ pattern }) => pattern.test(said) && cited.some((p) => pattern.test(flat(p.chunk.text))),
  )
    .flatMap(({ photos }) => photos.find((photo) => !seen.has(photo.id)) ?? [])
    .slice(0, MAX_MEDIA)
    .map(({ id, image, alt, caption, href }) => ({
      id,
      src: image.src,
      width: image.width,
      height: image.height,
      alt,
      caption,
      href,
    }));
}
