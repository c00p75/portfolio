import type { Metadata } from 'next';
import Link from 'next/link';
import { Press_Start_2P, Outfit, IBM_Plex_Mono } from 'next/font/google';
import './arcade.css';
import { VariantBar } from '@/components/miyagi/VariantBar';
import { TerminalReplay } from '@/components/miyagi/TerminalReplay';
import { AskMiyagi } from '@/components/miyagi/AskMiyagi';
import { MIYAGI, CONFIG_JSON, CLIENTS, CARD_PARTS, TOOLS, SAFETY, TITLES, FACTS } from '@/lib/miyagi';

const press = Press_Start_2P({ subsets: ['latin'], weight: '400', variable: '--font-press', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Miyagi · arcade styling',
  description: MIYAGI.tagline,
  robots: { index: false, follow: false },
};

export default function ArcadeVariant() {
  return (
    <div className={`arc ${press.variable} ${outfit.variable} ${mono.variable}`}>
      <div className="arc-sky" aria-hidden="true" />
      <div className="arc-grid" aria-hidden="true" />
      <VariantBar current="/miyagi/arcade" />

      <main id="main" className="relative mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        {/* Hero */}
        <section className="pt-16 sm:pt-24">
          <p className="arc-kicker">Insert coin · MCP server · MIT</p>
          <h1 className="arc-pixel arc-glow-mag mt-7 text-[clamp(1.8rem,7vw,4.5rem)]">MIYAGI</h1>
          <p className="arc-pixel arc-glow-cyan mt-5 text-[clamp(0.6rem,1.7vw,0.95rem)]">
            WAX ON · WAX OFF
          </p>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed" style={{ color: 'var(--dim)' }}>
            {MIYAGI.blurb}
          </p>

          {/* Player card */}
          <div className="arc-panel mt-10 p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="arc-kicker">Player</p>
                <p className="arc-pixel mt-3 text-sm sm:text-base">TERMINAL NOVICE</p>
              </div>
              <p className="arc-pixel arc-glow-cyan text-xs sm:text-sm">LV 1 · 40 XP</p>
            </div>
            <div className="arc-xp mt-5" role="img" aria-label="40 of 100 XP toward level 2">
              <span style={{ width: '40%', ['--w' as string]: '40%' }} />
            </div>
            <p className="mt-3 text-sm" style={{ color: 'var(--dim)' }}>
              15 XP a command, 25 for a correct quiz answer with a streak multiplier, level is XP
              over 100. Saved to disk, so a restart costs you nothing.
            </p>
          </div>

          <div className="mt-9 flex flex-wrap gap-4">
            <a href={MIYAGI.npm} target="_blank" rel="noreferrer" className="arc-btn arc-btn-solid">
              Install
            </a>
            <a href={MIYAGI.repo} target="_blank" rel="noreferrer" className="arc-btn arc-btn-ghost">
              Source
            </a>
          </div>

          <div className="arc-panel mt-8 p-4">
            <code className="font-mono text-sm" style={{ color: 'var(--lime)' }}>
              $ {MIYAGI.install}
            </code>
          </div>
        </section>

        {/* Live demo */}
        <section className="pt-20">
          <p className="arc-kicker">Attract mode</p>
          <h2 className="arc-pixel mt-5 text-[clamp(0.9rem,2.6vw,1.6rem)]">A REAL SESSION</h2>
          <p className="mt-5 max-w-2xl" style={{ color: 'var(--dim)' }}>
            Captured output, not a mock-up. Watch it run a command, hand back a card, mark a quiz,
            then refuse to delete anything.
          </p>
          <TerminalReplay
            className="mt-8"
            /* Re-tone the shared console for the cabinet. */
          />
        </section>

        {/* Stats */}
        <section className="pt-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FACTS.map((f) => (
              <div key={f.label} className="arc-panel p-6 text-center">
                <p className="arc-pixel arc-glow-mag text-2xl">{f.value}</p>
                <p className="mt-3 text-sm" style={{ color: 'var(--dim)' }}>
                  {f.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Ranks */}
        <section className="pt-20">
          <p className="arc-kicker">Ranks</p>
          <h2 className="arc-pixel mt-5 text-[clamp(0.9rem,2.6vw,1.6rem)]">CLIMB THE LADDER</h2>
          <div className="arc-marquee mt-8">
            <div className="arc-track">
              {[...TITLES, ...TITLES].map((t, i) => (
                <span key={i} className="arc-chip">
                  {t.name} · {t.at}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Setup */}
        <section className="pt-20">
          <p className="arc-kicker">Level 01 · Setup</p>
          <h2 className="arc-pixel mt-5 text-[clamp(0.9rem,2.6vw,1.6rem)]">THREE LINES</h2>
          <p className="mt-5 max-w-2xl" style={{ color: 'var(--dim)' }}>
            No keys, no account. It runs on your machine, so your client only needs permission to
            start it.
          </p>
          <div className="arc-panel mt-7 overflow-x-auto p-5">
            <pre className="font-mono text-sm leading-relaxed" style={{ color: 'var(--lime)' }}>
              <code>{CONFIG_JSON}</code>
            </pre>
          </div>
          <div className="arc-panel mt-5 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <tbody>
                {CLIENTS.map((c) => (
                  <tr key={c.client} style={{ borderTop: '1px solid var(--line)' }}>
                    <td className="p-4 align-top">{c.client}</td>
                    <td className="p-4 align-top font-mono text-xs break-all" style={{ color: 'var(--dim)' }}>
                      {c.where}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Card anatomy */}
        <section className="pt-20">
          <p className="arc-kicker">Level 02 · Loot</p>
          <h2 className="arc-pixel mt-5 text-[clamp(0.9rem,2.6vw,1.6rem)]">WHAT A CARD DROPS</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CARD_PARTS.map((c, i) => (
              <div key={c.part} className="arc-panel p-6">
                <p className="arc-pixel arc-glow-cyan text-xs">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-4 text-lg font-semibold">{c.part}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--dim)' }}>
                  {c.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Safety */}
        <section className="pt-20">
          <p className="arc-kicker">Level 03 · Read this first</p>
          <h2 className="arc-pixel mt-5 text-[clamp(0.9rem,2.6vw,1.6rem)]">IT RUNS SHELL COMMANDS</h2>
          <p className="mt-5 max-w-2xl" style={{ color: 'var(--dim)' }}>
            The cabinet is fun. This part is not a joke, so it is written straight: what the
            protection is, and where it stops.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {SAFETY.map((s) => (
              <div key={s.head} className="arc-panel p-6">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--gold)' }}>
                  {s.head}
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--dim)' }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tools */}
        <section className="pt-20">
          <p className="arc-kicker">Level 04 · Moves</p>
          <h2 className="arc-pixel mt-5 text-[clamp(0.9rem,2.6vw,1.6rem)]">EIGHT TOOLS</h2>
          <div className="arc-panel mt-8 divide-y" style={{ borderColor: 'var(--line)' }}>
            {TOOLS.map((t) => (
              <div key={t.name} className="p-5 sm:flex sm:gap-8" style={{ borderColor: 'var(--line)' }}>
                <code className="block shrink-0 font-mono text-sm sm:w-72" style={{ color: 'var(--mag)' }}>
                  {t.name}
                </code>
                <p className="mt-2 text-sm sm:mt-0" style={{ color: 'var(--dim)' }}>
                  {t.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Ask */}
        <section className="pt-20">
          <p className="arc-kicker">Level 05 · Ask</p>
          <h2 className="arc-pixel mt-5 mb-8 text-[clamp(0.9rem,2.6vw,1.6rem)]">QUESTIONS?</h2>
          <AskMiyagi />
        </section>

        <footer className="mt-24 border-t pt-10" style={{ borderColor: 'var(--line)' }}>
          <p className="arc-pixel text-[0.55rem]" style={{ color: 'var(--dim)' }}>
            {MIYAGI.pkg} · {MIYAGI.license}
          </p>
          <nav className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href={MIYAGI.npm} target="_blank" rel="noreferrer" className="arc-link">npm</a>
            <a href={MIYAGI.repo} target="_blank" rel="noreferrer" className="arc-link">Source</a>
            <a href={MIYAGI.issues} target="_blank" rel="noreferrer" className="arc-link">Issues</a>
            <Link href="/work/miyagi" className="arc-link">How it was built</Link>
            <Link href="/" className="arc-link">George M&apos;sapenda</Link>
          </nav>
        </footer>
      </main>
    </div>
  );
}
