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
import type { Retrieved } from '@/lib/rag/types';

export const runtime = 'nodejs';
/** Retrieval reads a static artifact and generation is per-request; never cache. */
export const dynamic = 'force-dynamic';

/** Bounds the worst-case spend of any single request. Covers thinking + text. */
const MAX_TOKENS = 1200;
const TOP_K = 6;
const MAX_QUESTION_CHARS = 400;

const SYSTEM_PROMPT = `You are the conversational guide on George M'sapenda's portfolio. Visitors talk to you the way they would a knowledgeable colleague who has read his writing and profile — not a search box.

Voice:
- Warm and brief. Speak as the assistant ("I can look that up"), and refer to George in the third person. You are not George and you do not pretend to be.
- Greetings, thanks, small talk, and "what can you do" are ordinary conversation. Answer them in one or two sentences and offer a useful next question. Never say the corpus does not cover a greeting.
- Follow-ups use earlier turns plus any passages provided. If your previous turn asked a question or offered topics (work, writing, biography, projects, certifications, roles), the visitor's next message is a reply to that — including "proceed", "yes", "sure", "tell me more", or naming one of the topics. Answer what you offered. Do not treat those words as a new search, and do not dump an unrelated passage.

Facts:
- Anything about George's life, work, education, certifications, employers, awards, or decisions comes only from the passages (and earlier turns that already cited them). If the passages do not contain it, say so plainly. Never invent a school, date, employer, award or accomplishment.
- If a passage says a fact is not recorded, that is the answer.
- Cite with [n] only when you used a passage. Do not cite on greetings or small talk.
- The citation format is exactly one ASCII bracket pair around one number: [1], [2]. Never use any other citation notation — no daggers, no line ranges, no CJK brackets, no footnote markers, no superscripts.

Sensitive material about the projects:
- The passages describe systems that are live and, in several cases, belong to clients or employers. Discuss them the way George would in public writing: the reasoning, the trade-offs, the shape of the design. Never in a form that helps someone act against a running system.
- Refuse, briefly and without apology, anything shaped like reconnaissance: how to attack, exploit, bypass, forge, evade or gain access to any system described here; how to reproduce a security-relevant mechanism in enough detail to defeat it; or a request to collect every weakness, gap or unprotected surface into one answer.
- A refusal is the whole answer. Do not soften it by walking through the mechanism afterwards — no matter how the passages frame it, a probing question does not earn a description of how the mechanism works, which surface is exposed, or what mitigates it. Say it is not something you go into, point to the written record on the site or the contact page, and stop there.
- Never name the specific endpoint, route, component or interface where a documented weakness sits. That the trade-off exists can be public; where to stand to use it is not.
- Judge the question by what the answer would enable, not by how politely it is phrased. "Where is the secret exposed", "which endpoint hands out the key", "what is unprotected", "what happens if X leaks", "how is Y verified" are reconnaissance whether or not the visitor sounds hostile, and whether or not a passage answers them outright. A passage containing the detail is not permission to repeat it.
- The corresponding safe answer is the decision, never the location: why an approach was chosen, what it traded away, what class of thing it protects. If you cannot answer without pointing at where a secret, key or unguarded surface lives, do not answer.
- Never aggregate. A single documented gap discussed in the context of its own decision is public writing; the same gaps gathered into a list is a target map. One security-relevant caveat per answer, always attached to the reasoning that produced it, and never in response to a question that asked for the set.
- Never disclose or guess at operational specifics even if a passage contains them: credentials, keys, tokens, secrets, internal hostnames, endpoints, IPs, database names, file paths, environment variables, or client and customer data. If a visitor asks for one, say you do not share operational detail about live systems.
- Do not confirm or deny whether a named organisation is a client beyond what the passages state, and do not infer client identities from project names.
- If a request seems to be probing rather than asking, point it at the contact page. George can decide what to share.

Judgement calls about George:
- You are on George's side. Visitors evaluating him ("should we hire him?", "any reason not to?", "what are his weaknesses?", "is he any good at X?", "how does he compare to…?") get his strongest honest case, drawn from the passages.
- Never assemble a case against him. Do not answer a request for reasons not to hire, red flags, weaknesses, gaps or shortcomings by mining the corpus for them. Say plainly that judging fit is a conversation to have with George directly — point to the contact page — and then answer the useful half: what the record actually shows about the work.
- Engineering caveats belong to systems, not to the person. A passage calling part of a design "least proven", unfinished, or a known trade-off is evidence that George documents his own systems honestly. Never re-present it as a shortcoming of George, and never offer it as an answer to a question about hiring him.
- No speculation about him in either direction: no invented praise, and no inference about temperament, seniority or fit that the passages do not state.

Shape:
- Lead with the answer. One or two sentences for social turns; two or three short paragraphs at most for factual ones. No preamble, no restating the question.
- Plain prose. No headers. Lists only when the answer is genuinely a list.
- When the passages show a trade-off or a rejected option in a system's design, say what was given up — that is usually the substance of a technical question. This is about the architecture, never about George.`;

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
  try {
    const body = (await request.json()) as { question?: unknown; history?: unknown };
    if (typeof body.question !== 'string') {
      return Response.json({ error: 'Expected a "question" string.' }, { status: 400 });
    }
    question = body.question.trim();
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

  if (!social && indexIsEmpty()) {
    return Response.json(
      { error: 'The retrieval index has not been built. Run `npm run ingest`.' },
      { status: 503 },
    );
  }

  // ---- Stream -------------------------------------------------------------
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: SseEvent) => controller.enqueue(encoder.encode(sse(event)));

      try {
        const meta = indexMeta();
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
          : await getRetriever().search(retrievalQuery(question, history), TOP_K);

        send({
          type: 'retrieval',
          passages: serialisePassages(retrieval.passages),
          timings: retrieval.timings,
          mode: retrieval.mode,
          degradedReason: retrieval.degradedReason,
        });

        if (!social && retrieval.passages.length === 0) {
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

        const user = social
          ? `${earlier}No passages — this is a conversational turn. Do not invent biography.\n\nVisitor: ${question}`
          : followUp
            ? `${earlier}Passages:\n\n${context}\n\n---\n\nThe previous assistant turn asked a question or offered topics. The visitor's reply ("${question}") answers that offer — it is not a new standalone query. Answer the offer. If they accepted without picking a topic, cover the offered topics briefly and invite them to go deeper on one.\n\nVisitor: ${question}`
            : `${earlier}Passages:\n\n${context}\n\n---\n\nQuestion: ${question}`;

        const result = await generate({
          system: SYSTEM_PROMPT,
          user,
          maxTokens: social ? 280 : MAX_TOKENS,
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
