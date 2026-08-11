import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-[1em] w-[1em] shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
    >
      <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

type ArrowLinkProps = ComponentProps<typeof Link> & {
  children: ReactNode;
  /** Underlined text link (the reference's "GET IN TOUCH →"). */
  variant?: 'underline' | 'solid' | 'outline';
};

export function ArrowLink({ children, className, variant = 'underline', ...props }: ArrowLinkProps) {
  return (
    <Link
      {...props}
      className={cn(
        'group font-mono inline-flex w-fit items-center gap-2.5 text-micro font-semibold tracking-[0.1em] uppercase',
        variant === 'underline' && 'underline decoration-2 underline-offset-[6px] hover:decoration-cyan',
        variant === 'solid' &&
          'bg-cyan text-ink-fixed rounded-full px-5 py-3 no-underline transition-colors hover:bg-lime',
        variant === 'outline' &&
          'rounded-full border border-current/35 px-5 py-3 transition-colors hover:border-current',
        className,
      )}
    >
      {children}
      <Arrow />
    </Link>
  );
}
