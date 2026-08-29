'use client';

import { useCallback, useRef, useState } from 'react';
import { streamAsk, type AskHistoryTurn } from '@/lib/rag/ask-stream';
import './ask.css';

/**
 * Ask Miyagi.
 *
 * Same retrieval endpoint as the portfolio's assistant, with `scope: miyagi`
 * so the index and the prompt stay on this product. Deliberately nothing else
 * in common: this one is a sheet of paper the tutor writes onto, sits inline
 * in the page rather than in a floating widget, and asks the questions a
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
  'What is the difference between drill and ride-along?',
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
          scope: 'miyagi',
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
    <div className="am">
      <div className="am-head">
        <h3 className="am-title">Ask Miyagi</h3>
        <span className="am-note">Answers from the Miyagi record</span>
      </div>

      <hr className="am-rule" />

      {!started ? (
        <p className="am-intro">
          It answers from what is written about Miyagi — install, tools, modes, XP, safety,
          roadmaps. Other projects and biography are out of scope. If something is not in the
          record it says so rather than inventing it.
        </p>
      ) : null}

      {started ? (
        <div className="am-thread">
          {turns.map((t, i) =>
            t.role === 'user' ? (
              <p key={i} className="am-q">
                <span aria-hidden="true">&gt; </span>
                {t.text}
              </p>
            ) : (
              <div key={i} className="am-a">
                {t.text}
                {busy && i === turns.length - 1 ? (
                  <span className="am-caret" aria-label="thinking" />
                ) : null}
              </div>
            ),
          )}
        </div>
      ) : null}

      {notice ? (
        <p className="am-notice" role="status">
          {notice}
        </p>
      ) : null}

      <form
        className="am-form"
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
          className="am-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about Miyagi — safety, modes, roadmaps…"
          maxLength={400}
          autoComplete="off"
        />
        <button type="submit" className="am-send" disabled={busy}>
          {busy ? 'Thinking' : 'Ask'}
        </button>
      </form>

      {!started ? (
        <ul className="am-kata">
          {KATA.map((k) => (
            <li key={k}>
              <button type="button" onClick={() => void send(k)}>
                {k}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
