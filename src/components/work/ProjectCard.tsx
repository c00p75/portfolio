import Link from 'next/link';
import type { Project } from '@/lib/content';
import { cn } from '@/lib/cn';
import { accentSurface, accentText, Tag } from '@/components/ui/Sticker';
import { ProjectCover } from '@/components/work/ProjectMedia';

/**
 * Status is a deliberate field rather than an implied "shipped". Several of
 * these systems have parts in production and parts still specified-not-built,
 * and a card that quietly implies otherwise is the one thing this section must
 * not do.
 */
const statusLabel: Record<Project['status'], string> = {
  production: 'In production',
  'in-build': 'In build',
  prototype: 'Prototype',
  archived: 'Archived',
};

const statusTone: Record<Project['status'], string> = {
  production: 'bg-lime text-ink',
  'in-build': 'bg-yellow text-ink',
  prototype: 'bg-cyan text-ink',
  archived: 'bg-orange text-ink',
};

export function StatusPill({
  status,
  className,
}: {
  status: Project['status'];
  className?: string;
}) {
  return (
    <span
      className={cn(
        'font-mono inline-block rounded-full px-2.5 py-1 text-[0.625rem] font-bold tracking-[0.08em] uppercase',
        statusTone[status],
        className,
      )}
    >
      {statusLabel[status]}
    </span>
  );
}

/**
 * Portfolio project teaser. Optimised for a hiring scan: name, one line of what
 * it is, role, stack — not a second essay before the case study.
 */
export function ProjectCard({
  project,
  className,
  decisionCount = 0,
  variant = 'featured',
}: {
  project: Project;
  className?: string;
  /** How many decision records sit behind this project, if any. */
  decisionCount?: number;
  /** Featured cards are grid tiles; compact is a denser list row. */
  variant?: 'featured' | 'compact';
}) {
  if (variant === 'compact') {
    return (
      <article
        className={cn(
          'group border-ink-line relative flex flex-col gap-3 border-b py-6 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-8',
          className,
        )}
      >
        <div className="sm:w-52 sm:shrink-0">
          <h3 className="font-display text-xl uppercase">
            <Link href={project.url} className="before:absolute before:inset-0 hover:text-cyan">
              {project.title}
            </Link>
          </h3>
          <p className="font-mono text-on-ink-muted mt-1.5 text-micro uppercase">
            {project.period}
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-on-ink text-sm leading-relaxed text-pretty">{project.tagline}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {project.stack.slice(0, 4).map((s) => (
              <li key={s}>
                <Tag>{s}</Tag>
              </li>
            ))}
          </ul>
        </div>
        <StatusPill status={project.status} className="shrink-0 self-start sm:ml-auto" />
      </article>
    );
  }

  const live = project.links.find((l) => l.kind === 'live');

  return (
    <article
      className={cn(
        'group border-ink-line bg-ink-soft relative flex flex-col overflow-hidden rounded-panel border transition-colors hover:border-current/30',
        className,
      )}
    >
      <span aria-hidden="true" className={cn('block h-1.5 w-full', accentSurface[project.accent])} />
      <ProjectCover cover={project.cover} title={project.title} accent={project.accent} />

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusPill status={project.status} />
          {project.video ? (
            <span className="font-mono text-on-ink-muted text-micro uppercase">Demo video</span>
          ) : null}
          <span className="font-mono text-on-ink-muted ml-auto text-micro uppercase">
            {project.period}
          </span>
        </div>

        <div>
          <h3 className="font-display text-title text-balance uppercase">
            <Link href={project.url} className="before:absolute before:inset-0 hover:text-cyan">
              {project.title}
            </Link>
          </h3>
          <p className={cn('mt-2 text-sm leading-snug text-pretty', accentText[project.accent])}>
            {project.tagline}
          </p>
        </div>

        <p className="text-on-ink text-sm leading-relaxed text-pretty">
          <span className="font-mono text-on-ink-muted mr-2 text-micro uppercase">Role</span>
          {project.role}
        </p>

        <ul className="mt-auto flex flex-wrap gap-2 pt-1">
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

        <p className="font-mono text-on-ink-muted text-micro uppercase">
          {live ? 'Live · ' : ''}
          Case study
          {decisionCount > 0
            ? ` · ${decisionCount} decision record${decisionCount === 1 ? '' : 's'}`
            : ''}{' '}
          →
        </p>
      </div>
    </article>
  );
}
