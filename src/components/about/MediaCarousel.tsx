'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { cn } from '@/lib/cn';

/**
 * A single tile in the marquee. Photos carry their `StaticImageData` so
 * next/image can pick the right optimised size; videos carry both a poster
 * (shown in the row) and a video source (played inside the lightbox on
 * click).
 */
export type MediaItem =
  | {
      kind: 'photo';
      key: string;
      image: StaticImageData;
      alt: string;
      label: string;
      caption: string;
      accentClass: string;
      aspect: string;
    }
  | {
      kind: 'video';
      key: string;
      poster: StaticImageData;
      videoSrc: string;
      alt: string;
      label: string;
      caption: string;
      accentClass: string;
      aspect: string;
    };

/** Stable identifier for an item's underlying media, used to dedupe copies
 * that appear in both rows so the lightbox navigates a clean list. */
function contentIdOf(item: MediaItem): string {
  return item.kind === 'photo' ? item.image.src : item.videoSrc;
}

/**
 * Two horizontally-scrolling rows moving in opposite directions. Hovering
 * anywhere in the group (or tabbing into a tile) pauses both rows together
 * so the composition stops as one. Clicking a tile opens the lightbox at a
 * comfortable size and lets you step through every unique item.
 */
export function MediaCarousel({
  topRow,
  bottomRow,
  className,
}: {
  topRow: MediaItem[];
  bottomRow: MediaItem[];
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Flat, de-duplicated collection used by the lightbox for prev/next.
  const uniqueItems = useMemo(() => {
    const seen = new Set<string>();
    const out: MediaItem[] = [];
    for (const item of [...topRow, ...bottomRow]) {
      const id = contentIdOf(item);
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(item);
    }
    return out;
  }, [topRow, bottomRow]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const open = useCallback(
    (item: MediaItem) => {
      const id = contentIdOf(item);
      const index = uniqueItems.findIndex((candidate) => contentIdOf(candidate) === id);
      setOpenIndex(index === -1 ? null : index);
    },
    [uniqueItems],
  );
  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) => {
        if (current === null) return current;
        const next = (current + delta + uniqueItems.length) % uniqueItems.length;
        return next;
      }),
    [uniqueItems.length],
  );

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="marquee-group flex flex-col gap-3 sm:gap-4">
        <MarqueeRow
          items={topRow}
          direction="left"
          reducedMotion={reducedMotion}
          onOpen={open}
        />
        <MarqueeRow
          items={bottomRow}
          direction="right"
          reducedMotion={reducedMotion}
          onOpen={open}
        />
      </div>
      {openIndex !== null && uniqueItems[openIndex] ? (
        <Lightbox
          item={uniqueItems[openIndex]}
          index={openIndex}
          total={uniqueItems.length}
          onClose={close}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
        />
      ) : null}
    </div>
  );
}

function MarqueeRow({
  items,
  direction,
  reducedMotion,
  onOpen,
}: {
  items: MediaItem[];
  direction: 'left' | 'right';
  reducedMotion: boolean;
  onOpen: (item: MediaItem) => void;
}) {
  // Duration scales with the number of items so a longer row doesn't feel
  // rushed. ~8s per tile is a comfortable reading pace at these sizes.
  const durationSeconds = Math.max(30, items.length * 8);

  // With reduced motion the row becomes a horizontally-scrollable strip.
  if (reducedMotion) {
    return (
      <div className="-mx-card overflow-x-auto">
        <ul className="flex w-max gap-3 px-card sm:gap-4">
          {items.map((item) => (
            <li
              key={item.key}
              className={cn('h-40 flex-none sm:h-48 lg:h-56', item.aspect)}
            >
              <Tile item={item} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const doubled = [...items, ...items];

  return (
    <div
      className="-mx-card relative overflow-hidden"
      // Safety net for any other scroll-into-view (browser find, autofocus,
      // assistive tech): the row is animated, never scrolled, so snap it back.
      onScroll={(event) => {
        event.currentTarget.scrollLeft = 0;
      }}
    >
      {/* Feather the two edges so tiles ease in and out of the row rather
          than clipping flat against the surrounding page. Uses `from-page`
          so the fade matches the body colour in both light and dark themes. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r from-page to-transparent sm:w-16"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-page to-transparent sm:w-16"
      />
      <ul
        data-direction={direction}
        className="marquee-track flex w-max gap-3 sm:gap-4"
        style={
          { '--marquee-duration': `${durationSeconds}s` } as React.CSSProperties
        }
      >
        {doubled.map((item, i) => (
          <li
            key={`${item.key}-${i}`}
            aria-hidden={i >= items.length ? 'true' : undefined}
            className={cn('h-40 flex-none sm:h-48 lg:h-56', item.aspect)}
          >
            <Tile item={item} onOpen={onOpen} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Tiles sit desaturated in the row and come back to colour on hover or
 * keyboard focus. Applied to the media only, never the wrapping button — the
 * accent-coloured label plaque has to stay in colour to keep its contrast.
 */
const tileMedia =
  'object-cover grayscale transition-[filter] duration-500 ease-out group-hover/tile:grayscale-0 group-focus-visible/tile:grayscale-0 motion-reduce:transition-none';

function Tile({ item, onOpen }: { item: MediaItem; onOpen: (item: MediaItem) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      aria-label={`Open ${item.label} — ${item.caption}`}
      className="group/tile relative block h-full w-full overflow-hidden bg-black transition-[transform,filter] duration-300 ease-out hover:scale-[1.015] hover:brightness-110 focus-visible:scale-[1.015] focus-visible:brightness-110"
    >
      {item.kind === 'photo' ? (
        <Image
          src={item.image}
          alt={item.alt}
          fill
          sizes="(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 22vw"
          className={tileMedia}
        />
      ) : (
        <>
          <Image
            src={item.poster}
            alt={item.alt}
            fill
            sizes="(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 22vw"
            className={tileMedia}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-black/45 via-black/10 to-black/25"
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-black shadow-[0_10px_28px_-12px_rgba(0,0,0,0.6)] ring-1 ring-black/10 transition-transform duration-200 group-hover/tile:scale-110 sm:size-14"
          >
            <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current sm:h-6 sm:w-6">
              <path d="M8 5.14v13.72c0 .78.85 1.26 1.53.85l11.28-6.86a1 1 0 0 0 0-1.7L9.53 4.29A1 1 0 0 0 8 5.14z" />
            </svg>
          </span>
        </>
      )}
      {/* Bottom label — a small mono plaque so each tile still identifies
          itself while the row scrolls. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 flex items-baseline gap-3 bg-linear-to-t from-black/75 via-black/35 to-transparent px-3 pt-8 pb-2.5 text-white"
      >
        <span
          className={cn('font-mono text-micro font-bold uppercase', item.accentClass)}
        >
          {item.label}
        </span>
      </span>
    </button>
  );
}

/**
 * A modal preview with a proper header (label + caption + counter + close),
 * on-screen prev/next arrows, and keyboard support: ESC dismisses, ← / →
 * step through the collection. Body scroll is locked while the modal is
 * open and focus is restored when it closes.
 */
function Lightbox({
  item,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  item: MediaItem;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement;

    const onKey = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onPrev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onNext();
          break;
      }
    };
    document.addEventListener('keydown', onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    closeRef.current?.focus({ preventScroll: true });

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      const restore = restoreFocusRef.current;
      // `preventScroll` matters here: the tile we came from is inside an
      // animating, overflow-hidden row. A scroll-into-view would set
      // `scrollLeft` on that row, dragging the tiles out from under the
      // absolutely-positioned edge fades.
      if (restore instanceof HTMLElement) restore.focus({ preventScroll: true });
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-lightbox-label"
      className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Header — always visible, sits above the media */}
      <header
        className="relative z-10 flex items-center justify-between gap-4 px-5 py-4 text-white sm:px-8 sm:py-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-w-0 items-baseline gap-3 sm:gap-4">
          <span className="font-mono text-white/50 text-micro font-bold uppercase tabular-nums">
            {String(index + 1).padStart(2, '0')} <span className="text-white/25">/</span>{' '}
            {String(total).padStart(2, '0')}
          </span>
          <span
            id="media-lightbox-label"
            className={cn('font-mono text-micro font-bold uppercase', item.accentClass)}
          >
            {item.label}
          </span>
          <span className="hidden max-w-md truncate text-sm text-white/70 sm:inline">
            {item.caption}
          </span>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="grid size-10 flex-none place-items-center rounded-full border border-white/25 bg-white/5 text-white transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:border-white focus-visible:bg-white focus-visible:text-black"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Body — media centred, arrows on the sides */}
      <div
        className="relative flex flex-1 items-center justify-center px-4 pb-4 sm:px-16 sm:pb-8"
        onClick={(event) => event.stopPropagation()}
      >
        <NavButton side="left" onClick={onPrev} disabled={total < 2} label="Previous" />
        <NavButton side="right" onClick={onNext} disabled={total < 2} label="Next" />

        <div
          key={contentIdOf(item)}
          className="relative flex max-h-full w-full items-center justify-center"
        >
          {item.kind === 'video' ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              controls
              autoPlay
              playsInline
              poster={item.poster.src}
              className="max-h-[78vh] w-auto max-w-full bg-black shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]"
            >
              <source src={item.videoSrc} type="video/mp4" />
              Your browser cannot play this clip.
            </video>
          ) : (
            // Native <img> so the picture sizes freely to the viewport
            // without fighting next/image's intrinsic width/height.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image.src}
              alt={item.alt}
              className="max-h-[78vh] w-auto max-w-full bg-black object-contain shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]"
            />
          )}
        </div>
      </div>

      {/* Footer — caption on small screens, hint on large ones */}
      <footer
        className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3 text-white/60 sm:px-8 sm:py-4"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="max-w-2xl text-xs leading-snug text-pretty sm:hidden">{item.caption}</p>
        <p className="font-mono text-micro uppercase tracking-widest hidden sm:block">
          ← / → to browse · ESC to close
        </p>
      </footer>
    </div>
  );
}

function NavButton({
  side,
  onClick,
  disabled,
  label,
}: {
  side: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'absolute top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-white/5 text-white transition-colors',
        'hover:border-white hover:bg-white hover:text-black focus-visible:border-white focus-visible:bg-white focus-visible:text-black',
        'disabled:pointer-events-none disabled:opacity-30',
        side === 'left' ? 'left-3 sm:left-6' : 'right-3 sm:right-6',
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={cn('h-5 w-5 fill-none stroke-current stroke-2', side === 'right' && 'rotate-180')}
      >
        <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
