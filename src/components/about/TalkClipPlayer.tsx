'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Portrait talk clip with a custom play button overlaid on the poster.
 *
 * The native `controls` bar is kept — it's the familiar way to pause, seek and
 * scrub — but before the first click the overlay is what signals "this is a
 * video". Once the clip has started we let the native chrome take over and
 * the overlay stays out of the way for the rest of the session.
 */
export function TalkClipPlayer({
  src,
  posterSrc,
  label,
  captionAccentClass,
  caption,
  className,
}: {
  src: string;
  posterSrc: string;
  label: string;
  captionAccentClass: string;
  caption: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const play = () => {
    const el = videoRef.current;
    if (!el) return;
    setStarted(true);
    void el.play();
  };

  return (
    <figure className={cn('group flex flex-col', className)}>
      <div className="relative mx-auto aspect-9/16 w-full max-w-xs overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 sm:max-w-sm lg:max-w-80 xl:max-w-sm">
        <video
          ref={videoRef}
          controls
          playsInline
          preload="none"
          poster={posterSrc}
          onPlay={() => setStarted(true)}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={src} type="video/mp4" />
          Your browser cannot play this clip.
        </video>

        {/*
         * The overlay stops covering the video once it's started, so the
         * native controls (pause, scrub, fullscreen) become the primary
         * interaction. Focus/hover states live on the group so the whole
         * button responds together.
         */}
        {!started ? (
          <button
            type="button"
            onClick={play}
            aria-label={`Play ${label}`}
            className="group/play absolute inset-0 grid place-items-center focus:outline-none"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-black/45 via-black/15 to-black/25 transition-opacity duration-300 group-hover/play:opacity-80"
            />
            <span
              aria-hidden="true"
              className="relative grid size-16 place-items-center rounded-full bg-white/95 text-black shadow-[0_14px_32px_-10px_rgba(0,0,0,0.55)] ring-1 ring-black/10 transition-transform duration-200 ease-out group-hover/play:scale-110 group-focus-visible/play:scale-110 group-focus-visible/play:ring-2 group-focus-visible/play:ring-white sm:size-20"
            >
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8">
                <path d="M8 5.14v13.72c0 .78.85 1.26 1.53.85l11.28-6.86a1 1 0 0 0 0-1.7L9.53 4.29A1 1 0 0 0 8 5.14z" />
              </svg>
            </span>
            <span
              aria-hidden="true"
              className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white"
            >
              <span className="font-mono text-micro font-bold uppercase tracking-widest">
                Watch
              </span>
              <span className="font-mono text-micro font-bold uppercase tracking-widest">17s</span>
            </span>
          </button>
        ) : null}
      </div>

      <figcaption className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1">
        <span className={cn('font-mono text-micro font-bold uppercase', captionAccentClass)}>
          {label}
        </span>
        <span className="text-on-ink-muted text-xs leading-snug text-pretty">{caption}</span>
      </figcaption>
    </figure>
  );
}
