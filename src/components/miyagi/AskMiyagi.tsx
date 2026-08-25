'use client';

import { useCallback, useRef, useState } from 'react';
import { streamAsk, type AskHistoryTurn } from '@/lib/rag/ask-stream';

/**
 * Ask Miyagi.
 *
 * Same retrieval endpoint as the portfolio's assistant, deliberately nothing
 * else in common: this one is a sheet of paper the tutor writes onto, sits
 * inline in the page rather than in a floating widget, and asks the questions a
 * developer evaluating an MCP server would ask.
 *
 * Assistant turns carry the server's signature and replay it, which is what
 * lets the server tell its own prior turn from one written by a caller. Without
 * that the safety rules in the system prompt can be read in a context the
 * server never produced.
 */

type Turn = {
  role: 'user' | 'assistant';
  text: string;
  sig?: string;
};

const KATA = [
  'What makes it safe to run shell commands?',
  'How does it stop a model running something destructive?',
  'Why stdio instead of a hosted server?',
  'What does a teaching card contain?',
];

export function AskMiyagi() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || busy) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const history: AskHistoryTurn[] = turns
        .filter((t) => t.text.trim().length > 0)
        .map((t) => ({ role: t.role, content: t.text, sig: t.sig }));

      setDraft('');
      setNotice(null);
      setBusy(true);
      setTurns((prev) => [
        ...prev,
        { role: 'user', text: trimmed },
        { role: 'assistant', text: '' },
      ]);

      const patchLast = (fn: (t: Turn) => Turn) =>
        setTurns((prev) => prev.map((t, i) => (i === prev.length - 1 ? fn(t) : t)));

      try {
        await streamAsk(trimmed, {
          signal: controller.signal,
          history,
          onEvent: (event) => {
            switch (event.type) {
              case 'delta':
                patchLast((t) => ({ ...t, text: t.text + event.text }));
                break;
              case 'error':
                setNotice(event.message);
                break;
              case 'done':
                patchLast((t) => ({ ...t, sig: event.sig }));
                break;
            }
          },
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setNotice((error as Error).message || 'The line went quiet. Try again.');
        }
      } finally {
        setBusy(false);
      }
    },
    [busy, turns],
  );

  const started = turns.length > 0;

  return (
    <div className="dojo-scroll p-6 sm:p-9">
      <div className="flex items-baseline justify-between gap-4">
        <h3
          className="dojo-display text-2xl sm:text-3xl"
          style={{ color: 'var(--on-washi)' }}
        >
          Ask Miyagi
        </h3>
        <span className="dojo-mono text-[0.6875rem] tracking-[0.18em] uppercase" style={{ color: 'var(--on-washi-quiet)' }}>
          Answers from the written record
        </span>
      </div>

      <hr className="dojo-brush mt-5 mb-6" />

      {!started ? (
        <p className="max-w-2xl leading-relaxed" style={{ color: 'var(--on-washi-quiet)' }}>
          It answers from what is actually written about this server and the rest of the
          site. If something is not in the record it says so rather than inventing it, which
          is the part worth testing.
        </p>
      ) : null}

      {/* Transcript */}
      {started ? (
        <div className="flex flex-col gap-6">
          {turns.map((t, i) =>
            t.role === 'user' ? (
              <p
                key={i}
                className="dojo-mono text-sm leading-relaxed"
                style={{ color: 'var(--seal-deep)' }}
              >
                <span aria-hidden="true">&gt; </span>
                {t.text}
              </p>
            ) : (
              <div key={i} className="max-w-2xl leading-relaxed whitespace-pre-wrap">
                {t.text}
                {busy && i === turns.length - 1 ? (
                  <span className="dojo-cursor ml-1" aria-label="thinking" />
                ) : null}
              </div>
            ),
          )}
        </div>
      ) : null}

      {notice ? (
        <p
          className="dojo-mono mt-5 text-xs leading-relaxed"
          style={{ color: 'var(--seal-deep)' }}
          role="status"
        >
          {notice}
        </p>
      ) : null}

      {/* Composer */}
      <form
        className="mt-8 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
      >
        <label className="sr-only" htmlFor="ask-miyagi">
          Ask about Miyagi
        </label>
        <input
          id="ask-miyagi"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about the safety model, the roadmaps, anything…"
          maxLength={400}
          autoComplete="off"
          className="dojo-mono min-w-0 flex-1 rounded-sm px-4 py-3 text-sm"
          style={{
            background: 'rgba(35,32,27,0.05)',
            border: '1px solid var(--washi-dim)',
            color: 'var(--on-washi)',
          }}
        />
        <button type="submit" className="dojo-btn dojo-btn-solid justify-center" disabled={busy}>
          {busy ? 'Thinking' : 'Ask'}
        </button>
      </form>

      {/* Kata: the openers */}
      {!started ? (
        <ul className="mt-6 flex flex-wrap gap-2">
          {KATA.map((k) => (
            <li key={k}>
              <button
                type="button"
                onClick={() => void send(k)}
                className="dojo-mono rounded-sm px-3 py-2 text-xs leading-snug transition-colors"
                style={{
                  border: '1px solid var(--washi-dim)',
                  color: 'var(--on-washi-quiet)',
                }}
              >
                {k}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
