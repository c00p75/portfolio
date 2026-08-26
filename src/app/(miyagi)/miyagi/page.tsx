import type { Metadata } from 'next';
import Link from 'next/link';
import { Bangers, Barlow, Space_Mono } from 'next/font/google';
import './manga.css';
import { VariantBar } from '@/components/miyagi/VariantBar';
import { TerminalReplay } from '@/components/miyagi/TerminalReplay';
import { AskMiyagi } from '@/components/miyagi/AskMiyagi';
import { SenseiManga } from '@/components/miyagi/SenseiManga';
import { MIYAGI, CONFIG_JSON, CLIENTS, CARD_PARTS, TOOLS, SAFETY, TITLES, FACTS } from '@/lib/miyagi';

const bangers = Bangers({ subsets: ['latin'], weight: '400', variable: '--font-bangers', display: 'swap' });
const barlow = Barlow({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-barlow', display: 'swap' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-space-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Miyagi · a gamified, voice-enabled MCP coding tutor',
  description:
    'An MCP server that teaches terminal work by drilling you rather than doing it for you. Install with npx, works in Claude Desktop, Cursor, Claude Code and Windsurf. Open source, no API keys, nothing dangerous executes.',
  alternates: { canonical: '/miyagi' },
  openGraph: {
    title: 'Miyagi · a gamified, voice-enabled MCP coding tutor',
    description: MIYAGI.tagline,
    url: '/miyagi',
    type: 'website',
  },
};

function Sfx({ children }: { children: string }) {
  return <span className="mng-sfx text-lg sm:text-xl">{children}</span>;
}

export default function MangaVariant() {
  return (
    <div className={`mng ${bangers.variable} ${barlow.variable} ${spaceMono.variable}`}>
      <div className="mng-tone" aria-hidden="true" />
      <VariantBar current="/miyagi" />

      <main id="main" className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        {/* ------------------------------ Splash ----------------------------- */}
        {/* One two-column block, not a stack with a figure wedged into the
            middle of it. The sensei previously sat in his own row between the
            title and the blurb: his height inflated that row into a void while
            the whole right-hand side below him stayed empty. He now runs the
            full height of the hero and everything textual is one column. */}
        <section className="relative pt-14 sm:pt-16">
          <div className="mng-impact" aria-hidden="true" />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,auto)] lg:items-center lg:gap-16">
            <div className="min-w-0">
              <p className="font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--ink-soft)' }}>
                Chapter one · {MIYAGI.pkg} · {MIYAGI.license}
              </p>

              <h1 className="mng-shout mt-4 text-[clamp(3.2rem,11vw,7.5rem)]">
                Miya<span style={{ color: 'var(--red)' }}>gi</span>
              </h1>

              {/* Tail on the trailing edge, pointing at the speaker. Capped
                  narrow so it reads as speech rather than a banner. */}
              <div className="mng-bubble mng-bubble-r mng-tilt-l mt-7 max-w-lg">
                <p className="mng-shout text-2xl sm:text-3xl">Wax on. Wax off.</p>
                <p className="mt-2 text-lg leading-relaxed">
                  You run the commands. I drill you, catch the falls, and keep score.
                </p>
              </div>

              <p className="mt-10 max-w-xl text-lg leading-relaxed">{MIYAGI.blurb}</p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a href={MIYAGI.npm} target="_blank" rel="noreferrer" className="mng-btn mng-btn-red">
                  Install it
                </a>
                <a href={MIYAGI.repo} target="_blank" rel="noreferrer" className="mng-btn mng-btn-ink">
                  Read the source
                </a>
              </div>

              <pre className="mng-code mng-tilt-r mt-8 max-w-md">
                <code>$ {MIYAGI.install}</code>
              </pre>
            </div>

            {/* No frame: the figure stands on the page. Given real presence
                here, since he is the only illustration on the page. */}
            <div className="w-52 justify-self-center sm:w-64 lg:w-[21rem] lg:justify-self-end">
              <SenseiManga className="w-full" id="hero" />
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((f, i) => (
            <div key={f.label} className={`mng-panel p-6 ${i % 2 ? 'mng-tilt-r' : 'mng-tilt-l'}`}>
              <p className="mng-num text-5xl">{f.value}</p>
              <p className="mt-2 font-bold uppercase" style={{ color: 'var(--ink-soft)' }}>
                {f.label}
              </p>
            </div>
          ))}
        </section>

        {/* Demo */}
        <section className="mt-20">
          <Sfx>Watch</Sfx>
          <h2 className="mng-shout mt-4 text-4xl sm:text-6xl">A real training round</h2>
          <p className="mt-4 max-w-2xl text-lg">
            Captured output, replayed. It runs a command, marks a quiz, then flatly refuses to
            delete anything.
          </p>
          <div className="mng-panel mt-8 p-3 sm:p-5">
            <TerminalReplay />
          </div>
        </section>

        {/* Ranks */}
        <section className="mt-20">
          <Sfx>Ranks</Sfx>
          <h2 className="mng-shout mt-4 text-4xl sm:text-6xl">Earn your belt</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TITLES.map((t, i) => (
              <div key={t.name} className={`mng-panel p-6 ${i % 2 ? 'mng-tilt-l' : 'mng-tilt-r'}`}>
                <p className="mng-num text-3xl">{String(i + 1).padStart(2, '0')}</p>
                <p className="mng-shout mt-3 text-2xl">{t.name}</p>
                <p className="font-bold uppercase" style={{ color: 'var(--ink-soft)' }}>
                  {t.at}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-2xl text-lg">
            15 XP a command, 25 for a correct quiz with a streak multiplier, level is XP over 100.
            Saved to disk, so a restart costs you nothing.
          </p>
        </section>

        {/* Setup */}
        <section className="mt-20">
          <Sfx>Setup</Sfx>
          <h2 className="mng-shout mt-4 text-4xl sm:text-6xl">Three lines, any client</h2>
          <pre className="mng-code mt-7">
            <code>{CONFIG_JSON}</code>
          </pre>
          <div className="mng-panel mt-7 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left">
              <tbody>
                {CLIENTS.map((c) => (
                  <tr key={c.client} style={{ borderTop: '2px solid var(--ink)' }}>
                    <td className="p-4 align-top font-bold">{c.client}</td>
                    <td className="p-4 align-top font-mono text-xs break-all" style={{ color: 'var(--ink-soft)' }}>
                      {c.where}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Card parts */}
        <section className="mt-20">
          <Sfx>Every round</Sfx>
          <h2 className="mng-shout mt-4 text-4xl sm:text-6xl">What lands on the page</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CARD_PARTS.map((c, i) => (
              <div key={c.part} className={`mng-panel p-6 ${i % 3 === 1 ? 'mng-tilt-r' : 'mng-tilt-l'}`}>
                <p className="mng-num text-3xl">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mng-shout mt-3 text-2xl">{c.part}</h3>
                <p className="mt-2 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  {c.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Safety */}
        <section className="mt-20">
          <Sfx>Warning</Sfx>
          <h2 className="mng-shout mt-4 text-4xl sm:text-6xl">It runs shell commands</h2>
          <div className="mng-panel-red mt-8 p-6 sm:p-8">
            <p className="text-lg leading-relaxed">
              The art is loud. This part is not. Here is what the protection is, and more usefully,
              where it stops.
            </p>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {SAFETY.map((s, i) => (
              <div key={s.head} className={`mng-panel p-6 ${i % 2 ? 'mng-tilt-r' : 'mng-tilt-l'}`}>
                <h3 className="mng-shout text-2xl">{s.head}</h3>
                <p className="mt-3 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tools */}
        <section className="mt-20">
          <Sfx>Moves</Sfx>
          <h2 className="mng-shout mt-4 text-4xl sm:text-6xl">Eight tools</h2>
          <div className="mng-panel mt-8">
            {TOOLS.map((t, i) => (
              <div
                key={t.name}
                className="p-5 sm:flex sm:gap-8"
                style={{ borderTop: i === 0 ? 'none' : '2px solid var(--ink)' }}
              >
                <code className="block shrink-0 font-mono text-sm font-bold sm:w-72" style={{ color: 'var(--red-deep)' }}>
                  {t.name}
                </code>
                <p className="mt-2 sm:mt-0" style={{ color: 'var(--ink-soft)' }}>
                  {t.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Ask */}
        <section className="mt-20">
          <Sfx>Ask</Sfx>
          <h2 className="mng-shout mt-4 mb-8 text-4xl sm:text-6xl">Questions before you install</h2>
          <AskMiyagi />
        </section>

        <footer className="mt-20 border-t-4 pt-8" style={{ borderColor: 'var(--ink)' }}>
          <div className="flex flex-wrap items-center gap-5">
            <SenseiManga className="w-16 shrink-0" id="foot" />
            <div>
              <p className="mng-shout text-3xl">
                Miya<span style={{ color: 'var(--red)' }}>gi</span>
              </p>
              <p className="font-bold uppercase" style={{ color: 'var(--ink-soft)' }}>
                {MIYAGI.pkg} · {MIYAGI.license}
              </p>
            </div>
          </div>
          <nav className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            <a href={MIYAGI.npm} target="_blank" rel="noreferrer" className="mng-link">npm</a>
            <a href={MIYAGI.repo} target="_blank" rel="noreferrer" className="mng-link">Source</a>
            <a href={MIYAGI.issues} target="_blank" rel="noreferrer" className="mng-link">Issues</a>
            <Link href="/work/miyagi" className="mng-link">How it was built</Link>
            <Link href="/" className="mng-link">George M&apos;sapenda</Link>
          </nav>
        </footer>
      </main>
    </div>
  );
}
