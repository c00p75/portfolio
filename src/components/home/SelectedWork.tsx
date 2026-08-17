import Image from 'next/image';
import Link from 'next/link';
import { adrsByProject, type Project } from '@/lib/content';
import { StatusPill } from '@/components/work/ProjectCard';
import { accentSurface, accentText, Tag } from '@/components/ui/Sticker';
import { cn } from '@/lib/cn';

type VeliteImage = { src: string; width?: number; height?: number };

const accentHover: Record<Project['accent'], string> = {
  cyan: 'group-hover:text-cyan',
  pink: 'group-hover:text-pink',
  yellow: 'group-hover:text-yellow',
  orange: 'group-hover:text-orange',
  lime: 'group-hover:text-lime',
};

/**
 * Row thumbnail. Projects without a screenshot get a typed plate rather than a
 * borrowed image: the plate names what the project is, which is more use than a
 * stand-in shot of something else.
 */
function RowThumb({ project }: { project: Project }) {
  const cover = project.cover as VeliteImage | undefined;

  if (!cover) {
    const shipping = project.status === 'in-build' || project.status === 'prototype';
    return (
      <div
        className={cn(
          'border-ink-line relative grid aspect-16/10 place-content-center gap-2 overflow-hidden rounded-md border px-4 text-center',
          accentText[project.accent],
        )}
      >
        <span
          aria-hidden="true"
          className={cn('absolute inset-0 opacity-[0.07]', accentSurface[project.accent])}
        />
        <span className="font-display relative text-xl leading-tight uppercase">
          {project.disciplines.slice(0, 2).join(' · ')}
        </span>
        <span className="font-mono text-on-ink-muted relative text-[0.5625rem] tracking-[0.08em] uppercase">
          {shipping ? 'Interface in build' : 'Backend service'}
        </span>
      </div>
    );
  }

  return (
    <div className="border-ink-line relative aspect-16/10 overflow-hidden rounded-md border bg-black/30">
      <Image
        src={cover.src}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 15rem"
        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
      />
      <span className="sr-only">{project.title} interface</span>
    </div>
  );
}

/**
 * Four equal rows rather than a lead card plus runners-up: not every project has
 * a cover image, so promoting one of them to a half-width hero shot left a hole
 * in the layout and made the rest read as offcuts.
 */
export function SelectedWork({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return <p className="text-on-ink mt-12 text-sm">No projects published yet.</p>;
  }

  return (
    <ol className="mt-12 flex flex-col gap-px overflow-hidden rounded-panel bg-current/10">
      {projects.map((project, i) => {
        const decisions = adrsByProject(project.slug).length;
        const live = project.links.find((l) => l.kind === 'live');

        return (
          <li key={project.slug} className="group bg-ink-soft relative">
            {/* Colour spine: the fastest way to tell the four rows apart. */}
            <span
              aria-hidden="true"
              className={cn(
                'absolute inset-y-0 left-0 w-1.5 transition-[width] duration-300 group-hover:w-3',
                accentSurface[project.accent],
              )}
            />

            <Link
              href={project.url}
              className="grid gap-x-8 gap-y-4 py-8 pr-7 pl-8 sm:py-10 sm:pr-9 sm:pl-11 lg:gap-y-6 lg:grid-cols-[3.5rem_minmax(0,1fr)_15rem_11rem] lg:items-start"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'font-display text-[1.75rem] leading-[0.8] lg:text-[3.25rem]',
                  accentText[project.accent],
                )}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="min-w-0">
                <h3
                  className={cn(
                    'font-display text-title uppercase transition-colors sm:text-[2.5rem] sm:leading-[0.95]',
                    accentHover[project.accent],
                  )}
                >
                  {project.title}
                </h3>
                <p className="text-on-ink mt-3 max-w-xl text-base leading-relaxed text-pretty">
                  {project.tagline}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {project.stack.slice(0, 5).map((s) => (
                    <li key={s}>
                      <Tag>{s}</Tag>
                    </li>
                  ))}
                  {project.stack.length > 5 ? (
                    <li>
                      <Tag>+{project.stack.length - 5}</Tag>
                    </li>
                  ) : null}
                </ul>
              </div>

              <RowThumb project={project} />

              <div className="font-mono text-on-ink-muted flex flex-wrap items-center gap-x-4 gap-y-2.5 text-micro uppercase lg:flex-col lg:items-end lg:gap-2.5 lg:text-right">
                <StatusPill status={project.status} />
                <span>{project.period}</span>
                {live ? <span>Live site</span> : null}
                {decisions > 0 ? (
                  <span>
                    {decisions} decision record{decisions === 1 ? '' : 's'}
                  </span>
                ) : null}
                <span className={cn('transition-colors lg:mt-2', accentHover[project.accent])}>
                  Case study →
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
