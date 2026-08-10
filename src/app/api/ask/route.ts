import Anthropic from '@anthropic-ai/sdk';
import { getRetriever, indexIsEmpty, indexMeta } from '@/lib/rag/index-loader';
import { checkRateLimit, clientIp } from '@/lib/rag/ratelimit';
import type { Retrieved } from '@/lib/rag/types';

export const runtime = 'nodejs';
/** Retrieval reads a static artifact and generation is per-request; never cache. */
export const dynamic = 'force-dynamic';

const MODEL = process.env.ANSWER_MODEL ?? 'claude-opus-5';
/** Bounds the worst-case spend of any single request. Covers thinking + text. */
const MAX_TOKENS = 1200;
const TOP_K = 6;
const MAX_QUESTION_CHARS = 400;

/** Claude Opus 5 list price, USD per million tokens — used for the cost readout. */
const PRICE_PER_MTOK = { input: 5, output: 25 } as const;

const SYSTEM_PROMPT = `You answer questions about George M'sapenda's engineering writing, using only the passages provided.

Rules:
- Answer only from the passages. If they do not contain the answer, say so plainly and name what is there instead. Never fill a gap from general knowledge.
- Cite with bracketed numbers matching the passage numbers, like [2]. Cite the specific passage a claim came from.
- Lead with the answer. Two or three short paragraphs at most; no preamble, no restating the question.
- Write in plain prose. No headers, no bullet lists unless the answer is genuinely a list.
- When the passages show a trade-off or a rejected option, say what was given up — that is usually the substance of the question.
- Refer to George in the third person.`;

type SseEvent =
  | { type: 'meta'; index: { chunks: number; model: string }; mode: string }
  | { type: 'retrieval'; passages: unknown[]; timings: unknown; mode: string; degradedReason?: string }
  | { type: 'ttft'; ms: number }
  | { type: 'delta'; text: string }
  | { type: 'usage'; inputTokens: number; outputTokens: number; costUsd: number; totalMs: number }
  | { type: 'error'; message: string; recoverable: boolean }
  | { type: 'done' };

function sse(event: SseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/** Trim passages to what the UI needs — the full chunk text is sent for display. */
function serialisePassages(passages: Retrieved[]) {
  return passages.map((p, i) => ({
    n: i + 1,
    id: p.chunk.id,
    url: p.chunk.url,
    title: p.chunk.title,
    section: p.chunk.section,
    kind: p.chunk.kind,
    tokens: p.chunk.tokens,
    score: Math.round(p.score * 10000) / 10000,
    denseRank: p.denseRank,
    lexicalRank: p.lexicalRank,
    excerpt: p.chunk.text.length > 420 ? `${p.chunk.text.slice(0, 420)}…` : p.chunk.text,
  }));
}

export async function POST(request: Request) {
  const started = performance.now();

  // ---- Input validation ---------------------------------------------------
  let question: string;
  try {
    const body = (await request.json()) as { question?: unknown };
    if (typeof body.question !== 'string') {
      return Response.json({ error: 'Expected a "question" string.' }, { status: 400 });
    }
    question = body.question.trim();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (question.length < 3) {
    return Response.json({ error: 'That question is too short.' }, { status: 400 });
  }
  if (question.length > MAX_QUESTION_CHARS) {
    return Response.json(
      { error: `Questions are capped at ${MAX_QUESTION_CHARS} characters.` },
      { status: 400 },
    );
  }

  // ---- Rate limiting ------------------------------------------------------
  const limit = checkRateLimit(clientIp(request.headers));
  if (!limit.ok) {
    return Response.json(
      { error: 'Rate limit reached. This is a demo endpoint with a deliberately small budget.' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    );
  }

  if (indexIsEmpty()) {
    return Response.json(
      { error: 'The retrieval index has not been built. Run `npm run ingest`.' },
      { status: 503 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // ---- Stream -------------------------------------------------------------
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: SseEvent) => controller.enqueue(encoder.encode(sse(event)));

      try {
        const meta = indexMeta();
        send({ type: 'meta', index: { chunks: meta.chunks, model: meta.model }, mode: 'starting' });

        // --- Retrieval ----------------------------------------------------
        const retrieval = await getRetriever().search(question, TOP_K);
        send({
          type: 'retrieval',
          passages: serialisePassages(retrieval.passages),
          timings: retrieval.timings,
          mode: retrieval.mode,
          degradedReason: retrieval.degradedReason,
        });

        if (retrieval.passages.length === 0) {
          send({
            type: 'error',
            message: 'Nothing in the corpus matched that question closely enough to answer from.',
            recoverable: true,
          });
          send({ type: 'done' });
          return;
        }

        // Generation is the only part that needs a key; retrieval above already
        // succeeded, so a missing key degrades to "here are the sources".
        if (!apiKey) {
          send({
            type: 'error',
            message:
              'Generation is unavailable (no API key configured), but retrieval ran — the cited passages below are the real result.',
            recoverable: true,
          });
          send({ type: 'done' });
          return;
        }

        // --- Generation ---------------------------------------------------
        const context = retrieval.passages
          .map(
            (p, i) =>
              `[${i + 1}] ${p.chunk.title} — ${p.chunk.section} (${p.chunk.url})\n${p.chunk.text}`,
          )
          .join('\n\n---\n\n');

        const client = new Anthropic({ apiKey });
        let firstToken = 0;

        const anthropicStream = client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          // Low effort is genuinely strong on this model and keeps the demo
          // responsive; thinking stays on (the default) rather than disabled,
          // which avoids the reasoning-leak failure mode.
          output_config: { effort: 'low' },
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `Passages:\n\n${context}\n\n---\n\nQuestion: ${question}`,
            },
          ],
        });

        anthropicStream.on('text', (delta) => {
          if (firstToken === 0) {
            firstToken = performance.now();
            send({ type: 'ttft', ms: Math.round(firstToken - started) });
          }
          send({ type: 'delta', text: delta });
        });

        const final = await anthropicStream.finalMessage();

        if (final.stop_reason === 'refusal') {
          send({
            type: 'error',
            message: 'The model declined to answer that request.',
            recoverable: true,
          });
        }

        const inputTokens = final.usage.input_tokens;
        const outputTokens = final.usage.output_tokens;
        send({
          type: 'usage',
          inputTokens,
          outputTokens,
          costUsd:
            (inputTokens * PRICE_PER_MTOK.input + outputTokens * PRICE_PER_MTOK.output) / 1_000_000,
          totalMs: Math.round(performance.now() - started),
        });

        send({ type: 'done' });
      } catch (error) {
        const message =
          error instanceof Anthropic.RateLimitError
            ? 'The model API is rate-limited right now. The retrieved passages below are still the real result.'
            : error instanceof Anthropic.APIError
              ? `Model API error (${error.status}). Retrieval succeeded; generation did not.`
              : 'Something failed while answering. Retrieval results, if any, are shown below.';
        send({ type: 'error', message, recoverable: true });
        send({ type: 'done' });
      } finally {
        // Single owner of closing. Guarded because the client may already have
        // disconnected, which detaches the controller.
        try {
          controller.close();
        } catch {
          /* stream already torn down by the client */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      /* Disables proxy buffering, which otherwise defeats streaming entirely. */
      'x-accel-buffering': 'no',
    },
  });
}
