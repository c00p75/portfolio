'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { accentSurface, type Accent } from '@/components/ui/Sticker';
import { StatusPill } from '@/components/work/ProjectCard';

export type GalleryProject = {
  slug: string;
  url: string;
  title: string;
  tagline: string;
  period: string;
  status: 'production' | 'in-build' | 'prototype' | 'archived';
  category: string;
  categoryLabel: string;
  featured: boolean;
  accent: Accent;
  cover?: { src: string; width?: number; height?: number; blurDataURL?: string };
};

export type GalleryFilter = { key: string; label: string };

/**
 * Every project as one grid of screenshot cards, filtered by what kind of
 * thing it is. Featured projects sort first and carry a badge, so the filter
 * replaces the separate featured / grouped sections rather than adding to them.
 */
export function WorkGallery({
  projects,
  filters,
}: {
  projects: GalleryProject[];
  filters: GalleryFilter[];
}) {
  const [active, setActive] = useState('all');
  const shown = active === 'all' ? projects : projects.filter((p) => p.category === active);
  const all = [{ key: 'all', label: 'All' }, ...filters].map((f) => ({
    ...f,
    count: f.key === 'all' ? projects.length : projects.filter((p) => p.category === f.key).length,
  }));

  return (
    <div className="flex flex-col gap-10">
      <div role="group" aria-label="Filter projects by type" className="flex flex-wrap gap-2">
        {all
          .filter((f) => f.count > 0)
          .map((f) => {
            const on = f.key === active;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(f.key)}
                className={cn(
                  'font-mono min-h-11 rounded-full border px-4.5 text-micro font-bold tracking-[0.08em] uppercase transition-colors',
                  on
                    ? 'border-cyan bg-cyan text-ink'
                    : 'border-ink-line text-on-ink hover:border-cyan',
                )}
              >
                {f.label} <span className="opacity-60">· {f.count}</span>
              </button>
            );
          })}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {shown.length} project{shown.length === 1 ? '' : 's'}
      </p>

      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((p) => (
          <li key={p.slug}>
            <article className="group border-ink-line bg-ink-soft relative flex h-full flex-col overflow-hidden rounded-panel border transition-colors hover:border-current/30">
              <div
                className={cn(
                  'relative aspect-[16/10] overflow-hidden',
                  !p.cover && accentSurface[p.accent],
                )}
              >
                {p.cover ? (
                  <Image
                    src={p.cover.src}
                    width={p.cover.width}
                    height={p.cover.height}
                    placeholder={p.cover.blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={p.cover.blurDataURL}
                    alt=""
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="font-display text-ink absolute inset-x-6 bottom-5 text-5xl leading-[0.9] uppercase"
                  >
                    {p.title}
                  </span>
                )}
                {p.featured ? (
                  <span className="font-mono bg-ink text-yellow absolute top-3 left-3 rounded-full px-2.5 py-1.5 text-[0.6875rem] font-bold tracking-[0.08em] uppercase">
                    Case study
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col gap-2 p-5">
                <div className="font-mono text-on-ink-muted flex justify-between gap-3 text-micro uppercase">
                  <span>{p.categoryLabel}</span>
                  <span>{p.period}</span>
                </div>
                <h3 className="font-display text-3xl leading-none uppercase">
                  <Link href={p.url} className="before:absolute before:inset-0 hover:text-cyan">
                    {p.title}
                  </Link>
                </h3>
                <p className="text-on-ink-muted text-sm leading-relaxed text-pretty">{p.tagline}</p>
                <StatusPill status={p.status} className="mt-auto self-start" />
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
