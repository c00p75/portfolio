import type { Metadata } from 'next';
import Link from 'next/link';
import { VT323, IBM_Plex_Mono } from 'next/font/google';
import './terminal.css';
import { VariantBar } from '@/components/miyagi/VariantBar';
import { TerminalReplay } from '@/components/miyagi/TerminalReplay';
import { AskMiyagi } from '@/components/miyagi/AskMiyagi';
import { MIYAGI, CONFIG_JSON, CLIENTS, CARD_PARTS, TOOLS, SAFETY, TITLES, FACTS, XP_LINE } from '@/lib/miyagi';

const vt = VT323({ subsets: ['latin'], weight: '400', variable: '--font-vt', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Miyagi · terminal styling',
  description: MIYAGI.tagline,
  robots: { index: false, follow: false },
};

/** A titled frame, which is the only container this variant uses. */
function Box({
  legend,
  children,
  className = '',
}: {
  legend: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`tui-box mt-12 p-6 sm:p-8 ${className}`}>
      <span className="tui-legend">{legend}</span>
      {children}
    </section>
  );
}

const BANNER = `        _                   _
  _ __ (_)_   _  __ _  __ _(_)
 | '_ \\| | | | |/ _\` |/ _\` | |
 | | | | | |_| | (_| | (_| | |
 |_| |_|_|\\__, |\\__,_|\\__, |_|
          |___/       |___/`;

export default function TerminalVariant() {
  return (
    <div className={`tui ${vt.variable} ${mono.variable}`}>
      <div className="tui-crt" aria-hidden="true" />
      <VariantBar current="/miyagi/terminal" />

      <main id="main" className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        {/* Boot banner */}
        <section className="pt-14">
          <pre
            className="tui-display overflow-x-auto text-[0.6rem] leading-tight sm:text-sm"
            aria-label="miyagi"
          >
            {BANNER}
          </pre>

          <p className="tui-dim mt-6">
            <span className="tui-amber">miyagi</span> {MIYAGI.pkg} {MIYAGI.version} · {MIYAGI.license} ·{' '}
            {TOOLS.length} tools over stdio
          </p>

          <p className="mt-6 max-w-2xl">{MIYAGI.blurb}</p>

          <p className="tui-prompt mt-8">
            <span className="tui-amber">{MIYAGI.install}</span>
            <span className="tui-caret ml-1" />
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={MIYAGI.npm} target="_blank" rel="noreferrer" className="tui-btn tui-btn-amber">
              [i] install
            </a>
            <a href={MIYAGI.repo} target="_blank" rel="noreferrer" className="tui-btn">
              [s] source
            </a>
          </div>
        </section>

        <Box legend="status">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FACTS.map((f) => (
              <div key={f.label}>
                <p className="tui-display text-3xl">{f.value}</p>
                <p className="tui-dim mt-1 text-sm">{f.label}</p>
              </div>
            ))}
          </div>
        </Box>

        <Box legend="live session">
          <p className="tui-dim">
            Captured output, replayed. Not a mock-up, which on a page about a teaching tool is the
            first thing you would check.
          </p>
          <TerminalReplay className="mt-6" />
        </Box>

        <Box legend="ranks">
          <ul className="space-y-2">
            {TITLES.map((t, i) => (
              <li key={t.name} className="flex flex-wrap items-baseline gap-x-4">
                <span className="tui-meter">
                  [{'█'.repeat(i + 1)}{'░'.repeat(4 - (i + 1))}]
                </span>
                <span className="tui-amber">{t.name}</span>
                <span className="tui-faint text-sm">{t.at}</span>
              </li>
            ))}
          </ul>
          <p className="tui-dim mt-5 text-sm">{XP_LINE}</p>
        </Box>

        <Box legend="01 · setup">
          <p className="tui-dim">Add this to your client. No keys, no account.</p>
          <pre className="tui-amber mt-5 overflow-x-auto text-sm leading-relaxed">
            <code>{CONFIG_JSON}</code>
          </pre>
          <table className="mt-7 w-full text-left text-sm">
            <tbody>
              {CLIENTS.map((c) => (
                <tr key={c.client} style={{ borderTop: '1px solid var(--green-faint)' }}>
                  <td className="py-3 pr-6 align-top">{c.client}</td>
                  <td className="tui-faint py-3 align-top text-xs break-all">{c.where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Box legend="02 · what a card contains">
          <ul className="space-y-4">
            {CARD_PARTS.map((c, i) => (
              <li key={c.part}>
                <p>
                  <span className="tui-faint">{String(i + 1).padStart(2, '0')}</span>{' '}
                  <span className="tui-amber">{c.part}</span>
                </p>
                <p className="tui-dim pl-7 text-sm">{c.detail}</p>
              </li>
            ))}
          </ul>
        </Box>

        <Box legend="03 · warning">
          <p className="tui-dim">
            It executes shell commands on your machine. Read this before you install it.
          </p>
          <ul className="mt-6 space-y-5">
            {SAFETY.map((s) => (
              <li key={s.head}>
                <p className="tui-amber">! {s.head}</p>
                <p className="tui-dim pl-4 text-sm">{s.body}</p>
              </li>
            ))}
          </ul>
        </Box>

        <Box legend="04 · tools">
          <ul className="space-y-3">
            {TOOLS.map((t) => (
              <li key={t.name} className="sm:flex sm:gap-6">
                <code className="tui-amber block shrink-0 sm:w-72">{t.name}</code>
                <span className="tui-dim text-sm">{t.detail}</span>
              </li>
            ))}
          </ul>
        </Box>

        <Box legend="05 · ask">
          <AskMiyagi />
        </Box>

        <footer className="mt-14">
          <p className="tui-faint text-sm">
            ── {MIYAGI.pkg} ─ {MIYAGI.license} ─ built by George M&apos;sapenda ──
          </p>
          <nav className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href={MIYAGI.npm} target="_blank" rel="noreferrer" className="tui-link">npm</a>
            <a href={MIYAGI.repo} target="_blank" rel="noreferrer" className="tui-link">source</a>
            <a href={MIYAGI.issues} target="_blank" rel="noreferrer" className="tui-link">issues</a>
            <Link href="/work/miyagi" className="tui-link">write-up</Link>
            <Link href="/" className="tui-link">portfolio</Link>
          </nav>
        </footer>
      </main>
    </div>
  );
}
