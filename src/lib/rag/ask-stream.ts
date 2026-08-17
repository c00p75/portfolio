/** Client-side SSE reader for POST /api/ask. EventSource cannot issue a POST. */

export type AskHistoryTurn = { role: 'user' | 'assistant'; content: string };

export type AskEvent =
  | { type: 'meta'; index: { chunks: number; model: string }; mode: string }
  | {
      type: 'retrieval';
      passages: unknown[];
      timings: unknown;
      mode: string;
      degradedReason?: string;
    }
  | { type: 'ttft'; ms: number }
  | { type: 'delta'; text: string }
  | { type: 'usage'; inputTokens: number; outputTokens: number; costUsd: number; totalMs: number }
  | { type: 'error'; message: string; recoverable?: boolean }
  | { type: 'done' };

export async function streamAsk(
  question: string,
  opts: {
    signal?: AbortSignal;
    history?: AskHistoryTurn[];
    onEvent: (event: AskEvent) => void;
  },
): Promise<void> {
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      question,
      history: opts.history?.slice(-6),
    }),
    signal: opts.signal,
  });

  if (!response.ok || !response.body) {
    const detail = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(detail?.error ?? `Request failed (${response.status}).`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';

    for (const frame of frames) {
      const line = frame.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      opts.onEvent(JSON.parse(line.slice(6)) as AskEvent);
    }
  }
}
