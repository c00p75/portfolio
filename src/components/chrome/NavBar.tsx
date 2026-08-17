'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { site } from '@/lib/site';
import { cn } from '@/lib/cn';
import { ThemeToggle } from './ThemeToggle';

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="text-on-ink flex shrink-0 items-center gap-3 pl-3"
      aria-label={`${site.name} — home`}
    >
      {/* Keycap mark, drawn in CSS rather than set in a keyboard face: two
          rounded outlines with a serif initial centred in each. Squares are
          sized in em off the letter, so the whole mark scales with one font
          size. aria-hidden — the link's own label carries the full name. */}
      <span aria-hidden="true" className="flex items-center gap-[0.22em] text-[1.05rem] sm:text-[1.2rem]">
        <span className="keycap">G</span>
        <span className="keycap">M</span>
      </span>
    </Link>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  /** Hidden while the reader is scrolling down; slides back in on the way up. */
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

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

  /*
   * Hide on the way down, reveal on the way up — the bar is out of the way
   * while reading and one upward flick away when wanted.
   *
   * Measured in a frame rather than in the listener, and only acted on past a
   * few pixels: momentum scrolling reports tiny deltas in both directions, and
   * reading the raw sign would flap the bar on every one of them. Always shown
   * near the top, where there is nothing to scroll back up to.
   */
  useEffect(() => {
    if (open) return;
    let frame = 0;
    lastY.current = window.scrollY;

    const measure = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (Math.abs(delta) < 6) return;
      lastY.current = y;
      setHidden(y > 96 && delta > 0);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
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
      <header
        className={cn(
          'sticky top-0 z-40 pt-3 pb-1 transition-transform ease-out sm:pt-5',
          // Leaves unhurriedly, returns promptly: the exit is incidental to
          // reading, but the return is answering a request.
          hidden && !open ? 'duration-700 -translate-y-[130%]' : 'duration-300',
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-[110rem] items-center justify-between gap-4 px-gutter"
        >
          {/* A black band, per the reference: the chrome reads as the top of
              the ink card rather than as a floating cream pill. */}
          {/* `nav-fold` draws the turned-back top-left corner (see globals.css).
              The wordmark gets extra left padding so it clears the flap. */}
          <div className="nav-fold bg-ink text-on-ink relative flex w-full items-center justify-between gap-6 py-3 pr-3 pl-7 backdrop-blur-md sm:pl-8">
            <Wordmark />

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Plain sentence-case links, generously spaced — the reference
                  has no chips or CTA button up here; Contact is just a link. */}
              <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
                {[...site.nav, { href: '/contact', label: 'Contact' }].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={cn(
                        'text-[0.9375rem] font-medium underline-offset-[6px] transition-colors',
                        isActive(item.href)
                          ? 'text-on-ink underline decoration-cyan decoration-2'
                          : 'text-on-ink hover:text-cyan',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <ThemeToggle className="text-on-ink-muted hover:text-on-ink" />

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="text-on-ink grid h-9 w-9 place-items-center rounded-full border border-current/25 lg:hidden"
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
                    isActive(item.href) ? 'text-cyan' : 'hover:text-cyan',
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
