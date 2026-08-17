'use client';

import { useEffect, useRef, useState } from 'react';
import { Sticker, type Accent } from '@/components/ui/Sticker';
import { cn } from '@/lib/cn';

export type FactSticker = {
  label: string;
  caption: string;
  accent: Accent;
  /** Degrees of rotation at rest. */
  rotate: number;
};

/** How far above its resting place a block starts and ends its flight, in px. */
const DROP_DISTANCE = 420;

/** Share of a fall spent in free flight; the rest is the landing. */
const FALL_PORTION = 0.74;

/** Share of a leap spent crouching before the block pushes off. */
const CROUCH_PORTION = 0.14;

/** Height of the first rebound on landing, in pixels. */
const BOUNCE_HEIGHT = 26;

/** Extra degrees of tilt a block carries while it is off the pile. */
const AIR_TILT = 9;

/** How long one block takes to fall and settle, in ms. */
const FALL_DURATION = 720;

/** How long one block takes to crouch and leap away, in ms. */
const RISE_DURATION = 620;

/** Minimum gap between two blocks moving, so they go one at a time. */
const STAGGER = 190;

/**
 * Fraction of the pinned region's height over which the whole stack
 * assembles. The remainder of the scroll leaves the finished pile in place.
 */
const ASSEMBLE_OVER = 0.55;

/**
 * Where the first and last blocks are released, as a share of the assembly
 * range. The first threshold is deliberately above zero: at zero a block
 * satisfies its condition on load and drops before the reader has scrolled.
 */
const FIRST_RELEASE = 0.1;
const LAST_RELEASE = 0.9;

/**
 * Scroll progress at which the block in the given landing position lets go.
 * Position 0 is the block directly above the floor — the first to land.
 */
function releaseAt(position: number, count: number) {
  if (count < 2) return FIRST_RELEASE;
  return FIRST_RELEASE + (position * (LAST_RELEASE - FIRST_RELEASE)) / (count - 1);
}

type Direction = 'down' | 'up';

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

type Motion = {
  /** Vertical offset from the resting position — negative is above it. */
  y: number;
  /** Degrees to add to the block's resting rotation. */
  tilt: number;
  /** 0–1 vertical compression, from impact or from crouching. */
  squash: number;
  /** Motion blur in pixels, proportional to speed. */
  blur: number;
  /** 0–1 shock this block passes into the pile beneath it. */
  impact: number;
  opacity: number;
};

const AT_REST: Motion = { y: 0, tilt: 0, squash: 0, blur: 0, impact: 0, opacity: 1 };

/** Off the pile and out of sight — where a block waits before it is dropped. */
const OFF_STAGE: Motion = {
  y: -DROP_DISTANCE,
  tilt: AIR_TILT,
  squash: 0,
  blur: 0,
  impact: 0,
  opacity: 0,
};

/**
 * The fall. `y ∝ t²` is real gravity, so the block accelerates instead of
 * easing out and arrives fast. Everything after touchdown is the landing: two
 * decaying rebounds, a squash on first contact, and a wobble as the tilt
 * settles.
 */
function falling(t: number): Motion {
  if (t >= 1) return AT_REST;
  if (t <= 0) return OFF_STAGE;

  if (t < FALL_PORTION) {
    const u = t / FALL_PORTION;
    return {
      y: -DROP_DISTANCE * (1 - u * u),
      // Straightens up on the way down, so it lands roughly square.
      tilt: AIR_TILT * (1 - u),
      squash: 0,
      // Speed is the derivative of the fall, so blur tracks it directly.
      blur: Math.min(3.5, u * 4),
      impact: 0,
      opacity: Math.min(1, t * 6),
    };
  }

  const b = (t - FALL_PORTION) / (1 - FALL_PORTION);
  const decay = (1 - b) * (1 - b);

  return {
    y: -BOUNCE_HEIGHT * Math.abs(Math.sin(b * Math.PI * 2.2)) * decay,
    // Overshoots past its resting angle, then rocks back into it.
    tilt: -AIR_TILT * 0.35 * Math.sin(b * Math.PI * 3) * decay,
    squash: Math.max(0, 1 - b * 5) * decay,
    blur: 0,
    impact: decay,
    opacity: 1,
  };
}

/**
 * The leap. A quick crouch — which shoves the pile down, the way pushing off
 * does — then a launch that decelerates as it climbs, the mirror of the fall.
 */
function leaping(t: number): Motion {
  if (t >= 1) return OFF_STAGE;
  if (t <= 0) return AT_REST;

  if (t < CROUCH_PORTION) {
    const c = t / CROUCH_PORTION;
    const compress = Math.sin(c * Math.PI);
    return {
      y: 0,
      tilt: 0,
      squash: compress,
      blur: 0,
      // The push-off is felt by everything underneath.
      impact: compress * 0.7,
      opacity: 1,
    };
  }

  const u = (t - CROUCH_PORTION) / (1 - CROUCH_PORTION);
  return {
    // Fast off the pile, slowing as it climbs — thrown, not lifted.
    y: -DROP_DISTANCE * (2 * u - u * u),
    tilt: AIR_TILT * u,
    // Stretches as it launches, the opposite of the landing squash.
    squash: -Math.max(0, 1 - u * 4) * 0.6,
    blur: Math.min(3.5, (1 - u) * 4),
    impact: 0,
    opacity: 1 - clamp01((u - 0.55) / 0.45),
  };
}

function motionOf(dir: Direction, t: number) {
  return dir === 'down' ? falling(t) : leaping(t);
}

function durationOf(dir: Direction) {
  return dir === 'down' ? FALL_DURATION : RISE_DURATION;
}

/**
 * The intro's fact stickers, assembled by scroll. The bottom block is on the
 * floor throughout; the rest drop in from above and land on the pile as the
 * page scrolls down, and leap back off it when the page scrolls up.
 *
 * Scroll only ever decides a block's *direction*. The flight itself runs on
 * its own clock, so a slow scroll can never leave a block hanging mid-air.
 */
export function FactStickerStack({
  stickers,
  /**
   * `rail` fills its absolutely-positioned parent and pins the cluster under
   * the nav; `inline` is the plain in-flow cluster used on narrow screens.
   * Either way the measured root is the full-height element, not the pinned
   * one.
   */
  variant = 'inline',
}: {
  stickers: FactSticker[];
  variant?: 'rail' | 'inline';
}) {
  const total = stickers.length;

  const rootRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  /** Per-block flight: which way it is going and when it set off. */
  const flights = useRef<({ dir: Direction; at: number } | undefined)[]>([]);
  const lastMove = useRef(0);
  const raf = useRef(0);

  // Re-render source while anything is still moving.
  const [, tick] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    // No flight for reduced motion — the finished pile, immediately.
    if (reducedMotion) {
      flights.current = stickers.map(() => ({ dir: 'down', at: -Infinity }));
      tick((n) => n + 1);
      return;
    }

    let scrollFrame = 0;

    /** Runs only while a block is in flight, then stops on its own. */
    const animate = () => {
      const now = performance.now();
      const moving = flights.current.some(
        (f) => f !== undefined && now - f.at < durationOf(f.dir),
      );
      tick((n) => n + 1);
      raf.current = moving ? requestAnimationFrame(animate) : 0;
    };

    const startAnimating = () => {
      if (!raf.current) raf.current = requestAnimationFrame(animate);
    };

    const measure = () => {
      scrollFrame = 0;
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();

      let progress: number;
      if (variant === 'rail') {
        // The root spans the whole pinned region, so distance scrolled past
        // its top edge is the natural clock.
        progress = clamp01(-rect.top / Math.max(1, rect.height * ASSEMBLE_OVER));
      } else {
        // Inline: the root is only as tall as the cluster, so drive it off the
        // viewport instead — the pile assembles as it rises into view.
        const vh = window.innerHeight || 1;
        progress = clamp01((vh * 0.85 - rect.top) / (vh * 0.55));
      }

      // Which blocks should be on the pile at this scroll position, and which
      // of them disagree with where they are actually headed.
      const falls: number[] = [];
      const leaps: number[] = [];

      for (let i = 0; i < total - 1; i += 1) {
        const wanted: Direction =
          progress >= releaseAt(total - 2 - i, total - 1) ? 'down' : 'up';
        const current = flights.current[i];
        // Nothing to do if it is already going that way — or, for a block
        // that has never moved, if it is already parked off-stage.
        if (current ? current.dir === wanted : wanted === 'up') continue;
        (wanted === 'down' ? falls : leaps).push(i);
      }

      if (!falls.length && !leaps.length) return;

      // A fast scroll crosses several thresholds at once. Order the moves so
      // the pile still builds bottom-up and unbuilds top-down, and space them
      // out so they never move as a block.
      falls.sort((a, b) => b - a);
      leaps.sort((a, b) => a - b);

      const now = performance.now();
      for (const i of [...falls, ...leaps]) {
        const dir: Direction = falls.includes(i) ? 'down' : 'up';
        const prev = flights.current[i];
        const prevT = prev ? clamp01((now - prev.at) / durationOf(prev.dir)) : 1;

        // A block caught mid-flight reverses from where it is rather than
        // queueing: the two curves are mirror images, so entering the new one
        // at 1 − t keeps the height continuous. Only settled blocks queue.
        const at =
          prevT < 1
            ? now - (1 - prevT) * durationOf(dir)
            : Math.max(now, lastMove.current + STAGGER);

        flights.current[i] = { dir, at };
        lastMove.current = Math.max(lastMove.current, at);
      }

      startAnimating();
    };

    const onScroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reducedMotion, variant, total, stickers]);

  const now = typeof performance === 'undefined' ? 0 : performance.now();

  /** Where a block is right now. Unmoved blocks are parked off-stage. */
  const motionAt = (index: number): Motion => {
    if (index === total - 1) return AT_REST;
    const f = flights.current[index];
    if (!f) return OFF_STAGE;
    return motionOf(f.dir, clamp01((now - f.at) / durationOf(f.dir)));
  };

  return (
    <div ref={rootRef} className={variant === 'rail' ? 'h-full' : undefined}>
      <div
        className={cn(
          'flex flex-col items-center gap-4 pb-8',
          variant === 'rail' && 'sticky top-24 pt-14',
        )}
      >
        {stickers.map((s, i) => {
          const isFloor = i === total - 1;
          const m = motionAt(i);

          // Whatever is already on the pile absorbs each landing and each
          // push-off above it, damped by how deep in the stack it sits.
          let shock = 0;
          for (let above = 0; above < i; above += 1) {
            const { impact } = motionAt(above);
            if (impact > 0) shock += impact * Math.pow(0.55, i - above);
          }
          shock = Math.min(1, shock);

          const y = m.y + shock * 5;
          const squash = m.squash >= 0 ? Math.max(m.squash, shock * 0.45) : m.squash;
          const scaleY = 1 - squash * 0.14;
          const scaleX = 1 + squash * 0.09;
          const still = m === AT_REST || m === OFF_STAGE;

          return (
            <div
              key={s.label}
              className="relative"
              style={{
                // Later arrivals sit on top of the pile.
                zIndex: total - i,
                // Squash compresses toward the contact point, not the centre.
                transformOrigin: 'center bottom',
                transform: `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`,
                opacity: m.opacity,
                filter: m.blur > 0.05 ? `blur(${m.blur.toFixed(2)}px)` : undefined,
                willChange: still && !shock ? undefined : 'transform, opacity, filter',
              }}
            >
              <Sticker
                accent={s.accent}
                rotate={s.rotate + m.tilt}
                caption={s.caption}
                className={
                  'px-6 py-3.5 [&>span:first-child]:text-[clamp(1.35rem,3.2vw,2.15rem)] [&>span:last-child]:mt-1.5 [&>span:last-child]:text-[0.6875rem]' +
                  (isFloor ? ' relative z-10 shadow-none' : '')
                }
              >
                {s.label}
              </Sticker>

              {isFloor ? (
                <>
                  {/*
                   * Floor contact — sits below the sticker (not behind it).
                   * Cream, not black: black-on-ink (#0b0b0b) disappears.
                   */}
                  <span
                    aria-hidden="true"
                    className="bg-lime/25 pointer-events-none absolute -bottom-7 left-1/2 z-0 h-6 w-[110%] -translate-x-1/2 rounded-[100%] blur-lg"
                  />
                  <span
                    aria-hidden="true"
                    className="bg-on-ink/40 pointer-events-none absolute -bottom-5 left-1/2 z-0 h-3 w-[78%] -translate-x-1/2 rounded-[100%] blur-[3px]"
                  />
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
