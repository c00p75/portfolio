import type { Metadata } from 'next';
import Link from 'next/link';
import { Baloo_2, Nunito_Sans, IBM_Plex_Mono } from 'next/font/google';
import './classroom.css';
import { VariantBar } from '@/components/miyagi/VariantBar';
import { TerminalReplay } from '@/components/miyagi/TerminalReplay';
import { AskMiyagi } from '@/components/miyagi/AskMiyagi';
import { MIYAGI, CONFIG_JSON, CLIENTS, CARD_PARTS, TOOLS, SAFETY, TITLES } from '@/lib/miyagi';

const baloo = Baloo_2({ subsets: ['latin'], variable: '--font-baloo', display: 'swap' });
const nunito = Nunito_Sans({ subsets: ['latin'], variable: '--font-nunito', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Miyagi · classroom styling',
  description: MIYAGI.tagline,
  robots: { index: false, follow: false },
};

/**
 * The mascot. An inline SVG rather than an image file: it themes with the page,
 * scales without artefacts, adds nothing to the asset budget, and there is no
 * licence to worry about.
 */
function Sensei({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 220" className={className} role="img" aria-label="A small sensei in a black belt, holding a broom">
      {/* broom */}
      <g stroke="#8a6a3d" strokeWidth="6" strokeLinecap="round">
        <line x1="152" y1="52" x2="176" y2="168" />
      </g>
      <path d="M168 168 h20 l-4 26 h-20 z" fill="#f5b700" stroke="#8a6400" strokeWidth="3" />
      {/* body / gi */}
      <path d="M62 208 q0-72 38-72 q38 0 38 72 z" fill="#fffdf7" stroke="#1d2733" strokeWidth="5" />
      <path d="M100 136 l-22 72 h44 z" fill="#f7efe0" stroke="#1d2733" strokeWidth="4" />
      {/* belt */}
      <rect x="66" y="176" width="68" height="15" rx="3" fill="#1d2733" />
      <path d="M96 191 l-5 20 M108 191 l5 20" stroke="#1d2733" strokeWidth="6" strokeLinecap="round" />
      {/* head */}
      <circle cx="100" cy="92" r="40" fill="#f6d9b4" stroke="#1d2733" strokeWidth="5" />
      {/* eyebrows and closed, content eyes */}
      <path d="M78 82 q9-7 19-2 M103 80 q10-5 19 2" stroke="#1d2733" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M80 98 q8 7 16 0 M104 98 q8 7 16 0" stroke="#1d2733" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* moustache */}
      <path d="M86 112 q14 9 28 0" stroke="#1d2733" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* headband */}
      <path d="M60 74 q40-16 80 0" stroke="#e0503c" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="100" cy="68" r="7" fill="#e0503c" />
    </svg>
  );
}

/** A progress ring, used for the level and streak read-outs. */
function Ring({
  pct,
  label,
  value,
  color,
}: {
  pct: number;
  label: string;
  value: string;
  color: string;
}) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="text-center">
      <svg viewBox="0 0 100 100" className="mx-auto w-28" role="img" aria-label={`${label}: ${value}`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#ecdfc9" strokeWidth="10" />
        <circle
          className="cls-ring-fill"
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 50 50)"
          style={{ ['--circ' as string]: `${circ}` }}
        />
        <text x="50" y="56" textAnchor="middle" className="cls-round" fontSize="21" fill="#1d2733">
          {value}
        </text>
      </svg>
      <p className="mt-2 text-sm font-bold" style={{ color: 'var(--ink-soft)' }}>
        {label}
      </p>
    </div>
  );
}

export default function ClassroomVariant() {
  return (
    <div className={`cls ${baloo.variable} ${nunito.variable} ${mono.variable}`}>
      <div className="cls-sky" aria-hidden="true" />
      <VariantBar current="/miyagi/classroom" />

      <main id="main" className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        {/* Hero */}
        <section className="grid items-center gap-10 pt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div>
            <span className="cls-pill">Free · open source · {MIYAGI.license}</span>
            <h1 className="cls-round mt-6 text-[clamp(2.6rem,7vw,4.6rem)]">
              Learn the terminal
              <br />
              <span style={{ color: 'var(--teal-ink)' }}>without breaking things</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
              Miyagi sits inside your editor and teaches by handing you one command at a time. You
              type it. It explains what happened, warns you about the traps, then asks you a
              question to make it stick.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a href={MIYAGI.npm} target="_blank" rel="noreferrer" className="cls-btn cls-btn-primary">
                Get started free
              </a>
              <a href={MIYAGI.repo} target="_blank" rel="noreferrer" className="cls-btn cls-btn-ghost">
                See the code
              </a>
            </div>

            <p className="mt-5 text-sm font-semibold" style={{ color: 'var(--ink-soft)' }}>
              No account. No API key. Nothing to configure but three lines.
            </p>
          </div>

          <Sensei className="cls-bob mx-auto w-56 sm:w-72" />
        </section>

        {/* Progress */}
        <section className="cls-card mt-16 p-8 sm:p-10">
          <h2 className="cls-round text-2xl">You can see yourself improving</h2>
          <p className="mt-3 max-w-2xl" style={{ color: 'var(--ink-soft)' }}>
            Every command and every right answer moves a number. It is saved to your machine, so
            closing your editor does not wipe the week you just put in.
          </p>
          <div className="mt-9 grid gap-8 sm:grid-cols-3">
            <Ring pct={40} value="40" label="XP toward level 2" color="var(--teal)" />
            <Ring pct={25} value="1" label="Quiz streak" color="var(--coral)" />
            <Ring pct={10} value="1" label="Level" color="var(--grape)" />
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TITLES.map((t) => (
              <li key={t.name} className="cls-card-warm p-4">
                <p className="cls-round text-lg">{t.name}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--ink-soft)' }}>
                  {t.at}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Live demo */}
        <section className="mt-16">
          <h2 className="cls-round text-3xl">Watch a real lesson</h2>
          <p className="mt-3 max-w-2xl" style={{ color: 'var(--ink-soft)' }}>
            This is genuine captured output, replayed. It runs a command, marks a quiz, then refuses
            to delete anything.
          </p>
          <div className="cls-card mt-7 overflow-hidden p-4 sm:p-6">
            <TerminalReplay />
          </div>
        </section>

        {/* Setup, as numbered steps */}
        <section className="mt-16">
          <h2 className="cls-round text-3xl">Set up in one minute</h2>
          <ol className="mt-8 space-y-6">
            <li className="cls-card flex gap-5 p-6 sm:p-7">
              <span className="cls-step">1</span>
              <div className="min-w-0">
                <h3 className="cls-round text-xl">Open your editor&apos;s MCP config</h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[30rem] text-left text-sm">
                    <tbody>
                      {CLIENTS.map((c) => (
                        <tr key={c.client} style={{ borderTop: '1px solid var(--line)' }}>
                          <td className="py-3 pr-6 align-top font-bold">{c.client}</td>
                          <td className="py-3 align-top font-mono text-xs break-all" style={{ color: 'var(--ink-soft)' }}>
                            {c.where}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </li>
            <li className="cls-card flex gap-5 p-6 sm:p-7">
              <span className="cls-step">2</span>
              <div className="min-w-0 flex-1">
                <h3 className="cls-round text-xl">Paste this in</h3>
                <pre className="cls-code mt-4">
                  <code>{CONFIG_JSON}</code>
                </pre>
              </div>
            </li>
            <li className="cls-card flex gap-5 p-6 sm:p-7">
              <span className="cls-step">3</span>
              <div className="min-w-0">
                <h3 className="cls-round text-xl">Restart, then ask for a lesson</h3>
                <p className="mt-3" style={{ color: 'var(--ink-soft)' }}>
                  Try <em>&ldquo;set my roadmap to Command Line Basics and teach me the first
                  step&rdquo;</em>. It takes it from there.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* What a lesson gives you */}
        <section className="mt-16">
          <h2 className="cls-round text-3xl">What you get every single time</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CARD_PARTS.map((c) => (
              <div key={c.part} className="cls-card p-6">
                <h3 className="cls-round text-lg" style={{ color: 'var(--teal-ink)' }}>
                  {c.part}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  {c.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Safety, framed reassuringly but stated straight */}
        <section className="cls-card-warm mt-16 p-8 sm:p-10">
          <h2 className="cls-round text-3xl">Is it safe? Here is the honest answer</h2>
          <p className="mt-3 max-w-2xl" style={{ color: 'var(--ink-soft)' }}>
            It runs real commands on your computer, so you deserve the full picture rather than
            reassurance.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {SAFETY.map((s) => (
              <div key={s.head} className="cls-card p-6">
                <h3 className="cls-round text-lg">{s.head}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tools */}
        <section className="mt-16">
          <h2 className="cls-round text-3xl">Everything it can do</h2>
          <div className="cls-card mt-8 overflow-hidden">
            {TOOLS.map((t, i) => (
              <div
                key={t.name}
                className="p-5 sm:flex sm:gap-8 sm:p-6"
                style={{ borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}
              >
                <code className="block shrink-0 font-mono text-sm font-bold sm:w-72" style={{ color: 'var(--grape)' }}>
                  {t.name}
                </code>
                <p className="mt-2 text-sm sm:mt-0" style={{ color: 'var(--ink-soft)' }}>
                  {t.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Ask */}
        <section className="mt-16">
          <h2 className="cls-round text-3xl">Still deciding? Ask it anything</h2>
          <div className="mt-7">
            <AskMiyagi />
          </div>
        </section>

        <footer className="mt-20 border-t pt-8" style={{ borderColor: 'var(--line)' }}>
          <div className="flex flex-wrap items-center gap-4">
            <Sensei className="w-12" />
            <p className="cls-round text-xl">Miyagi</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--ink-soft)' }}>
              {MIYAGI.pkg} · {MIYAGI.license}
            </p>
          </div>
          <nav className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            <a href={MIYAGI.npm} target="_blank" rel="noreferrer" className="cls-link">npm</a>
            <a href={MIYAGI.repo} target="_blank" rel="noreferrer" className="cls-link">Source</a>
            <a href={MIYAGI.issues} target="_blank" rel="noreferrer" className="cls-link">Issues</a>
            <Link href="/work/miyagi" className="cls-link">How it was built</Link>
            <Link href="/" className="cls-link">George M&apos;sapenda</Link>
          </nav>
        </footer>
      </main>
    </div>
  );
}
