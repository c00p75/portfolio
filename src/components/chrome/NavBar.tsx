'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { site } from '@/lib/site';
import { cn } from '@/lib/cn';
import { ThemeToggle } from './ThemeToggle';

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="flex shrink-0 items-center gap-3"
      aria-label={`${site.name} — home`}
    >
      {/* The cream pill from the reference layout, standing in for a logotype. */}
      <span aria-hidden="true" className="bg-cream block h-6 w-12 rounded-full sm:h-7 sm:w-14" />
      <span className="text-[0.8125rem] leading-[1.05] font-bold tracking-tight">
        George
        <br />
        M&apos;sapenda
      </span>
    </Link>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  // Close the menu on route change so a tapped link doesn't leave it open.
  // Adjusted during render rather than in an effect: React re-runs this
  // component immediately without committing the stale open state, so the menu
  // never paints over the new page. An effect here would cause a cascading
  // render after paint.
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    if (open) setOpen(false);
  }

  // Lock scroll behind the full-screen menu.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape closes the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-40 pt-3 pb-1 sm:pt-5">
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-[110rem] items-center justify-between gap-4 px-gutter"
        >
          <div className="bg-ink/95 text-on-ink flex w-full items-center justify-between gap-6 rounded-full py-3 pr-3 pl-5 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.7)] backdrop-blur-md sm:pl-6">
            <Wordmark />

            <div className="flex items-center gap-1">
              <ul className="hidden items-center gap-1 lg:flex">
                {site.nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={cn(
                        'font-mono rounded-full px-3.5 py-2 text-micro font-semibold uppercase transition-colors',
                        isActive(item.href)
                          ? 'bg-cyan text-ink-fixed'
                          : 'text-on-ink-muted hover:text-on-ink',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <ThemeToggle className="text-on-ink-muted hover:text-on-ink ml-1" />

              <Link
                href="/contact"
                className="bg-cream text-on-cream font-mono ml-1 hidden rounded-full px-4 py-2.5 text-micro font-bold uppercase transition-colors hover:bg-cyan hover:text-ink-fixed sm:inline-block"
              >
                Get in touch
              </Link>

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="text-on-ink ml-1 grid h-9 w-9 place-items-center rounded-full border border-current/25 lg:hidden"
              >
                <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                  {open ? (
                    <path
                      d="M5 5l14 14M19 5L5 19"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="square"
                    />
                  ) : (
                    <path d="M3 7h18M3 17h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {open ? (
        <div
          id="mobile-menu"
          className="bg-ink text-on-ink fixed inset-0 z-30 flex flex-col justify-center px-gutter pt-24 pb-12 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {[...site.nav, { href: '/contact', label: 'Contact' }].map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'font-display flex items-baseline gap-4 py-2 text-jumbo uppercase transition-colors',
                    isActive(item.href) ? 'text-cyan-ink' : 'hover:text-cyan-ink',
                  )}
                >
                  <span className="font-mono text-on-ink-muted text-micro">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
