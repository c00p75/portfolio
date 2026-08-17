import type { Metadata, Viewport } from 'next';
import { Anton, Archivo, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/site';
import { NavBar } from '@/components/chrome/NavBar';
import { Footer } from '@/components/chrome/Footer';
import { ThemeScript } from '@/components/chrome/ThemeScript';
import { AskGeorgeWidget } from '@/components/ask/AskGeorge';
import { indexMeta } from '@/lib/rag/index-loader';

/* Anton carries the ultra-condensed display voice; Archivo is the grotesque
   companion for body copy; JetBrains Mono handles labels and telemetry. */
const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
});

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-jb',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [{ url: '/social-banner.jpg', width: 1200, height: 630, alt: site.title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
    images: ['/social-banner.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#626264' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const meta = indexMeta();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${anton.variable} ${archivo.variable} ${jetbrains.variable} antialiased`}>
        <a
          href="#main"
          className="bg-cyan text-ink font-mono sr-only rounded-full px-4 py-2 text-micro font-bold uppercase focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
        >
          Skip to content
        </a>
        <NavBar />
        <main id="main">{children}</main>
        <Footer />
        <AskGeorgeWidget indexChunks={meta.chunks} />
      </body>
    </html>
  );
}
