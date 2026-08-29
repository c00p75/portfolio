/**
 * One source of truth for every /miyagi variant.
 *
 * The variants differ only in presentation. Facts live here so a restyle cannot
 * quietly invent a feature, and so a change to the product is a change in one
 * file rather than five. Everything below describes the published
 * miyagi-mcp@3.0.0.
 */

export const MIYAGI = {
  pkg: 'miyagi-mcp',
  version: '3.0.0',
  install: 'npx -y miyagi-mcp',
  npm: 'https://www.npmjs.com/package/miyagi-mcp',
  repo: 'https://github.com/c00p75/miyagi',
  issues: 'https://github.com/c00p75/miyagi/issues',
  license: 'MIT',
  tagline: 'You run the commands. It drills, corrects, catches the falls, and keeps score.',
  blurb:
    'A coding tutor that lives in your editor and refuses to do the work for you. Default mode is ride-along: a short card, no inline quiz, no voice. Switch to drill when you want the full lesson, a quiz, and narration from your own machine.',
} as const;

export const CONFIG_JSON = `{
  "mcpServers": {
    "miyagi": {
      "command": "npx",
      "args": ["-y", "miyagi-mcp"]
    }
  }
}`;

export const CLIENTS: readonly { client: string; where: string }[] = [
  { client: 'Claude Desktop (macOS)', where: '~/Library/Application Support/Claude/claude_desktop_config.json' },
  { client: 'Claude Desktop (Windows)', where: '%APPDATA%\\Claude\\claude_desktop_config.json' },
  { client: 'Cursor', where: '.cursor/mcp.json, or ~/.cursor/mcp.json' },
  { client: 'AntiGravity / Windsurf', where: '~/.codeium/windsurf/mcp_config.json' },
  { client: 'Claude Code', where: 'claude mcp add miyagi -- npx -y miyagi-mcp' },
];

export const MODES: readonly { name: string; xp: string; detail: string }[] = [
  {
    name: 'Ride-along',
    xp: '3 XP',
    detail: 'The default. A short card, no inline quiz, no voice. Recall is queued for later, not dropped.',
  },
  {
    name: 'Drill',
    xp: '10 XP',
    detail: 'The full card: What/How/Trade-offs, a diagram, pitfalls, docs, a quiz, and speech. Intensity you opt into.',
  },
  {
    name: 'Focus',
    xp: '0 XP',
    detail: 'The command runs. Nothing else surfaces unless it is dangerous — refusals still report in every mode.',
  },
];

export const XP_LINE =
  'Attempt XP follows the mode: 10 in drill, 3 in ride-along, nothing in focus. A verified outcome is 30, once. A correct quiz is 25 (30 for a review). Level is XP over 100, saved to disk.';

export const AUDIT_LINE =
  'Two runtime dependencies, the MCP SDK and zod. 249 tests, and CI drives a real stdio handshake on Node 18, 20 and 22.';

export const CARD_PARTS: readonly { part: string; detail: string; icon: string }[] = [
  { part: 'Roadmap alignment', detail: 'Where the command sits on your track, and which step you are on.', icon: 'map' },
  { part: 'What / How / Trade-offs', detail: 'The same command explained three ways, pitched at Junior, Mid or Senior.', icon: 'layers' },
  { part: 'Mental model', detail: 'A Mermaid flowchart of what the shell actually does with it. Drill shows it; quieter modes skip it.', icon: 'flow' },
  { part: 'Common pitfalls', detail: 'The mistakes this command specifically invites, not generic advice.', icon: 'warn' },
  { part: 'Curated docs', detail: 'A short set including the man page, rather than a search link.', icon: 'book' },
  { part: 'Active recall quiz', detail: 'Asked inline in drill. Quieter modes queue it for review instead of dropping it.', icon: 'quiz' },
];

export const TOOLS: readonly { name: string; detail: string }[] = [
  { name: 'quick_config', detail: 'Skill level, track, voice, and session mode (drill / ride-along / focus) in one call. Also resets progress.' },
  { name: 'list_roadmaps', detail: 'Every track, built-in and yours, with the JSON shape for authoring your own.' },
  { name: 'set_active_roadmap', detail: 'Set category, track, topic and step. An unknown name is reported, not silently swapped.' },
  { name: 'get_next_roadmap_command', detail: 'The next copy-pasteable command for where you are, with its checkpoint criterion.' },
  { name: 'run_teaching_command', detail: 'Execute or dry-run a command and return a teaching card. Depth follows the session mode.' },
  { name: 'verify_step', detail: 'A read-only probe confirms the outcome exists on your machine. This is where most of the XP is.' },
  { name: 'verify_quiz_answer', detail: 'Grade the quiz, update streaks, XP, mastery and the review schedule.' },
  { name: 'review_due_items', detail: 'The spaced-repetition session — everything whose interval has elapsed, most overdue first.' },
  { name: 'get_user_stats', detail: 'XP, level, title, both streaks, badges, per-command mastery and lifetime totals.' },
  { name: 'export_roadmap_notes', detail: 'Write a ROADMAP_PROGRESS.md of the session, or of everything you have practised.' },
];

export const SAFETY: readonly { head: string; body: string }[] = [
  {
    head: 'Nothing catastrophic executes',
    body: 'Shapes like rm -rf /, mkfs, curl | sh, fork bombs and wiping shell history are refused outright, with or without confirmation, and regardless of what the calling model claims.',
  },
  {
    head: 'A human confirms the rest',
    body: 'Merely destructive commands (rm -rf build, git push --force, terraform destroy) are explained and dry-run until you type RUN. The model’s confirm_dangerous flag is only the fallback for clients that cannot prompt you.',
  },
  {
    head: 'The screen does not trust its caller',
    body: 'The tool accepts an is_dangerous flag but re-derives the verdict itself. The threat model is a model reaching for a vivid example mid-lesson, not a careless human, so a flag the caller supplies cannot be the thing protecting you from the caller.',
  },
  {
    head: 'A denylist is a backstop, not a sandbox',
    body: 'The real boundary is your client’s own approval prompt, with you reading the command first. Commands run with your privileges in your directory: no container, no restricted user, no syscall filter. Failures return a diagnostic rather than a thrown error. 60-second cap, 4 MB, no network, no telemetry, no keys.',
  },
];

export const TITLES: readonly { name: string; at: string; level: number }[] = [
  { name: 'Terminal Novice', at: 'Level 1', level: 1 },
  { name: 'Shell Apprentice', at: 'Level 3', level: 3 },
  { name: 'CLI Artisan', at: 'Level 6', level: 6 },
  { name: 'Terminal Wizard', at: 'Level 10', level: 10 },
];

export const FACTS: readonly { value: string; label: string }[] = [
  { value: String(TOOLS.length), label: 'tools over stdio' },
  { value: String(MODES.length), label: 'session modes' },
  { value: '2', label: 'runtime dependencies' },
  { value: '249', label: 'tests, on Node 18/20/22' },
];

/**
 * A real transcript, trimmed. Taken from an actual session rather than written
 * for the page, because a made-up demo of a teaching tool is the one thing a
 * developer will check. Numbers match drill mode: 10 for the attempt, 25 for
 * the quiz.
 */
export const DEMO_STEPS: readonly { cmd: string; out: readonly string[] }[] = [
  {
    cmd: 'echo drill',
    out: [
      '# Miyagi · `echo drill`',
      '',
      '## Roadmap',
      'Absolute Beginners → Command Line Basics',
      'Progress: [█░░░░░░░░░░░] step 1/10',
      '',
      '## Execution',
      'EXECUTED. Exit code 0 ✅',
      'drill',
      '',
      '## Quiz',
      'Which shell variable holds the exit code',
      'of the command that just finished?',
      'A. $?   B. $!   C. $0   D. $#',
    ],
  },
  {
    cmd: 'verify_quiz_answer  A',
    out: [
      '# ✅ Correct',
      '',
      'Answer: $?',
      'Why: $? is the exit status of the most',
      'recently completed foreground command.',
      '',
      '+25 XP  ·  streak 1 🔥',
      'Terminal Novice · Level 1 · 35 XP',
      '[███░░░░░░░] 35/100',
    ],
  },
  {
    cmd: 'rm -rf /tmp/whatever',
    out: [
      '# Miyagi · `rm -rf /tmp/whatever`',
      '',
      '## ⚠️ Safety screen',
      'Flagged: recursive/forced delete',
      'Explained but not executed. Type RUN',
      'when you mean it.',
      '',
      'The screen re-derives this itself. It does',
      'not matter what the caller claimed.',
    ],
  },
];

export const VARIANTS: readonly { slug: string; name: string; note: string }[] = [
  { slug: '/miyagi', name: 'Manga', note: 'Chosen: halftone panels, speech bubbles, hard ink' },
  { slug: '/miyagi/classroom', name: 'Classroom', note: 'Bright, rounded, friendliest of the five' },
  { slug: '/miyagi/dojo', name: 'Dojo', note: 'Sumi ink, washi paper, one vermilion seal' },
  { slug: '/miyagi/arcade', name: 'Arcade', note: 'Cabinet glow, XP bars, unapologetically a game' },
  { slug: '/miyagi/terminal', name: 'Terminal', note: 'Phosphor green, box-drawn, developer-native' },
];
