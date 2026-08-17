/**
 * The generation provider boundary.
 *
 * Retrieval is the interesting half of this system and it runs entirely on a
 * local artifact — generation is the only step that needs a vendor at all. So
 * rather than binding the route to one, providers are declared in priority
 * order and tried in turn: the first one with a key configured gets the
 * request, and if it fails for a reason another provider could survive
 * (rate limit, outage, bad key) the next one takes over mid-request.
 *
 * The visitor sees one streamed answer either way; the trace panel reports
 * which provider actually served it, because a demo that hides its own
 * fallbacks is lying about its failure modes.
 *
 * Three of the four providers speak the OpenAI wire format, so they share one
 * adapter and differ only by base URL, model and price. Anthropic has its own
 * SDK and its own adapter.
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

/** USD per million tokens. Zero means the provider's free tier covers this. */
export type Price = { input: number; output: number };

export type ProviderId = 'groq' | 'gemini' | 'openai' | 'anthropic';

type ProviderSpec = {
  id: ProviderId;
  label: string;
  /** Env var holding the key. A provider with no key is skipped, not failed. */
  envKey: string;
  model: string;
  price: Price;
  /** OpenAI-compatible endpoint, or undefined for the native Anthropic SDK. */
  baseURL?: string;
  /** Extra body params this provider needs. Merged into the request as-is. */
  extraBody?: Record<string, unknown>;
};

/**
 * Priority order. Groq leads because it is free and the fastest of the four,
 * which matters more than raw model quality for a six-passage grounded answer.
 * Anthropic sits last only because no key is configured — on quality of
 * citation discipline it would lead.
 */
const PROVIDERS: ProviderSpec[] = [
  {
    id: 'groq',
    label: 'Groq · gpt-oss-120b',
    envKey: 'GROQ_API_KEY',
    model: 'openai/gpt-oss-120b',
    price: { input: 0, output: 0 },
    baseURL: 'https://api.groq.com/openai/v1',
  },
  {
    id: 'gemini',
    label: 'Gemini · 3.5 Flash',
    envKey: 'GEMINI_API_KEY',
    // 2.5 Flash is closed to new keys — it 404s with "no longer available to
    // new users" rather than an auth error, which reads like a broken URL.
    model: 'gemini-3.5-flash',
    price: { input: 0, output: 0 },
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
  },
  {
    id: 'openai',
    label: 'OpenAI · GPT-5 mini',
    envKey: 'OPENAI_API_KEY',
    model: 'gpt-5-mini',
    price: { input: 0.25, output: 2 },
    baseURL: 'https://api.openai.com/v1',
    // Reasoning tokens are drawn from the same budget as the answer, so at a
    // 1200-token cap an unbounded reasoning pass can consume the whole
    // allowance and return empty content. Low effort keeps room for prose.
    extraBody: { reasoning_effort: 'low' },
  },
  {
    id: 'anthropic',
    label: 'Claude Opus 5',
    envKey: 'ANTHROPIC_API_KEY',
    model: process.env.ANSWER_MODEL ?? 'claude-opus-5',
    price: { input: 5, output: 25 },
  },
];

export type GenerationResult = {
  provider: ProviderId;
  providerLabel: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  /** Providers that were tried and failed before this one succeeded. */
  fellBackFrom: string[];
  refused: boolean;
};

export type GenerateOptions = {
  system: string;
  user: string;
  maxTokens: number;
  onDelta: (text: string) => void;
  signal?: AbortSignal;
};

/** No provider has a usable key — distinct from every provider failing. */
export class NoProviderConfiguredError extends Error {
  constructor() {
    super('No generation provider is configured.');
    this.name = 'NoProviderConfiguredError';
  }
}

/** Every configured provider was tried and failed. Carries what went wrong. */
export class AllProvidersFailedError extends Error {
  constructor(readonly attempts: { label: string; reason: string }[]) {
    super(`All ${attempts.length} generation providers failed.`);
    this.name = 'AllProvidersFailedError';
  }
}

function reasonFor(error: unknown): string {
  if (error instanceof Anthropic.APIError) return `HTTP ${error.status}`;
  if (error instanceof OpenAI.APIError) return `HTTP ${error.status}`;
  return error instanceof Error ? error.message.slice(0, 120) : 'unknown error';
}

/**
 * Rewrites stray citation notations into the one the UI renders.
 *
 * The system prompt asks for `[2]`, and the stronger models comply — but the
 * open-weight ones drift into the CJK-bracket form they were trained on
 * (`【2】`, `【2†L4-L9】`), which the renderer shows as literal noise. Prompting
 * alone did not hold, so the stream is normalised as well.
 *
 * It has to be a stateful transform rather than a regex over each delta: a
 * marker routinely arrives split across chunk boundaries ("【2" then "†L4】"),
 * and a per-delta replace would miss every one of those. So any text from an
 * unclosed opener onward is held back until the closer arrives.
 */
class CitationNormalizer {
  private pending = '';

  /** Returns the text safe to emit now; holds back any partial marker. */
  push(text: string): string {
    this.pending += text;
    const opener = this.pending.lastIndexOf('\u3010');
    // An opener with no closer after it is an incomplete marker — hold it.
    const holdFrom =
      opener !== -1 && !this.pending.slice(opener).includes('\u3011') ? opener : this.pending.length;

    const emit = this.pending.slice(0, holdFrom);
    this.pending = this.pending.slice(holdFrom);
    return CitationNormalizer.rewrite(emit);
  }

  /** Emits whatever is still held — an unterminated marker stays as authored. */
  flush(): string {
    const rest = CitationNormalizer.rewrite(this.pending);
    this.pending = '';
    return rest;
  }

  /** `【2】` and `【2†L4-L9】` both become `[2]`; a multi-ref marker splits. */
  private static rewrite(text: string): string {
    return text.replace(/\u3010([^\u3011]*)\u3011/g, (whole, inner: string) => {
      const numbers = inner.match(/\d+/g);
      return numbers ? numbers.map((n) => `[${n}]`).join('') : whole;
    });
  }
}

/**
 * A failure the next provider might survive. An aborted request is not one —
 * the visitor closed the tab, so falling back would burn a second provider's
 * quota on an answer nobody is waiting for.
 */
function isWorthFallingBack(error: unknown): boolean {
  if (error instanceof Error && error.name === 'AbortError') return false;
  return true;
}

async function runOpenAiCompatible(
  spec: ProviderSpec,
  apiKey: string,
  opts: GenerateOptions,
): Promise<Omit<GenerationResult, 'fellBackFrom' | 'provider' | 'providerLabel' | 'model'>> {
  const client = new OpenAI({ apiKey, baseURL: spec.baseURL });

  const stream = await client.chat.completions.create(
    {
      model: spec.model,
      max_completion_tokens: opts.maxTokens,
      stream: true,
      stream_options: { include_usage: true },
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
      ...spec.extraBody,
    },
    { signal: opts.signal },
  );

  let inputTokens = 0;
  let outputTokens = 0;

  for await (const part of stream) {
    const delta = part.choices[0]?.delta?.content;
    if (delta) opts.onDelta(delta);
    // Usage arrives on the final frame when include_usage is set. Some
    // OpenAI-compatible servers attach it to earlier frames instead, so take
    // the last non-zero reading rather than assuming position.
    if (part.usage) {
      inputTokens = part.usage.prompt_tokens ?? inputTokens;
      outputTokens = part.usage.completion_tokens ?? outputTokens;
    }
  }

  return { inputTokens, outputTokens, costUsd: 0, refused: false };
}

async function runAnthropic(
  spec: ProviderSpec,
  apiKey: string,
  opts: GenerateOptions,
): Promise<Omit<GenerationResult, 'fellBackFrom' | 'provider' | 'providerLabel' | 'model'>> {
  const client = new Anthropic({ apiKey });

  const stream = client.messages.stream(
    {
      model: spec.model,
      max_tokens: opts.maxTokens,
      // Low effort is genuinely strong on this model and keeps the demo
      // responsive; thinking stays on (the default) rather than disabled,
      // which avoids the reasoning-leak failure mode.
      output_config: { effort: 'low' },
      system: opts.system,
      messages: [{ role: 'user', content: opts.user }],
    },
    { signal: opts.signal },
  );

  stream.on('text', (delta) => opts.onDelta(delta));
  const final = await stream.finalMessage();

  return {
    inputTokens: final.usage.input_tokens,
    outputTokens: final.usage.output_tokens,
    costUsd: 0,
    refused: final.stop_reason === 'refusal',
  };
}

/**
 * Stream an answer from the first provider that works.
 *
 * `onDelta` may be called by more than one provider only if the first fails
 * *before* emitting anything — once a provider has streamed a token the answer
 * is committed to it, because splicing two models' prose mid-sentence would
 * produce something neither of them would have written.
 */
export async function generate(opts: GenerateOptions): Promise<GenerationResult> {
  const configured = PROVIDERS.filter((p) => Boolean(process.env[p.envKey]));
  if (configured.length === 0) throw new NoProviderConfiguredError();

  const failures: { label: string; reason: string }[] = [];

  for (const spec of configured) {
    const apiKey = process.env[spec.envKey]!;
    let emitted = false;

    const normalizer = new CitationNormalizer();
    const guarded: GenerateOptions = {
      ...opts,
      onDelta: (text) => {
        const safe = normalizer.push(text);
        if (safe) {
          emitted = true;
          opts.onDelta(safe);
        }
      },
    };

    try {
      const usage =
        spec.id === 'anthropic'
          ? await runAnthropic(spec, apiKey, guarded)
          : await runOpenAiCompatible(spec, apiKey, guarded);

      const tail = normalizer.flush();
      if (tail) opts.onDelta(tail);

      return {
        ...usage,
        provider: spec.id,
        providerLabel: spec.label,
        model: spec.model,
        costUsd:
          (usage.inputTokens * spec.price.input + usage.outputTokens * spec.price.output) /
          1_000_000,
        fellBackFrom: failures.map((f) => f.label),
      };
    } catch (error) {
      // Mid-stream failures are terminal: the visitor has already read part of
      // one model's answer, and continuing from another would splice them.
      if (emitted || !isWorthFallingBack(error)) throw error;
      failures.push({ label: spec.label, reason: reasonFor(error) });
    }
  }

  throw new AllProvidersFailedError(failures);
}

/** For the trace panel: which providers are configured, in the order tried. */
export function configuredProviders(): { id: ProviderId; label: string }[] {
  return PROVIDERS.filter((p) => Boolean(process.env[p.envKey])).map((p) => ({
    id: p.id,
    label: p.label,
  }));
}
