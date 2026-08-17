'use client';

import { useCallback, useEffect, useState } from 'react';
import { THEME_KEY } from './ThemeScript';
import { cn } from '@/lib/cn';

type Mode = 'light' | 'dark';

/** Listeners for the in-page toggle; the media query is subscribed separately. */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', onChange);
  return () => {
    listeners.delete(onChange);
    media.removeEventListener('change', onChange);
  };
}

function getSnapshot(): Mode {
  const attr = document.documentElement.dataset.theme;
  if (attr === 'dark' || attr === 'light') return attr;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle({ className }: { className?: string }) {
  // Neutral until after mount so the server HTML and the first client paint match.
  // ThemeScript has already applied the real palette; this only chooses the icon.
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    setMode(getSnapshot());
    return subscribe(() => setMode(getSnapshot()));
  }, []);

  const toggle = useCallback(() => {
    const next: Mode = getSnapshot() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* Storage can be unavailable (private mode); the in-page switch still works. */
    }
    for (const notify of listeners) notify();
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode ? `Switch to ${mode === 'dark' ? 'light' : 'dark'} theme` : 'Switch theme'}
      className={cn(
        'grid h-9 w-9 place-items-center rounded-full border border-current/25 transition-colors hover:border-current/60',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        {mode === 'dark' ? (
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
          </g>
        ) : (
          <path
            fill="currentColor"
            d="M20.7 14.6a8.5 8.5 0 0 1-11.3-11.3 1 1 0 0 0-1.3-1.3 10.5 10.5 0 1 0 13.9 13.9 1 1 0 0 0-1.3-1.3Z"
          />
        )}
      </svg>
    </button>
  );
}
