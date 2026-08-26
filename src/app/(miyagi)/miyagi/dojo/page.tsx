import type { Metadata } from 'next';
import Link from 'next/link';
import { Noto_Serif_JP, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { AskMiyagi } from '@/components/miyagi/AskMiyagi';
import { VariantBar } from '@/components/miyagi/VariantBar';
import { TerminalReplay } from '@/components/miyagi/TerminalReplay';
import { projectBySlug } from '@/lib/content';

const serifJp = Noto_Serif_JP({ subsets: ['latin'], weight: ['400', '700', '900'], variable: '--font-serif-jp', display: 'swap' });
const plexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-plex-sans', display: 'swap' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono', display: 'swap' });

const NPM_URL = 'https://www.npmjs.com/package/miyagi-mcp';
const REPO_URL = 'https://github.com/c00p75/miyagi';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Miyagi · dojo styling',
  description:
    'An MCP server that teaches terminal work by drilling you rather than doing it for you. Install with npx, works in Claude Desktop, Cursor, Claude Code and Windsurf. Open source, no API keys, nothing dangerous executes.',

  openGraph: {
    title: 'Miyagi · a gamified, voice-enabled MCP coding tutor',
    description:
      'You run the commands. It drills, corrects, catches the falls, and keeps score. An open-source MCP server, installable with npx.',
    url: '/miyagi',
    type: 'website',
  },
};

/* ------------------------------------------------------------------ *
 * Small local pieces. These live here rather than in the shared UI
 * library on purpose: nothing on this page should be reusable by the
 * portfolio, or the two worlds start converging again.
 * ------------------------------------------------------------------ */

function Term({ children, prompt = true }: { children: string; prompt?: boolean }) {
  return (
    <div className="dojo-term mt-6 p-5">
      <pre className="text-sm leading-relaxed">
        <code>
          {prompt ? <span className="prompt">$ </span> : null}
          {children}
        </code>
      </pre>
    </div>
  );
}

function Kicker({ children }: { children: string }) {
  return <p className="dojo-kicker">{children}</p>;
}

function Section({
  index,
  kicker,
  title,
  lead,
  children,
}: {
  index: string;
  kicker: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="flex items-center gap-4">
        <span className="dojo-mono text-sm" style={{ color: 'var(--seal-bright)' }}>
          {index}
        </span>
        <Kicker>{kicker}</Kicker>
      </div>
      <h2 className="dojo-display mt-5 text-3xl sm:text-5xl">{title}</h2>
      {lead ? (
        <p className="mt-6 max-w-3xl text-lg leading-relaxed" style={{ color: 'var(--on-sumi)' }}>
          {lead}
        </p>
      ) : null}
      {children}
    </section>
  );
}

const BELTS = [
  { name: 'Terminal Novice', at: 'Level 1', color: 'var(--belt-white)' },
  { name: 'Shell Apprentice', at: 'Level 3', color: 'var(--belt-yellow)' },
  { name: 'CLI Artisan', at: 'Level 6', color: 'var(--belt-green)' },
  { name: 'Terminal Wizard', at: 'Level 10', color: 'var(--belt-brown)' },
];

const CONFIG = `{
  "mcpServers": {
    "miyagi": {
      "command": "npx",
      "args": ["-y", "miyagi-mcp"]
    }
  }
}`;

const CLIENTS = [
  { client: 'Claude Desktop (macOS)', where: '~/Library/Application Support/Claude/claude_desktop_config.json' },
  { client: 'Claude Desktop (Windows)', where: '%APPDATA%\\Claude\\claude_desktop_config.json' },
  { client: 'Cursor', where: '.cursor/mcp.json, or ~/.cursor/mcp.json' },
  { client: 'AntiGravity / Windsurf', where: '~/.codeium/windsurf/mcp_config.json' },
  { client: 'Claude Code', where: 'claude mcp add miyagi -- npx -y miyagi-mcp' },
];

const CARD = [
  ['Roadmap alignment', 'Where the command sits on your track, and which step you are on.'],
  ['What / How / Trade-offs', 'The same command explained three ways, pitched at Junior, Mid or Senior.'],
  ['Mental model', 'A Mermaid flowchart of what the shell actually does with it.'],
  ['Pitfalls', 'The mistakes this command specifically invites, not generic advice.'],
  ['Curated docs', 'A short set including the man page, rather than a search link.'],
  ['Active recall quiz', 'One question you answer back, which is where the XP comes from.'],
];

const TOOLS = [
  ['run_teaching_command', 'Execute or dry-run a command and return the full teaching card.'],
  ['verify_quiz_answer', 'Grade the quiz, update your streak and XP, speak the feedback.'],
  ['get_next_roadmap_command', 'The next copy-pasteable command for where you are.'],
  ['set_active_roadmap', 'Set category, roadmap, topic and step counters.'],
  ['quick_config', 'Switch skill level, track or voice in one call. Also resets progress.'],
  ['configure_voice', 'Toggle audio and set words per minute.'],
  ['get_user_stats', 'XP, level, title, streaks, badges and the title ladder.'],
  ['export_roadmap_notes', 'Write a ROADMAP_PROGRESS.md summary of the session.'],
];

const SAFETY = [
  [
    'Nothing catastrophic executes',
    'Nine classes are pattern-matched and forced into dry-run: recursive delete, raw device writes, filesystem formats, fork bombs, disk overwrites, host power state, world-writable recursion, piping remote code into a shell, and history-rewriting force pushes.',
  ],
  [
    'The screen does not trust its caller',
    'The tool accepts an is_dangerous flag but re-derives the verdict itself, then ORs the two. The threat model is a model reaching for a vivid example mid-lesson, not a careless human, so a flag the caller supplies cannot be the thing protecting you from the caller.',
  ],
  [
    'A denylist is a backstop, not a sandbox',
    'The real boundary is your client’s own approval prompt, with you reading the command first. Commands run with your privileges in your directory: no container, no restricted user, no syscall filter.',
  ],
  [
    'Failures teach instead of crashing',
    'A non-zero exit returns a diagnostic with a troubleshooting ladder rather than a thrown error. Commands cap at 60 seconds and 4 MB. No network calls, no telemetry, no keys.',
  ],
];

export default function MiyagiPage() {
  const caseStudy = projectBySlug('miyagi');

  return (
    <div className={`dojo ${serifJp.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <div className="dojo-ground" aria-hidden="true" />
      <VariantBar current="/miyagi/dojo" />

      {/* ------------------------------ Header ------------------------------ */}
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 pt-8 sm:px-8">
        <div className="flex items-center gap-4">
          <span className="dojo-seal" aria-hidden="true">
            道
          </span>
          <span className="dojo-mono text-xs tracking-[0.22em] uppercase">miyagi</span>
        </div>
        <nav className="dojo-mono flex items-center gap-5 text-xs uppercase">
          <a href={NPM_URL} target="_blank" rel="noreferrer" className="dojo-link">
            npm
          </a>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="dojo-link">
            GitHub
          </a>
          <Link href="/" className="dojo-link">
            Portfolio
          </Link>
        </nav>
      </header>

      <main id="main">
        {/* ------------------------------- Hero ------------------------------ */}
        <section className="mx-auto max-w-6xl px-5 pt-16 pb-8 sm:px-8 sm:pt-24">
          <Kicker>Model Context Protocol server · MIT</Kicker>
          <h1 className="dojo-display mt-6 text-[clamp(3.5rem,14vw,10rem)]">Miyagi</h1>
          <p
            className="dojo-mono mt-4 text-sm tracking-[0.14em] uppercase"
            style={{ color: 'var(--seal-bright)' }}
          >
            Wax on. Wax off.
          </p>

          <p className="mt-9 max-w-2xl text-xl leading-relaxed">
            A coding tutor that lives in your editor and refuses to do the work for you. It
            hands you the next command, explains it at your level, and turns every result into
            a lesson, narrated aloud by your own machine.
          </p>

          <Term>npx -y miyagi-mcp</Term>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={NPM_URL} target="_blank" rel="noreferrer" className="dojo-btn dojo-btn-solid">
              Install from npm
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="dojo-btn dojo-btn-ghost">
              Read the source
            </a>
          </div>
        </section>

        {/* ------------------------------- Belts ----------------------------- */}
        <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <div className="dojo-panel p-6 sm:p-8">
            <Kicker>The ladder</Kicker>
            <p className="mt-4 max-w-2xl leading-relaxed" style={{ color: 'var(--on-sumi)' }}>
              Commands earn 15 XP, correct quiz answers 25 with a streak multiplier, and level
              is simply XP over 100. Titles unlock on the way up. Progress is saved, so a
              restart costs nothing.
            </p>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {BELTS.map((b) => (
                <li key={b.name}>
                  <div className="dojo-belt" style={{ background: b.color }} />
                  <p className="dojo-display mt-3 text-lg">{b.name}</p>
                  <p className="dojo-mono mt-1 text-xs" style={{ color: 'var(--on-sumi-quiet)' }}>
                    {b.at}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ------------------------------ Replay ----------------------------- */}
        <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <Kicker>A real session</Kicker>
          <h2 className="dojo-display mt-5 text-3xl sm:text-4xl">Watch it drill</h2>
          <p className="mt-5 max-w-2xl leading-relaxed" style={{ color: 'var(--on-sumi)' }}>
            Captured output, replayed. It runs a command, hands back a card, marks a quiz, then
            refuses to delete anything.
          </p>
          <TerminalReplay className="mt-8" />
        </section>

        {/* ------------------------------- Setup ----------------------------- */}
        <Section
          index="01"
          kicker="Setup"
          title="Three lines, any client"
          lead="No API keys, no account, no sign-up. It runs entirely on your machine, so the only thing your client needs is permission to start it."
        >
          <Term prompt={false}>{CONFIG}</Term>

          <div className="dojo-panel mt-8 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sumi-line)' }}>
                  <th className="dojo-kicker p-4">Client</th>
                  <th className="dojo-kicker p-4">Where it goes</th>
                </tr>
              </thead>
              <tbody>
                {CLIENTS.map((c) => (
                  <tr key={c.client} style={{ borderBottom: '1px solid var(--sumi-line)' }}>
                    <td className="p-4 align-top leading-relaxed">{c.client}</td>
                    <td className="dojo-mono p-4 align-top text-xs leading-relaxed break-all" style={{ color: 'var(--on-sumi-quiet)' }}>
                      {c.where}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-8 max-w-3xl leading-relaxed" style={{ color: 'var(--on-sumi)' }}>
            Restart the client, then ask it something like{' '}
            <em>&ldquo;set my roadmap to Backend Developer and teach me docker compose
            config&rdquo;</em>.
          </p>
        </Section>

        {/* --------------------------- Teaching card ------------------------- */}
        <Section
          index="02"
          kicker="What you get"
          title="Every command comes back as a lesson"
          lead="Running the command is the cheap part. The card around it is the point: the same command at the depth you asked for, with the failure modes it actually invites."
        >
          <ol className="mt-12 grid gap-px sm:grid-cols-2" style={{ background: 'var(--sumi-line)' }}>
            {CARD.map(([part, detail], i) => (
              <li key={part} className="p-6 sm:p-8" style={{ background: 'var(--sumi-raised)' }}>
                <span className="dojo-display text-3xl" style={{ color: 'var(--seal-bright)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="dojo-display mt-3 text-xl">{part}</h3>
                <p className="mt-2 leading-relaxed" style={{ color: 'var(--on-sumi-quiet)' }}>
                  {detail}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        {/* ------------------------------ Safety ----------------------------- */}
        <Section
          index="03"
          kicker="Before you install it"
          title="It runs shell commands. Here is the honest version."
          lead="Anything that executes commands on your machine should be read before it is trusted, so this says what the protection is and, more usefully, where it stops."
        >
          <div className="mt-12 grid gap-px sm:grid-cols-2" style={{ background: 'var(--sumi-line)' }}>
            {SAFETY.map(([h, p]) => (
              <div key={h} className="p-6 sm:p-8" style={{ background: 'var(--sumi-raised)' }}>
                <h3 className="dojo-display text-xl">{h}</h3>
                <p className="mt-3 leading-relaxed" style={{ color: 'var(--on-sumi-quiet)' }}>
                  {p}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-3xl leading-relaxed" style={{ color: 'var(--on-sumi)' }}>
            Two runtime dependencies, the MCP SDK and zod, in one source file you can read in a
            sitting. Sixteen tests cover the danger screen and the saved-profile parser, and CI
            drives a real handshake on Node 18, 20 and 22.
          </p>
        </Section>

        {/* ------------------------------- Tools ----------------------------- */}
        <Section
          index="04"
          kicker="Surface"
          title="Eight tools"
          lead="Progress lives in ~/.miyagi/profile.json, so XP, streaks, badges and your position on a track survive a client restart."
        >
          <ul className="mt-12">
            {TOOLS.map(([name, detail]) => (
              <li
                key={name}
                className="py-6 sm:flex sm:gap-10"
                style={{ borderBottom: '1px solid var(--sumi-line)' }}
              >
                <span
                  className="dojo-mono block shrink-0 text-sm sm:w-72"
                  style={{ color: 'var(--seal-bright)' }}
                >
                  {name}
                </span>
                <p className="mt-2 max-w-2xl leading-relaxed sm:mt-0" style={{ color: 'var(--on-sumi-quiet)' }}>
                  {detail}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        {/* ----------------------------- Ask Miyagi -------------------------- */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="flex items-center gap-4">
            <span className="dojo-mono text-sm" style={{ color: 'var(--seal-bright)' }}>
              05
            </span>
            <Kicker>Ask it yourself</Kicker>
          </div>
          <h2 className="dojo-display mt-5 mb-10 text-3xl sm:text-5xl">
            Questions before you install
          </h2>
          <AskMiyagi />
        </section>
      </main>

      {/* ------------------------------- Footer ----------------------------- */}
      <footer className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <hr className="dojo-brush" />
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="dojo-seal" aria-hidden="true">
              道
            </span>
            <div>
              <p className="dojo-display text-xl">Miyagi</p>
              <p className="dojo-mono text-xs" style={{ color: 'var(--on-sumi-quiet)' }}>
                MIT licensed · miyagi-mcp on npm
              </p>
            </div>
          </div>

          <nav className="dojo-mono flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase">
            <a href={NPM_URL} target="_blank" rel="noreferrer" className="dojo-link">
              npm
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="dojo-link">
              Source
            </a>
            <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer" className="dojo-link">
              Issues
            </a>
            {caseStudy ? (
              <Link href={caseStudy.url} className="dojo-link">
                How it was built
              </Link>
            ) : null}
            <Link href="/" className="dojo-link">
              George M&apos;sapenda
            </Link>
          </nav>
        </div>

        <p className="mt-10 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--on-sumi-quiet)' }}>
          Built by{' '}
          <Link href="/about" className="dojo-link">
            George M&apos;sapenda
          </Link>
          . The design reasoning, including why it uses a transport that cannot be hosted, is
          written up as a{' '}
          {caseStudy ? (
            <Link href={caseStudy.url} className="dojo-link">
              case study
            </Link>
          ) : (
            'case study'
          )}
          .
        </p>
      </footer>
    </div>
  );
}
