'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { streamAsk, type AskHistoryTurn } from '@/lib/rag/ask-stream';
import { CHAT_SUGGESTIONS } from '@/lib/rag/suggestions';
import { subscribeAskGeorge } from './ask-bus';

type Phase = 'idle' | 'retrieving' | 'generating' | 'done' | 'error';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  phase?: Phase;
  /** Server HMAC over an assistant answer, replayed so the server can trust it. */
  sig?: string;
};

// Shared with the ingest, which precomputes a vector for each one — see
// `suggestions.ts`. Editing the list here alone would silently cost that.
const SUGGESTIONS = CHAT_SUGGESTIONS;

/**
 * Shown after the assistant offers topics and waits. These are real questions
 * so a click retrieves the right passages instead of searching "proceed".
 */
const OFFER_REPLIES = [
  { label: 'His work', query: "What is George working on right now?" },
  { label: 'His writing', query: 'What has George written about?' },
  { label: 'His background', query: 'Where did George study and what has he done?' },
  { label: 'His certifications', query: "What are George's certifications?" },
] as const;

function renderAnswer(text: string) {
  return text.split(/(\[\d+\])/g).map((part, i) =>
    /^\[\d+\]$/.test(part) ? (
      <sup key={i} className="font-mono mx-0.5 text-[0.6875rem] font-bold">
        {part}
      </sup>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

/**
 * Site-wide chat. The /sandbox page keeps the full telemetry panel; everywhere
 * else this is the way in. Hidden on /sandbox so two composers do not compete.
 */
export function AskGeorgeWidget({ indexChunks }: { indexChunks: number }) {
  const pathname = usePathname();
  const panelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [notice, setNotice] = useState<string | null>(null);

  const show = useCallback((question?: string) => {
    if (question) setDraft(question);
    setOpen(true);
  }, []);
  const hide = useCallback(() => setOpen(false), []);

  const hidden = pathname === '/sandbox';
  const busy = phase === 'retrieving' || phase === 'generating';

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  const askRef = useRef<(q: string) => Promise<void>>(async () => undefined);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, phase]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, hide]);

  const ask = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (trimmed.length < 1) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userId = `u-${Date.now()}`;
      const assistantId = `a-${Date.now()}`;
      const history: AskHistoryTurn[] = messages
        .filter((m) => m.text.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.text, sig: m.sig }));

      setDraft('');
      setNotice(null);
      setPhase('retrieving');
      setMessages((prev) => [
        ...prev,
        { id: userId, role: 'user', text: trimmed },
        { id: assistantId, role: 'assistant', text: '', phase: 'retrieving' },
      ]);

      try {
        await streamAsk(trimmed, {
          signal: controller.signal,
          history,
          onEvent: (event) => {
            switch (event.type) {
              case 'retrieval':
                setPhase('generating');
                if (event.degradedReason) setNotice(event.degradedReason);
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, phase: 'generating' } : m)),
                );
                break;
              case 'delta':
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, text: m.text + event.text } : m)),
                );
                break;
              case 'error':
                setNotice(event.message);
                break;
              case 'done':
                setPhase('done');
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, phase: 'done', sig: event.sig } : m,
                  ),
                );
                break;
            }
          },
        });
        setPhase((p) => (p === 'done' ? p : 'done'));
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        setNotice(error instanceof Error ? error.message : 'Connection failed while streaming.');
        setPhase('error');
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, phase: 'error' } : m)),
        );
      }
    },
    [messages, setDraft],
  );

  askRef.current = ask;

  useEffect(() => {
    return subscribeAskGeorge((question) => {
      show(question);
      if (question) void askRef.current(question);
    });
  }, [show]);

  if (hidden) return null;

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open ? (
        <section
          id={panelId}
          role="dialog"
          aria-label="Ask George"
          aria-modal="false"
          className="bg-cream text-on-cream pointer-events-auto flex h-[min(36rem,calc(100dvh-7rem))] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-panel shadow-[0_18px_50px_-18px_rgba(0,0,0,0.55)]"
        >
          <header className="border-cream-line flex items-start justify-between gap-3 border-b px-5 py-4">
            <div>
              <p className="font-mono text-micro font-semibold tracking-widest uppercase opacity-70">
                Ask George
              </p>
              <p className="font-display mt-1 text-xl uppercase">Work, writing, biography</p>
            </div>
            <button
              type="button"
              onClick={hide}
              className="font-mono mt-0.5 rounded-full border border-current/20 px-2.5 py-1 text-[0.625rem] font-bold tracking-widest uppercase hover:border-current"
            >
              Close
            </button>
          </header>

          <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {messages.length === 0 ? (
              <div>
                <p className="text-sm leading-relaxed text-pretty">
                  Hi, ask about George&apos;s work, education or the writing on this site. Facts
                  come from the {indexChunks} indexed passages. If it is not in there, I say so
                  rather than guess.
                </p>
                <ul className="mt-4 flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void ask(s)}
                        className="w-full rounded-full border border-current/20 px-3 py-2 text-left text-xs leading-snug hover:border-current disabled:opacity-40"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
              <ol className="flex flex-col gap-4">
                {messages.map((m) => (
                  <li key={m.id} className={cn(m.role === 'user' && 'flex justify-end')}>
                    {m.role === 'user' ? (
                      <p className="bg-cream-dim max-w-[90%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed">
                        {m.text}
                      </p>
                    ) : m.phase === 'retrieving' && !m.text ? (
                      <p className="font-mono animate-pulse text-xs uppercase opacity-70">
                        Thinking…
                      </p>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-pretty">
                        {renderAnswer(m.text)}
                        {m.phase === 'generating' ? (
                          <span
                            aria-hidden="true"
                            className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-current align-middle"
                          />
                        ) : null}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
              {(() => {
                const last = messages[messages.length - 1];
                const waiting =
                  last?.role === 'assistant' &&
                  last.phase === 'done' &&
                  /[?]/.test(last.text);
                if (!waiting || busy) return null;
                return (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {OFFER_REPLIES.map((reply) => (
                      <li key={reply.query}>
                        <button
                          type="button"
                          onClick={() => void ask(reply.query)}
                          className="rounded-full border border-current/20 px-3 py-1.5 text-xs leading-snug hover:border-current"
                        >
                          {reply.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                );
              })()}
              </>
            )}

            {notice ? (
              <p className="border-yellow bg-yellow/15 mt-4 rounded-panel border-l-2 p-3 text-xs leading-relaxed">
                {notice}
              </p>
            ) : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask(draft);
            }}
            className="border-cream-line border-t px-4 py-3"
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={400}
                placeholder="Hi, or ask about George…"
                className="border-cream-line bg-cream-dim min-w-0 flex-1 rounded-full border px-4 py-2.5 text-sm outline-none placeholder:text-current/45 focus-visible:border-cyan"
              />
              <button
                type="submit"
                disabled={busy || draft.trim().length < 1}
                className="bg-cyan text-ink font-mono shrink-0 rounded-full px-4 py-2.5 text-micro font-bold uppercase hover:bg-lime disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? '…' : 'Send'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => (open ? hide() : show())}
        aria-expanded={open}
        aria-controls={panelId}
        className="ask-ai-border bg-cyan text-ink pointer-events-auto flex items-center gap-1.5 rounded-full px-4 py-3 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.55)] transition-colors hover:bg-lime"
      >
        <span aria-hidden="true" className="grid h-6 w-6 place-items-center">
          <Image src="/icons/ai-chat.png" alt="" width={24} height={24} className="h-5 w-5" />
        </span>
        <span className="font-mono text-micro font-bold tracking-widest uppercase">
          {open ? 'Hide chat' : 'Ask George'}
        </span>
      </button>
    </div>
  );
}
