import type { Metadata, Viewport } from 'next';
import '../globals.css';
import './dojo.css';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0a0c11',
};

/**
 * A second root layout, sibling to the portfolio's, so /miyagi and its styling
 * variants inherit none of the site chrome: no nav, no footer, no Ask George,
 * and none of the site's fonts or tone tokens.
 *
 * It deliberately loads no fonts and applies no theme of its own. Each variant
 * owns its palette, its type and its background, which is what keeps five very
 * different pages from bleeding into one another. The body carries only a
 * neutral base colour for the gap before a variant paints.
 */
export default function MiyagiLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className="antialiased" style={{ background: '#0a0c11' }}>
        <a
          href="#main"
          className="sr-only rounded px-4 py-2 text-xs uppercase focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[70]"
          style={{ background: '#d1452a', color: '#fff', fontFamily: 'ui-monospace, monospace' }}
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
