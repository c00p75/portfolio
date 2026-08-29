'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';
import { Tag } from '@/components/ui/Sticker';
import { SANDBOX_SUGGESTIONS } from '@/lib/rag/suggestions';

type Passage = {
  n: number;
  id: string;
  url: string;
  title: string;
  section: string;
  kind: 'project' | 'adr' | 'playbook' | 'post' | 'profile';
  tokens: number;
  score: number;
  denseRank: number | null;
  lexicalRank: number | null;
  excerpt: string;
};

type Timings = {
  embedMs: number;
  lexicalMs: number;
  denseMs: number;
  fuseMs: number;
  totalMs: number;
};

type Usage = { inputTokens: number; outputTokens: number; costUsd: number; totalMs: number };

type Phase = 'idle' | 'retrieving' | 'generating' | 'done' | 'error';

/** One turn in the transcript. Assistant turns carry their own phase so a
 *  finished answer keeps its state when the next question starts streaming. */
type Message = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  phase?: Phase;
};

// Shared with the ingest, which precomputes a vector for each — see
// `suggestions.ts`. A prompt edited only here loses that.
const SUGGESTIONS = SANDBOX_SUGGESTIONS;

/** One labelled row in the telemetry panel. */
function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="font-mono text-on-ink-muted text-[0.625rem] tracking-wider uppercase">
        {label}
      </span>
      <span className="font-mono text-right text-xs tabular-nums">
        {value}
        {hint ? <span className="text-on-ink-muted ml-1.5">{hint}</span> : null}
      </span>
    </div>
  );
}

const kindTones: Record<Passage['kind'], string> = {
  project: 'text-pink',
  adr: 'text-cyan',
  playbook: 'text-lime',
  post: 'text-yellow',
  profile: 'text-orange',
};

function kindTone(kind: Passage['kind']) {
  return kindTones[kind] ?? 'text-yellow';
}

const SPLIT_MIN = 0.2;
const SPLIT_MAX = 0.8;

function clampSplit(ratio: number) {
  return Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, ratio));
}

/** Vertical split: timings above, passages below. Starts 50/50; the handle
 *  is both a pointer drag and a keyboard control (WCAG dragging alternative). */
function TraceSplit({
  top,
  bottom,
}: {
  top: ReactNode;
  bottom: ReactNode;
}) {
  const [topRatio, setTopRatio] = useState(0.5);
  const [dragging, setDragging] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const setFromClientY = useCallback((clientY: number) => {
    const el = shellRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    if (box.height <= 0) return;
    setTopRatio(clampSplit((clientY - box.top) / box.height));
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientY(e.clientY);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setFromClientY(e.clientY);
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 0.1 : 0.05;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setTopRatio((r) => clampSplit(r - step));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setTopRatio((r) => clampSplit(r + step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setTopRatio(SPLIT_MIN);
    } else if (e.key === 'End') {
      e.preventDefault();
      setTopRatio(SPLIT_MAX);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setTopRatio(0.5);
    }
  };

  const topPct = Math.round(topRatio * 100);

  return (
    <div ref={shellRef} className="mt-5 flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 overflow-y-auto overscroll-contain pr-1" style={{ flex: `${topRatio} 1 0` }}>
        {top}
      </div>

      <div
        role="separator"
        aria-orientation="horizontal"
        aria-valuemin={Math.round(SPLIT_MIN * 100)}
        aria-valuemax={Math.round(SPLIT_MAX * 100)}
        aria-valuenow={topPct}
        aria-label="Resize live-trace panes. Arrow keys move the split; Enter resets to half."
        aria-valuetext={`${topPct} percent timings, ${100 - topPct} percent passages`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => setTopRatio(0.5)}
        onKeyDown={onKeyDown}
        className={cn(
          'group relative flex h-11 shrink-0 cursor-row-resize touch-none items-center justify-center outline-none select-none',
          dragging && 'cursor-grabbing',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-x-0 h-0.5 transition-colors duration-150 motion-reduce:transition-none',
            dragging
              ? 'bg-lime'
              : 'bg-cyan group-hover:bg-lime group-focus-visible:bg-lime',
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            'border-ink-line bg-ink relative z-10 flex items-center gap-2 rounded-full border px-2.5 py-1',
            'group-hover:border-lime group-focus-visible:border-lime',
            dragging && 'border-lime',
          )}
        >
          <svg viewBox="0 0 16 10" className="text-cyan h-2.5 w-4" fill="currentColor">
            <rect x="1" y="1" width="14" height="2" rx="1" />
            <rect x="1" y="7" width="14" height="2" rx="1" />
          </svg>
          <span className="font-mono text-cyan text-[0.5625rem] font-bold tracking-wider uppercase">
            Drag
          </span>
        </span>
      </div>

      <div className="min-h-0 overflow-y-auto overscroll-contain pr-1" style={{ flex: `${1 - topRatio} 1 0` }}>
        {bottom}
      </div>
    </div>
  );
}

/** Citation markers ([1], [2]) become superscript chips inside the answer. */
function AnswerText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[\d+\])/g).map((part, i) =>
        /^\[\d+\]$/.test(part) ? (
          <sup key={i} className="font-mono text-cyan mx-0.5 text-[0.6875rem] font-bold">
            {part}
          </sup>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function Sandbox({
  indexChunks,
  indexModel,
}: {
  indexChunks: number;
  indexModel: string;
}) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [passages, setPassages] = useState<Passage[]>([]);
  const [timings, setTimings] = useState<Timings | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [ttft, setTtft] = useState<number | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Keep the newest turn in view as it streams in.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const ask = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 1) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const botId = (idRef.current += 2);
    setMessages((prev) => [
      ...prev,
      { id: botId - 1, role: 'user', text: trimmed },
      { id: botId, role: 'assistant', text: '', phase: 'retrieving' },
    ]);

    /** Update only this turn — an earlier answer must not be rewritten. */
    const patch = (fn: (m: Message) => Message) =>
      setMessages((prev) => prev.map((m) => (m.id === botId ? fn(m) : m)));

    setPhase('retrieving');
    setPassages([]);
    setTimings(null);
    setUsage(null);
    setTtft(null);
    setMode(null);
    setNotice(null);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const detail = await response.json().catch(() => null);
        setNotice(detail?.error ?? `Request failed (${response.status}).`);
        setPhase('error');
        patch((m) => ({ ...m, phase: 'error' }));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Parse the SSE frames by hand: EventSource cannot issue a POST, so the
      // response body is read directly.
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split('\n\n');
        buffer = frames.pop() ?? '';

        for (const frame of frames) {
          const line = frame.split('\n').find((l) => l.startsWith('data: '));
          if (!line) continue;

          const event = JSON.parse(line.slice(6));
          switch (event.type) {
            case 'retrieval':
              setPassages(event.passages);
              setTimings(event.timings);
              setMode(event.mode);
              if (event.degradedReason) setNotice(event.degradedReason);
              setPhase('generating');
              patch((m) => ({ ...m, phase: 'generating' }));
              break;
            case 'ttft':
              setTtft(event.ms);
              break;
            case 'delta':
              patch((m) => ({ ...m, text: m.text + event.text }));
              break;
            case 'usage':
              setUsage(event);
              break;
            case 'error':
              setNotice(event.message);
              break;
            case 'done':
              setPhase('done');
              patch((m) => ({ ...m, phase: 'done' }));
              break;
          }
        }
      }
      setPhase('done');
      patch((m) => ({ ...m, phase: 'done' }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      setNotice('Connection failed while streaming the answer.');
      setPhase('error');
      patch((m) => ({ ...m, phase: 'error' }));
    }
  }, []);

  const busy = phase === 'retrieving' || phase === 'generating';

  const submit = (q: string) => {
    setQuestion('');
    void ask(q);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
      {/* ------------------------------- Chat ------------------------------ */}
      <section
        aria-label="Ask a question"
        className="border-ink-line flex h-[26rem] flex-col overflow-hidden rounded-panel border lg:h-[min(40rem,70dvh)]"
      >
        <header className="border-ink-line flex items-center justify-between gap-3 border-b px-6 py-4">
          <h2 className="font-display text-lg uppercase">Ask the site</h2>
          <span className="font-mono text-on-ink-muted text-[0.625rem] tracking-wider uppercase">
            {indexChunks} passages
          </span>
        </header>

        {/*
         * The transcript scrolls inside the panel rather than growing the
         * page, so the composer stays put and the trace beside it stays
         * aligned with the answer it belongs to.
         */}
        <div
          ref={scrollerRef}
          aria-live="polite"
          aria-busy={busy}
          className="min-h-0 flex-1 overflow-y-auto px-6 py-6"
        >
          {messages.length === 0 ? (
            <div>
              <p className="text-on-ink text-sm leading-relaxed text-pretty">
                Answers come only from the {indexChunks} indexed passages of this site. If the
                corpus doesn&apos;t cover it, the model is instructed to say so rather than
                improvise.
              </p>
              <p className="font-mono text-on-ink-muted mt-7 text-micro uppercase">Try asking</p>
              <ul className="border-ink-line mt-3 border-t">
                {SUGGESTIONS.map((s) => (
                  <li key={s} className="border-ink-line border-b">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => submit(s)}
                      className="group text-on-ink-muted hover:text-on-ink flex w-full items-center justify-between gap-4 py-3.5 text-left text-sm disabled:opacity-40"
                    >
                      <span>{s}</span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                      >
                        →
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ol className="flex flex-col gap-5">
              {messages.map((m) =>
                m.role === 'user' ? (
                  <li key={m.id} className="flex justify-end">
                    <p className="bg-ink-soft border-ink-line max-w-[85%] rounded-2xl border px-4 py-2.5 text-sm leading-relaxed text-pretty">
                      {m.text}
                    </p>
                  </li>
                ) : (
                  <li key={m.id}>
                    {m.phase === 'retrieving' && !m.text ? (
                      <p className="font-mono text-on-ink-muted animate-pulse text-xs uppercase">
                        Retrieving…
                      </p>
                    ) : (
                      <p className="text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-pretty">
                        <AnswerText text={m.text} />
                        {m.phase === 'generating' ? (
                          <span
                            aria-hidden="true"
                            className="bg-cyan ml-0.5 inline-block h-4 w-2 animate-pulse align-middle"
                          />
                        ) : null}
                      </p>
                    )}
                  </li>
                ),
              )}
            </ol>
          )}

          {notice ? (
            <p className="border-yellow bg-yellow/10 mt-5 rounded-panel border-l-2 p-4 text-sm leading-relaxed">
              {notice}
            </p>
          ) : null}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(question);
          }}
          className="border-ink-line border-t p-4"
        >
          <label htmlFor="q" className="sr-only">
            Ask about the architecture writing
          </label>
          <div className="flex items-center gap-2">
            <input
              id="q"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={400}
              autoComplete="off"
              placeholder={
                messages.length === 0
                  ? 'Ask about the work, the decisions, or George…'
                  : 'Ask a follow-up…'
              }
              className="border-ink-line bg-ink-soft placeholder:text-on-ink-muted/60 focus-visible:border-cyan min-w-0 flex-1 rounded-full border px-5 py-3 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={busy || question.trim().length < 1}
              aria-label="Send question"
              className="bg-cyan text-ink grid size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-lime disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? (
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
                />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                  <path
                    d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="square"
                  />
                </svg>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* ----------------------------- Telemetry --------------------------- */}
      <section
        aria-label="Pipeline telemetry"
        className="border-ink-line bg-ink-soft flex h-[26rem] flex-col overflow-hidden rounded-panel border p-6 sm:p-7 lg:h-[min(40rem,70dvh)]"
      >
        <header className="flex shrink-0 items-center justify-between gap-3">
          <h2 className="font-display text-lg uppercase">Live trace</h2>
          <span
            className={cn(
              'font-mono rounded-full px-2.5 py-1 text-[0.5625rem] font-bold tracking-wider uppercase',
              mode === 'hybrid'
                ? 'bg-lime text-ink'
                : mode === 'lexical-only'
                  ? 'bg-orange text-ink'
                  : 'border-ink-line text-on-ink-muted border',
            )}
          >
            {mode ?? 'idle'}
          </span>
        </header>

        {passages.length > 0 ? (
          <TraceSplit
            top={
              <div className="border-ink-line divide-y divide-current/10 border-t">
                <div className="py-3">
                  <Stat label="Index" value={`${indexChunks} chunks`} hint={indexModel} />
                  {timings ? (
                    <>
                      <Stat label="1 · Query embed" value={`${timings.embedMs.toFixed(1)} ms`} />
                      <Stat label="2 · BM25 lexical" value={`${timings.lexicalMs.toFixed(2)} ms`} />
                      <Stat label="3 · Dense cosine" value={`${timings.denseMs.toFixed(2)} ms`} />
                      <Stat label="4 · RRF fusion" value={`${timings.fuseMs.toFixed(2)} ms`} />
                      <Stat label="Retrieval total" value={`${timings.totalMs.toFixed(1)} ms`} />
                    </>
                  ) : null}
                  {ttft !== null ? (
                    <Stat label="Time to first token" value={`${ttft} ms`} />
                  ) : null}
                  {usage ? (
                    <>
                      <Stat
                        label="Tokens in / out"
                        value={`${usage.inputTokens} / ${usage.outputTokens}`}
                      />
                      <Stat label="Cost this query" value={`$${usage.costUsd.toFixed(5)}`} />
                      <Stat label="End to end" value={`${usage.totalMs} ms`} />
                    </>
                  ) : null}
                </div>
              </div>
            }
            bottom={
              <>
                <h3 className="font-mono text-on-ink-muted mb-3 text-[0.625rem] tracking-wider uppercase">
                  Retrieved passages · fused rank
                </h3>
                <ol className="flex flex-col gap-2.5">
                  {passages.map((p) => (
                    <li key={p.id} className="border-ink-line rounded-panel border p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <a href={p.url} className="hover:text-cyan text-xs font-semibold">
                          <sup className="text-cyan font-mono mr-1">[{p.n}]</sup>
                          {p.section}
                        </a>
                        <span
                          className={cn(
                            'font-mono shrink-0 text-[0.5625rem] uppercase',
                            kindTone(p.kind),
                          )}
                        >
                          {p.kind}
                        </span>
                      </div>
                      <p className="text-on-ink mt-1.5 line-clamp-2 text-[0.6875rem] leading-relaxed">
                        {p.excerpt}
                      </p>
                      <div className="font-mono text-on-ink-muted mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[0.5625rem] uppercase">
                        <span>RRF {p.score.toFixed(4)}</span>
                        <span className={p.denseRank ? 'text-cyan' : undefined}>
                          dense {p.denseRank ? `#${p.denseRank}` : '—'}
                        </span>
                        <span className={p.lexicalRank ? 'text-yellow' : undefined}>
                          bm25 {p.lexicalRank ? `#${p.lexicalRank}` : '—'}
                        </span>
                        <span>{p.tokens} tok</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            }
          />
        ) : (
          <div className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="border-ink-line divide-y divide-current/10 border-t">
              <div className="py-3">
                <Stat label="Index" value={`${indexChunks} chunks`} hint={indexModel} />
              </div>
            </div>
            <p className="text-on-ink mt-5 text-xs leading-relaxed">
              Ask something to see the retrieval trace: per-stage timings, which path found each
              passage, and the fused ranking that decided what the model was shown.
            </p>
          </div>
        )}

        <div className="border-ink-line mt-auto flex shrink-0 flex-wrap gap-2 border-t pt-5">
          <Tag>Hybrid BM25 + dense</Tag>
          <Tag>RRF k=60</Tag>
          <Tag>SSE</Tag>
        </div>
      </section>
    </div>
  );
}
