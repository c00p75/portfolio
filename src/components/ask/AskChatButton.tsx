'use client';

import { cn } from '@/lib/cn';
import { openAskGeorge } from './ask-bus';

/**
 * Opens the floating chat widget. The homepage AI section used to carry its own
 * composer panel; the widget is the single entry point now, so the section just
 * needs a way in.
 */
export function AskChatButton({
  question,
  variant = 'solid',
  className,
  children,
}: {
  /** Pre-fills and immediately asks, for the suggested-prompt chips. */
  question?: string;
  variant?: 'solid' | 'outline';
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => openAskGeorge(question)}
      className={cn(
        'font-mono inline-flex w-fit items-center gap-2.5 rounded-full px-5 py-3 text-micro font-semibold tracking-[0.1em] uppercase transition-colors',
        variant === 'solid' && 'ask-ai-border bg-cyan text-ink hover:bg-lime',
        variant === 'outline' && 'border border-current/15 hover:border-current',
        className,
      )}
    >
      {children}
    </button>
  );
}
