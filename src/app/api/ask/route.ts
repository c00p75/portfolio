import { getRetriever, indexIsEmpty, indexMeta } from '@/lib/rag/index-loader';
import {
  AllProvidersFailedError,
  NoProviderConfiguredError,
  configuredProviders,
  generate,
} from '@/lib/rag/generate';
import { checkRateLimit, clientIp } from '@/lib/rag/ratelimit';
import {
  assistantIsWaiting,
  isAcknowledgement,
  isConversationalTurn,
  lastAssistantContent,
  retrievalQuery,
} from '@/lib/rag/conversation';
import { signAssistantTurn, verifyAssistantTurn } from '@/lib/rag/history';
import { MIYAGI_SYSTEM_PROMPT, SITE_SYSTEM_PROMPT } from '@/lib/rag/prompts';
import { isAskScope, type AskScope } from '@/lib/rag/scope';
import type { Retrieved } from '@/lib/rag/types';

export const runtime = 'nodejs';
/** Retrieval reads a static artifact and generation is per-request; never cache. */
export const dynamic = 'force-dynamic';

/** Bounds the worst-case spend of any single request. Covers thinking + text. */
const MAX_TOKENS = 1200;
const TOP_K = 6;
const MAX_QUESTION_CHARS = 400;

type SseEvent =
  | {
      type: 'meta';
      index: { chunks: number; model: string };
      mode: string;
      /** The generation fallback chain, in the order it will be tried. */
      providers: { id: string; label: string }[];
    }
  | { type: 'retrieval'; passages: unknown[]; timings: unknown; mode: string; degradedReason?: string }
  | { type: 'ttft'; ms: number }
  | { type: 'delta'; text: string }
  | {
      type: 'usage';
      inputTokens: number;
      outputTokens: number;
      costUsd: number;
      totalMs: number;
      provider: string;
      model: string;
      fellBackFrom: string[];
    }
  | { type: 'error'; message: string; recoverable: boolean }
  /** `sig` authenticates this answer if the client replays it as history. */
  | { type: 'done'; sig?: string };

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
  let history: { role: 'user' | 'assistant'; content: string }[] = [];
  let scope: AskScope = 'site';
  try {
    const body = (await request.json()) as { question?: unknown; history?: unknown; scope?: unknown };
    if (typeof body.question !== 'string') {
      return Response.json({ error: 'Expected a "question" string.' }, { status: 400 });
    }
    question = body.question.trim();
    if (isAskScope(body.scope)) scope = body.scope;
    if (Array.isArray(body.history)) {
      history = body.history
        .filter((turn): turn is { role: 'user' | 'assistant'; content: string; sig?: unknown } => {
          if (!turn || typeof turn !== 'object') return false;
          const t = turn as { role?: unknown; content?: unknown };
          return (
            (t.role === 'user' || t.role === 'assistant') &&
            typeof t.content === 'string' &&
            t.content.trim().length > 0
          );
        })
        .slice(-6)
        .map((t) => ({ role: t.role, content: t.content.trim().slice(0, 800), sig: t.sig }))
        // An assistant turn is only replayed into the prompt if this server
        // signed it. Unsigned or tampered turns are dropped rather than
        // rejected, so an ordinary stale tab degrades to a shorter memory
        // instead of an error — but forged assistant speech never reaches the
        // model, which is what the safety rules in the system prompt assume.
        .filter((t) => t.role === 'user' || verifyAssistantTurn(t.content, t.sig))
        .map((t) => ({ role: t.role, content: t.content }));
    }
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (question.length < 1) {
    return Response.json({ error: 'Say something first.' }, { status: 400 });
  }
  if (question.length > MAX_QUESTION_CHARS) {
    return Response.json(
      { error: `Questions are capped at ${MAX_QUESTION_CHARS} characters.` },
      { status: 400 },
    );
  }

  // ---- Rate limiting ------------------------------------------------------
  const limit = await checkRateLimit(clientIp(request.headers));
  if (!limit.ok) {
    return Response.json(
      { error: 'Rate limit reached. This is a demo endpoint with a deliberately small budget.' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    );
  }

  const social = isConversationalTurn(question, history);
  const lastAssistant = lastAssistantContent(history);
  const answeringOffer = assistantIsWaiting(lastAssistant);

  if (!social && indexIsEmpty(scope)) {
    return Response.json(
      {
        error:
          scope === 'miyagi'
            ? 'The Miyagi record is not in the retrieval index. Run `npm run ingest`.'
            : 'The retrieval index has not been built. Run `npm run ingest`.',
      },
      { status: 503 },
    );
  }

  // ---- Stream -------------------------------------------------------------
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: SseEvent) => controller.enqueue(encoder.encode(sse(event)));

      try {
        const meta = indexMeta(scope);
        send({
          type: 'meta',
          index: { chunks: meta.chunks, model: meta.model },
          mode: 'starting',
          providers: configuredProviders(),
        });

        // --- Retrieval ----------------------------------------------------
        // Greetings and small talk skip the index: retrieving on "hi" returns
        // random passages and the model starts citing them.
        const retrieval = social
          ? {
              passages: [] as Retrieved[],
              timings: { embedMs: 0, lexicalMs: 0, denseMs: 0, fuseMs: 0, totalMs: 0 },
              mode: 'conversation',
              degradedReason: undefined as string | undefined,
            }
          : await getRetriever(scope).search(retrievalQuery(question, history), TOP_K);

        send({
          type: 'retrieval',
          passages: serialisePassages(retrieval.passages),
          timings: retrieval.timings,
          mode: retrieval.mode,
          degradedReason: retrieval.degradedReason,
        });

        if (!social && retrieval.passages.length === 0 && scope !== 'miyagi') {
          send({
            type: 'error',
            message: 'Nothing in the corpus matched that question closely enough to answer from.',
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

        let firstToken = 0;
        let answer = '';

        const earlier =
          history.length > 0
            ? `Earlier turns:\n${history.map((t) => `${t.role === 'user' ? 'Visitor' : 'Assistant'}: ${t.content}`).join('\n')}\n\n---\n\n`
            : '';

        const followUp =
          answeringOffer && (isAcknowledgement(question) || question.trim().length <= 48);

        const miyagiBound =
          scope === 'miyagi'
            ? 'These passages are Miyagi\'s written record only. If the visitor asked about anything else — other projects, George, hiring, biography, or an unrelated topic — refuse in one or two sentences and point them to the main portfolio. Do not answer the off-topic half from a loosely related passage or from memory.\n\n'
            : '';

        const user = social
          ? `${earlier}${miyagiBound}No passages — this is a conversational turn. Do not invent biography.${
              scope === 'miyagi'
                ? ' Introduce yourself as Miyagi\'s assistant and offer a Miyagi topic.'
                : ''
            }\n\nVisitor: ${question}`
          : followUp
            ? `${earlier}${miyagiBound}Passages:\n\n${context || '(none)'}\n\n---\n\nThe previous assistant turn asked a question or offered topics. The visitor's reply ("${question}") answers that offer — it is not a new standalone query. Answer the offer. If they accepted without picking a topic, cover the offered topics briefly and invite them to go deeper on one.\n\nVisitor: ${question}`
            : context
              ? `${earlier}${miyagiBound}Passages:\n\n${context}\n\n---\n\nQuestion: ${question}`
              : `${earlier}${miyagiBound}No passages matched in Miyagi's record. If the question is about Miyagi, say the record does not cover it. If it is about anything else, refuse as out of scope.\n\nQuestion: ${question}`;

        const result = await generate({
          system: scope === 'miyagi' ? MIYAGI_SYSTEM_PROMPT : SITE_SYSTEM_PROMPT,
          user,
          maxTokens: social || !context ? 280 : MAX_TOKENS,
          signal: request.signal,
          onDelta: (text) => {
            answer += text;
            if (firstToken === 0) {
              firstToken = performance.now();
              send({ type: 'ttft', ms: Math.round(firstToken - started) });
            }
            send({ type: 'delta', text });
          },
        });

        if (result.refused) {
          send({
            type: 'error',
            message: 'The model declined to answer that request.',
            recoverable: true,
          });
        }

        // Surfaced rather than hidden: if the primary provider was down, the
        // trace should say so — that is the failure mode the ADR claims to
        // handle, and this is the only place a visitor can see it working.
        if (result.fellBackFrom.length > 0) {
          send({
            type: 'error',
            message: `${result.fellBackFrom.join(', ')} unavailable — answered by ${result.providerLabel} instead.`,
            recoverable: true,
          });
        }

        send({
          type: 'usage',
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          costUsd: result.costUsd,
          totalMs: Math.round(performance.now() - started),
          provider: result.providerLabel,
          model: result.model,
          fellBackFrom: result.fellBackFrom,
        });

        send({ type: 'done', sig: answer.trim() ? signAssistantTurn(answer) : undefined });
      } catch (error) {
        const message =
          error instanceof NoProviderConfiguredError
            ? 'Generation is unavailable (no provider key configured), but retrieval ran — the cited passages below are the real result.'
            : error instanceof AllProvidersFailedError
              ? `Every generation provider failed (${error.attempts
                  .map((a) => `${a.label}: ${a.reason}`)
                  .join('; ')}). Retrieval succeeded; the passages below are real.`
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
