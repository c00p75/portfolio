import * as runtime from 'react/jsx-runtime';
import Link from 'next/link';
import type { ComponentProps, ComponentType } from 'react';
import { cn } from '@/lib/cn';

type MDXComponents = Record<string, ComponentType<Record<string, unknown>>>;
type Compiled = ComponentType<{ components?: MDXComponents }>;

/**
 * Compiled MDX is cached by source so a given document yields the *same*
 * component identity on every render. Without this, each render would construct
 * a fresh component type and React would remount the whole subtree.
 */
const cache = new Map<string, Compiled>();

/**
 * Velite compiles MDX to a function body that closes over a JSX runtime, so
 * building the component means evaluating our own build output — not user
 * input. This is the intended usage for this pipeline.
 */
function getMDXComponent(code: string): Compiled {
  const cached = cache.get(code);
  if (cached) return cached;
  const compiled = (new Function(code)({ ...runtime }) as { default: Compiled }).default;
  cache.set(code, compiled);
  return compiled;
}

/** Internal links route through next/link; external ones get safe rel attributes. */
function Anchor({ href = '', ...props }: ComponentProps<'a'>) {
  if (href.startsWith('/')) return <Link href={href} {...props} />;
  if (href.startsWith('#')) return <a href={href} {...props} />;
  return <a href={href} target="_blank" rel="noreferrer noopener" {...props} />;
}

/* Wide code and tables scroll inside their own box so the page never scrolls
   sideways on mobile. */
function Pre(props: ComponentProps<'pre'>) {
  return <pre {...props} className={cn('scroll-x', props.className)} />;
}

function Table(props: ComponentProps<'table'>) {
  return (
    <div className="scroll-x my-8">
      <table {...props} />
    </div>
  );
}

const components = { a: Anchor, pre: Pre, table: Table } as unknown as MDXComponents;

export function MDXContent({ code, className }: { code: string; className?: string }) {
  /*
   * The static-components rule fires on any component-typed value produced by a
   * call during render and cannot see through the module-level cache above. The
   * identity it exists to protect *is* stable here: the same `code` string
   * always returns the same component instance, so no remount occurs. Compiling
   * MDX at runtime is unavoidable with this content pipeline — the compiled
   * output is a function body, not a static import.
   */
  const Compiled = getMDXComponent(code);
  return (
    <div className={cn('prose-architect', className)}>
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Compiled components={components} />
    </div>
  );
}
