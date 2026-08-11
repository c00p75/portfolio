'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { Tag } from '@/components/ui/Sticker';

type Passage = {
  n: number;
  id: string;
  url: string;
  title: string;
  section: string;
  kind: 'adr' | 'playbook' | 'post';
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

const SUGGESTIONS = [
  'Why was a managed vector database rejected?',
  'How does the retrieval fall back when embeddings fail?',
  'What does George think about AI-generated code review?',
  'How is the trade-off matrix scored?',
];

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

function kindTone(kind: Passage['kind']) {
  return kind === 'adr' ? 'text-cyan-ink' : kind === 'playbook' ? 'text-lime-ink' : 'text-yellow-ink';
}

export function Sandbox({ indexChunks, indexModel }: { indexChunks: number; indexModel: string }) {
  const [question, setQuestion] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [answer, setAnswer] = useState('');
  const [passages, setPassages] = useState<Passage[]>([]);
  const [timings, setTimings] = useState<Timings | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [ttft, setTtft] = useState<number | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const ask = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 3) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPhase('retrieving');
    setAnswer('');
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
              break;
            case 'ttft':
              setTtft(event.ms);
              break;
            case 'delta':
              setAnswer((prev) => prev + event.text);
              break;
            case 'usage':
              setUsage(event);
              break;
            case 'error':
              setNotice(event.message);
              break;
            case 'done':
              setPhase('done');
              break;
          }
        }
      }
      setPhase((p) => (p === 'done' ? p : 'done'));
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      setNotice('Connection failed while streaming the answer.');
      setPhase('error');
    }
  }, []);

  const busy = phase === 'retrieving' || phase === 'generating';

  // Render citation markers as distinguishable chips.
  const rendered = answer.split(/(\[\d+\])/g);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
      {/* ------------------------------- Chat ------------------------------ */}
      <section
        aria-label="Ask a question"
        className="border-ink-line flex min-h-[30rem] flex-col rounded-panel border p-6 sm:p-7"
      >
        <h2 className="sr-only">Ask a question</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void ask(question);
          }}
          className="flex flex-col gap-3"
        >
          <label htmlFor="q" className="font-mono text-on-ink-muted text-micro uppercase">
            Ask about the architecture writing
          </label>
          <div className="flex gap-2">
            <input
              id="q"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={400}
              placeholder="Why was pgvector rejected?"
              className="border-ink-line bg-ink-soft placeholder:text-on-ink-muted/60 min-w-0 flex-1 rounded-full border px-5 py-3 text-sm outline-none focus-visible:border-cyan"
            />
            <button
              type="submit"
              disabled={busy || question.trim().length < 3}
              className="bg-cyan text-ink-fixed font-mono shrink-0 rounded-full px-5 py-3 text-micro font-bold uppercase transition-colors hover:bg-lime disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? 'Working' : 'Ask'}
            </button>
          </div>
        </form>

        <ul className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <li key={s}>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setQuestion(s);
                  void ask(s);
                }}
                className="border-ink-line text-on-ink-muted rounded-full border px-3 py-1.5 text-left text-xs transition-colors hover:border-current hover:text-on-ink disabled:opacity-40"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>

        <div
          ref={answerRef}
          aria-live="polite"
          aria-busy={busy}
          className="mt-7 flex-1 text-[0.9375rem] leading-relaxed"
        >
          {phase === 'idle' ? (
            <p className="text-on-ink-muted text-sm">
              Answers come only from the {indexChunks} indexed passages of this site. If the corpus
              doesn&apos;t cover it, the model is instructed to say so rather than improvise.
            </p>
          ) : null}

          {phase === 'retrieving' ? (
            <p className="font-mono text-on-ink-muted animate-pulse text-xs uppercase">
              Retrieving…
            </p>
          ) : null}

          {answer ? (
            <p className="whitespace-pre-wrap text-pretty">
              {rendered.map((part, i) =>
                /^\[\d+\]$/.test(part) ? (
                  <sup key={i} className="text-cyan-ink font-mono mx-0.5 text-[0.6875rem] font-bold">
                    {part}
                  </sup>
                ) : (
                  <span key={i}>{part}</span>
                ),
              )}
              {phase === 'generating' ? (
                <span aria-hidden="true" className="bg-cyan ml-0.5 inline-block h-4 w-2 animate-pulse align-middle" />
              ) : null}
            </p>
          ) : null}

          {notice ? (
            <p className="border-yellow bg-yellow/10 mt-5 rounded-panel border-l-2 p-4 text-sm leading-relaxed">
              {notice}
            </p>
          ) : null}
        </div>
      </section>

      {/* ----------------------------- Telemetry --------------------------- */}
      <section
        aria-label="Pipeline telemetry"
        className="border-ink-line bg-ink-soft flex flex-col rounded-panel border p-6 sm:p-7"
      >
        <header className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg uppercase">Live trace</h2>
          <span
            className={cn(
              'font-mono rounded-full px-2.5 py-1 text-[0.5625rem] font-bold tracking-wider uppercase',
              mode === 'hybrid'
                ? 'bg-lime text-ink-fixed'
                : mode === 'lexical-only'
                  ? 'bg-orange text-ink-fixed'
                  : 'border-ink-line text-on-ink-muted border',
            )}
          >
            {mode ?? 'idle'}
          </span>
        </header>

        <div className="border-ink-line mt-5 divide-y divide-current/10 border-t">
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
            {ttft !== null ? <Stat label="Time to first token" value={`${ttft} ms`} /> : null}
            {usage ? (
              <>
                <Stat label="Tokens in / out" value={`${usage.inputTokens} / ${usage.outputTokens}`} />
                <Stat label="Cost this query" value={`$${usage.costUsd.toFixed(5)}`} />
                <Stat label="End to end" value={`${usage.totalMs} ms`} />
              </>
            ) : null}
          </div>
        </div>

        {passages.length > 0 ? (
          <div className="mt-5">
            <h3 className="font-mono text-on-ink-muted mb-3 text-[0.625rem] tracking-wider uppercase">
              Retrieved passages · fused rank
            </h3>
            <ol className="flex flex-col gap-2.5">
              {passages.map((p) => (
                <li key={p.id} className="border-ink-line rounded-panel border p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <a
                      href={p.url}
                      className="text-xs font-semibold hover:text-cyan-ink"
                    >
                      <sup className="text-cyan-ink font-mono mr-1">[{p.n}]</sup>
                      {p.section}
                    </a>
                    <span className={cn('font-mono shrink-0 text-[0.5625rem] uppercase', kindTone(p.kind))}>
                      {p.kind}
                    </span>
                  </div>
                  <p className="text-on-ink-muted mt-1.5 line-clamp-2 text-[0.6875rem] leading-relaxed">
                    {p.excerpt}
                  </p>
                  <div className="font-mono text-on-ink-muted mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[0.5625rem] uppercase">
                    <span>RRF {p.score.toFixed(4)}</span>
                    <span className={p.denseRank ? 'text-cyan-ink' : undefined}>
                      dense {p.denseRank ? `#${p.denseRank}` : '—'}
                    </span>
                    <span className={p.lexicalRank ? 'text-yellow-ink' : undefined}>
                      bm25 {p.lexicalRank ? `#${p.lexicalRank}` : '—'}
                    </span>
                    <span>{p.tokens} tok</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <p className="text-on-ink-muted mt-5 text-xs leading-relaxed">
            Ask something to see the retrieval trace: per-stage timings, which path found each
            passage, and the fused ranking that decided what the model was shown.
          </p>
        )}

        <div className="border-ink-line mt-auto flex flex-wrap gap-2 border-t pt-5">
          <Tag>Hybrid BM25 + dense</Tag>
          <Tag>RRF k=60</Tag>
          <Tag>SSE</Tag>
        </div>
      </section>
    </div>
  );
}
