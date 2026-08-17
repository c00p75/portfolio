'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export type TocEntry = {
  title: string;
  url: string;
  items?: TocEntry[];
};

/** Flatten to two levels — deeper nesting turns a rail into an outline. */
function flatten(entries: TocEntry[], depth = 0): { id: string; title: string; depth: number }[] {
  return entries.flatMap((entry) => {
    const id = entry.url.replace(/^#/, '');
    const self = id ? [{ id, title: entry.title, depth }] : [];
    const children = depth < 1 && entry.items?.length ? flatten(entry.items, depth + 1) : [];
    return [...self, ...children];
  });
}

/**
 * The in-page contents rail.
 *
 * Scroll-spy runs off the heading positions rather than IntersectionObserver
 * visibility: a long section can have its heading off-screen for thousands of
 * pixels, and "which heading did I last pass" is the question a reader is
 * actually asking. The active item is whichever heading is closest above the
 * reading line.
 */
export function ArticleToc({ toc, className }: { toc: TocEntry[]; className?: string }) {
  const items = useMemo(() => flatten(toc), [toc]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const frame = useRef(0);

  useEffect(() => {
    if (items.length === 0) return;

    const measure = () => {
      frame.current = 0;
      // The reading line sits below the sticky nav, not at the viewport top.
      const line = 140;
      let current: string | null = null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = item.id;
      }
      // Before the first heading, highlight nothing rather than guessing.
      setActiveId(current);
    };

    const onScroll = () => {
      if (!frame.current) frame.current = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="On this page" className={className}>
      <p className="font-mono text-on-ink-muted text-micro tracking-widest uppercase">
        On this page
      </p>
      <ul className="border-ink-line mt-4 flex flex-col border-l">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? 'location' : undefined}
                className={cn(
                  // The active marker is the left rule going solid, so the
                  // list does not shift as the reader scrolls.
                  '-ml-px block border-l py-1.5 pl-4 text-sm leading-snug text-pretty transition-colors',
                  item.depth > 0 && 'pl-7 text-xs',
                  active
                    ? 'border-cyan text-on-ink'
                    : 'text-on-ink-muted hover:text-on-ink border-transparent',
                )}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
