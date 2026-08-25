import type { Metadata, Viewport } from 'next';
import { Noto_Serif_JP, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import '../globals.css';
import './dojo.css';
import { site } from '@/lib/site';

/* A different world needs a different voice. The portfolio runs Anton and
   Archivo; the dojo runs a heavy Japanese serif over IBM Plex, which is most of
   why the two pages do not read as the same site. */
const serifJp = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-serif-jp',
  display: 'swap',
});

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-sans',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  robots: { index: true, follow: true },
};

/* The dojo is a dark room by design, so the browser chrome is told that once
   rather than per colour scheme. */
export const viewport: Viewport = {
  themeColor: '#0a0c11',
};

/**
 * A second root layout, sibling to the portfolio's. It renders its own html and
 * body, so `/miyagi` inherits no nav, no footer, no Ask George widget and none
 * of the site's tone tokens. `data-theme="dark"` is pinned because the dojo
 * commits to one look instead of following the OS.
 */
export default function MiyagiLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body
        className={`dojo ${serifJp.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}
      >
        <div className="dojo-ground" aria-hidden="true" />
        <a
          href="#main"
          className="dojo-mono sr-only rounded px-4 py-2 text-xs uppercase focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
          style={{ background: 'var(--seal)', color: '#fff' }}
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
