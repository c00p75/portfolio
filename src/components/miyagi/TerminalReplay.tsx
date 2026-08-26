'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { DEMO_STEPS } from '@/lib/miyagi';
import './replay.css';

/**
 * Replays a real session: the command is typed, then the teaching card streams
 * in a line at a time, then it moves to the next step and loops.
 *
 * The transcript is captured output, not copy written for a landing page. On a
 * page about a teaching tool, a faked demo is the first thing a developer would
 * catch.
 *
 * Everything visual comes from CSS custom properties, so each /miyagi variant
 * re-tones the same component instead of forking it. Honours
 * prefers-reduced-motion by rendering the whole transcript at rest.
 */

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Read the motion preference as an external store rather than mirroring it into
 * state from an effect. Same behaviour, no synchronous setState during render,
 * and it gives a correct server snapshot instead of a first-paint flip.
 */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const q = window.matchMedia(QUERY);
      q.addEventListener('change', onChange);
      return () => q.removeEventListener('change', onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

const TYPE_MS = 42;
const LINE_MS = 130;
const HOLD_MS = 2100;

type Phase = 'typing' | 'output' | 'hold';

export function TerminalReplay({ className = '' }: { className?: string }) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(0);
  const [lines, setLines] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [paused, setPaused] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const current = DEMO_STEPS[step]!;

  useEffect(() => {
    if (reduced || paused) return;

    if (phase === 'typing') {
      if (typed < current.cmd.length) {
        const t = setTimeout(() => setTyped((n) => n + 1), TYPE_MS);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase('output'), 340);
      return () => clearTimeout(t);
    }

    if (phase === 'output') {
      if (lines < current.out.length) {
        const t = setTimeout(() => setLines((n) => n + 1), LINE_MS);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase('hold'), HOLD_MS);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setStep((s) => (s + 1) % DEMO_STEPS.length);
      setTyped(0);
      setLines(0);
      setPhase('typing');
    }, 260);
    return () => clearTimeout(t);
  }, [phase, typed, lines, current, paused, reduced]);

  // Keep the newest line in view without scrolling the page itself.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, step]);

  const showCmd = reduced ? current.cmd : current.cmd.slice(0, typed);
  const showOut = reduced ? current.out : current.out.slice(0, lines);

  return (
    <div className={`mr-frame ${className}`}>
      <div className="mr-bar">
        <span className="mr-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="mr-title">miyagi · live session</span>
        <button
          type="button"
          className="mr-toggle"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
        >
          {paused ? 'Play' : 'Pause'}
        </button>
      </div>

      <div className="mr-body" ref={scroller} aria-live="off">
        <p className="mr-cmd">
          <span className="mr-prompt" aria-hidden="true">
            ${' '}
          </span>
          {showCmd}
          {!reduced && phase === 'typing' ? <span className="mr-caret" /> : null}
        </p>

        {showOut.map((l, i) => (
          <p key={i} className={lineClass(l)}>
            {l === '' ? ' ' : l}
          </p>
        ))}

        {!reduced && phase !== 'typing' && lines >= current.out.length ? (
          <p className="mr-cmd">
            <span className="mr-prompt" aria-hidden="true">
              ${' '}
            </span>
            <span className="mr-caret" />
          </p>
        ) : null}
      </div>

      {/* The full transcript, for screen readers and for anyone with motion off
          who should still get the content rather than a frozen frame. */}
      <p className="sr-only">
        Example session. Command: {current.cmd}. Output: {current.out.join(' ')}
      </p>

      <div className="mr-steps" aria-hidden="true">
        {DEMO_STEPS.map((_, i) => (
          <span key={i} className={i === step ? 'on' : ''} />
        ))}
      </div>
    </div>
  );
}

/** Output lines get a role so each skin can colour headings and results. */
function lineClass(line: string): string {
  if (line.startsWith('#')) return 'mr-out mr-h';
  if (line.includes('✅') || line.startsWith('+') || line.includes('XP')) return 'mr-out mr-good';
  if (line.includes('⚠️') || line.toLowerCase().includes('flagged')) return 'mr-out mr-warn';
  if (line.startsWith('[') || line.includes('█') || line.includes('░')) return 'mr-out mr-meter';
  return 'mr-out';
}
