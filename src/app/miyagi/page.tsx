import type { Metadata } from 'next';
import Link from 'next/link';
import { EdgeRail, InkCard, SectionHeading } from '@/components/ui/Frame';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Tag, accentText } from '@/components/ui/Sticker';
import { projectBySlug } from '@/lib/content';

const NPM_URL = 'https://www.npmjs.com/package/miyagi-mcp';
const REPO_URL = 'https://github.com/c00p75/miyagi';

export const metadata: Metadata = {
  title: 'Miyagi: a gamified, voice-enabled MCP coding tutor',
  description:
    'An MCP server that teaches terminal work by drilling you rather than doing it for you. Install with npx, works in Claude Desktop, Cursor, Claude Code and Windsurf. Open source, no API keys, nothing dangerous executes.',
  alternates: { canonical: '/miyagi' },
  openGraph: {
    title: 'Miyagi: a gamified, voice-enabled MCP coding tutor',
    description:
      'You run the commands. It drills, corrects, catches the falls, and keeps score. An open-source MCP server, installable with npx.',
    url: '/miyagi',
    type: 'website',
  },
};

/**
 * A code block that can carry a caption. Wide content scrolls inside its own
 * box, using the same `scroll-x` utility the MDX renderer applies, so a long
 * install line never makes the page scroll sideways on a phone.
 */
function Code({ children, label }: { children: string; label?: string }) {
  return (
    <figure className="mt-6">
      {label ? (
        <figcaption className="font-mono text-on-ink-muted mb-2 text-micro uppercase">
          {label}
        </figcaption>
      ) : null}
      <pre className="scroll-x bg-ink-soft border-ink-line rounded-panel border p-5 text-sm leading-relaxed">
        <code className="font-mono">{children}</code>
      </pre>
    </figure>
  );
}

const CONFIG = `{
  "mcpServers": {
    "miyagi": {
      "command": "npx",
      "args": ["-y", "miyagi-mcp"]
    }
  }
}`;

const CLIENTS: { client: string; where: string }[] = [
  { client: 'Claude Desktop (macOS)', where: '~/Library/Application Support/Claude/claude_desktop_config.json' },
  { client: 'Claude Desktop (Windows)', where: '%APPDATA%\\Claude\\claude_desktop_config.json' },
  { client: 'Cursor', where: '.cursor/mcp.json, or ~/.cursor/mcp.json globally' },
  { client: 'AntiGravity / Windsurf', where: '~/.codeium/windsurf/mcp_config.json' },
  { client: 'Claude Code', where: 'claude mcp add miyagi -- npx -y miyagi-mcp' },
];

const CARD: { part: string; detail: string }[] = [
  { part: 'Roadmap alignment', detail: 'Where the command sits on your track, and which step you are on.' },
  { part: 'What / How / Trade-offs', detail: 'The same command explained three ways, pitched at Junior, Mid or Senior.' },
  { part: 'Mental model', detail: 'A Mermaid flowchart of what the shell actually does with it.' },
  { part: 'Pitfalls', detail: 'The mistakes this command specifically invites, not generic advice.' },
  { part: 'Docs', detail: 'A short curated set, including the man page, rather than a search link.' },
  { part: 'Active recall quiz', detail: 'One question you answer back, which is where the XP comes from.' },
];

const TOOLS: { name: string; detail: string }[] = [
  { name: 'run_teaching_command', detail: 'Execute or dry-run a command and return the full teaching card.' },
  { name: 'verify_quiz_answer', detail: 'Grade the quiz, update your streak and XP, speak the feedback.' },
  { name: 'get_next_roadmap_command', detail: 'The next copy-pasteable command for where you are.' },
  { name: 'set_active_roadmap', detail: 'Set category, roadmap, topic and step counters.' },
  { name: 'quick_config', detail: 'Switch skill level, track or voice in one call. Also resets progress.' },
  { name: 'configure_voice', detail: 'Toggle audio and set words per minute.' },
  { name: 'get_user_stats', detail: 'XP, level, title, streaks, badges and the title ladder.' },
  { name: 'export_roadmap_notes', detail: 'Write a ROADMAP_PROGRESS.md summary of the session.' },
];

export default function MiyagiPage() {
  const caseStudy = projectBySlug('miyagi');

  return (
    <>
      <EdgeRail
        className="pt-2 pb-3"
        left="Open source"
        center="Model Context Protocol server"
        right="MIT licensed"
      />

      {/* ------------------------------- Hero -------------------------------- */}
      <div className="px-edge">
        <InkCard className="px-card py-14 sm:py-20">
          <div className="flex flex-wrap items-center gap-3">
            <Tag>MCP server</Tag>
            <Tag>TypeScript</Tag>
            <Tag>npx installable</Tag>
          </div>

          <h1 className="font-display mt-8 text-jumbo text-balance uppercase">
            Miyagi
          </h1>

          <p className={`font-display mt-4 text-title uppercase ${accentText.orange}`}>
            You run the commands
          </p>

          <p className="text-on-ink mt-8 max-w-3xl text-lg leading-relaxed text-pretty">
            An MCP server that teaches terminal work by drilling you instead of doing it for
            you. It hands you the next command, explains it at your level, and turns every
            result into a lesson, narrated through your own machine&apos;s speech engine. Wax on,
            wax off.
          </p>

          <Code label="Install">npx -y miyagi-mcp</Code>

          <div className="mt-9 flex flex-wrap gap-3">
            <ArrowLink href={NPM_URL} variant="solid" target="_blank" rel="noreferrer">
              View on npm
            </ArrowLink>
            <ArrowLink href={REPO_URL} variant="outline" target="_blank" rel="noreferrer">
              Read the source
            </ArrowLink>
            {caseStudy ? (
              <ArrowLink href={caseStudy.url} variant="outline">
                How it was built
              </ArrowLink>
            ) : null}
          </div>
        </InkCard>
      </div>

      {/* ------------------------------ Install ------------------------------ */}
      <section className="px-edge pt-6 sm:pt-10">
        <InkCard className="px-card py-14 sm:py-20">
          <SectionHeading
            index="01"
            eyebrow="Setup"
            title="Three lines, any client"
            lead="No API keys, no account, no sign-up. It runs entirely on your machine, so the only thing your client needs is permission to start it."
          />

          <Code label="Add to your MCP config">{CONFIG}</Code>

          <div className="scroll-x mt-10">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-ink-line border-b">
                  <th className="font-mono text-on-ink-muted py-3 pr-6 text-micro font-semibold uppercase">
                    Client
                  </th>
                  <th className="font-mono text-on-ink-muted py-3 text-micro font-semibold uppercase">
                    Where it goes
                  </th>
                </tr>
              </thead>
              <tbody>
                {CLIENTS.map((c) => (
                  <tr key={c.client} className="border-ink-line/60 border-b last:border-0">
                    <td className="py-4 pr-6 align-top leading-relaxed">{c.client}</td>
                    <td className="font-mono py-4 align-top text-xs leading-relaxed break-all">
                      {c.where}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-on-ink mt-9 max-w-3xl leading-relaxed text-pretty">
            Restart the client, then ask it something like{' '}
            <em>&ldquo;set my roadmap to Backend Developer and teach me docker compose
            config&rdquo;</em>.
          </p>
        </InkCard>
      </section>

      {/* --------------------------- Teaching card --------------------------- */}
      <section className="px-edge pt-6 sm:pt-10">
        <InkCard className="px-card py-14 sm:py-20">
          <SectionHeading
            index="02"
            eyebrow="What you get"
            title="Every command comes back as a lesson"
            lead="Running a command is the cheap part. The card around it is the point: the same command explained at the depth you asked for, with the failure modes it actually invites."
          />
          <ol className="mt-12 flex flex-col gap-px overflow-hidden rounded-panel bg-current/10">
            {CARD.map((c, i) => (
              <li key={c.part} className="bg-ink flex gap-6 p-6 sm:gap-8 sm:p-8">
                <span className={`font-display shrink-0 text-3xl leading-none ${accentText.orange}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-title uppercase">{c.part}</h3>
                  <p className="text-on-ink mt-2 max-w-2xl leading-relaxed text-pretty">
                    {c.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </InkCard>
      </section>

      {/* ------------------------------ Safety ------------------------------- */}
      <section className="px-edge pt-6 sm:pt-10">
        <InkCard className="px-card py-14 sm:py-20">
          <SectionHeading
            index="03"
            eyebrow="Before you install it"
            title="It runs shell commands. Here is the honest version."
            lead="Anything that executes commands on your machine should be read before it is trusted, so this says what the protection is and where it stops."
          />
          <div className="mt-12 grid gap-px overflow-hidden rounded-panel bg-current/10 sm:grid-cols-2">
            {[
              {
                h: 'Nothing catastrophic executes',
                p: 'Nine classes are pattern-matched and forced into dry-run: recursive delete, raw device writes, filesystem formats, fork bombs, disk overwrites, host power state, world-writable recursion, piping remote code into a shell, and history-rewriting force pushes.',
              },
              {
                h: 'The screen does not trust its caller',
                p: 'The tool accepts an is_dangerous flag, but re-derives the verdict itself and ORs the two. The threat model is a model reaching for a vivid example mid-lesson, not a careless human, so a flag the caller supplies cannot be what protects you from the caller.',
              },
              {
                h: 'A denylist is a backstop, not a sandbox',
                p: 'The real boundary is your client’s own approval prompt, with you reading the command before it runs. Commands execute with your privileges in your directory: no container, no restricted user, no syscall filter.',
              },
              {
                h: 'Failures teach instead of crashing',
                p: 'A non-zero exit returns a diagnostic with a troubleshooting ladder rather than a thrown error. Commands are capped at 60 seconds and 4 MB. No network calls, no telemetry, no keys.',
              },
            ].map((b) => (
              <div key={b.h} className="bg-ink p-6 sm:p-8">
                <h3 className="font-display text-title uppercase">{b.h}</h3>
                <p className="text-on-ink mt-3 leading-relaxed text-pretty">{b.p}</p>
              </div>
            ))}
          </div>

          <p className="text-on-ink mt-9 max-w-3xl leading-relaxed text-pretty">
            Two runtime dependencies, the MCP SDK and zod, in one source file you can read in
            a sitting. Sixteen tests cover the danger screen and the saved-profile parser, and
            CI drives a real handshake on Node 18, 20 and 22.
          </p>
        </InkCard>
      </section>

      {/* ------------------------------- Tools ------------------------------- */}
      <section className="px-edge pt-6 sm:pt-10">
        <InkCard className="px-card py-14 sm:py-20">
          <SectionHeading
            index="04"
            eyebrow="Surface"
            title="Eight tools"
            lead="Progress is saved to ~/.miyagi/profile.json, so XP, streaks, badges and your position on a track survive a client restart."
          />
          <ul className="divide-ink-line mt-12 divide-y">
            {TOOLS.map((t) => (
              <li key={t.name} className="py-6 first:pt-0 sm:flex sm:gap-8">
                <span className={`font-mono block shrink-0 text-sm sm:w-72 ${accentText.orange}`}>
                  {t.name}
                </span>
                <p className="text-on-ink mt-2 max-w-2xl leading-relaxed text-pretty sm:mt-0">
                  {t.detail}
                </p>
              </li>
            ))}
          </ul>
        </InkCard>
      </section>

      {/* -------------------------------- CTA -------------------------------- */}
      <section className="px-edge pt-6 sm:pt-10">
        <InkCard className="px-card py-14 sm:py-20">
          <SectionHeading
            eyebrow="Try it"
            title="Wax on, wax off"
            lead="It is MIT licensed and open source. If you use it and it teaches you nothing, that is a bug worth reporting."
          />
          <Code label="Install">npx -y miyagi-mcp</Code>
          <div className="mt-9 flex flex-wrap gap-3">
            <ArrowLink href={NPM_URL} variant="solid" target="_blank" rel="noreferrer">
              miyagi-mcp on npm
            </ArrowLink>
            <ArrowLink href={`${REPO_URL}/issues`} variant="outline" target="_blank" rel="noreferrer">
              Report an issue
            </ArrowLink>
            {caseStudy ? (
              <ArrowLink href={caseStudy.url} variant="outline">
                The engineering write-up
              </ArrowLink>
            ) : null}
          </div>
          <p className="text-on-ink-muted mt-9 max-w-3xl text-sm leading-relaxed text-pretty">
            Built by{' '}
            <Link href="/about" className="underline decoration-orange underline-offset-4">
              George M&apos;sapenda
            </Link>
            . The design reasoning, including why it uses a transport that cannot be hosted,
            is written up as a{' '}
            {caseStudy ? (
              <Link
                href={caseStudy.url}
                className="underline decoration-orange underline-offset-4"
              >
                case study
              </Link>
            ) : (
              'case study'
            )}
            .
          </p>
        </InkCard>
      </section>
    </>
  );
}
