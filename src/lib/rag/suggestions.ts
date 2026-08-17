/**
 * The suggested questions, in one place.
 *
 * They were duplicated across the widget, the sandbox and the homepage, which
 * was survivable as copy but not as data: the ingest precomputes an embedding
 * for every one of these so a click never has to embed anything at request
 * time, and a prompt that drifts out of sync with this list silently loses that
 * and falls back to embedding on the fly.
 *
 * Chips are the most-clicked queries on the site by a wide margin, so this is
 * the difference between the common path touching the model and not.
 */

/** Shown in the floating chat widget when a conversation has not started. */
export const CHAT_SUGGESTIONS = [
  "What are George's certifications?",
  'Where did George study?',
  'What would George call his biggest accomplishment?',
  'Why was a managed vector database rejected?',
] as const;

/** Shown on the homepage AI section, beside the button that opens the widget. */
export const HOME_SUGGESTIONS = [
  "What are George's certifications?",
  'Which university did George go to?',
  'What would George call his biggest accomplishment?',
] as const;

/** Shown on /sandbox, where the questions lean technical to exercise the trace. */
export const SANDBOX_SUGGESTIONS = [
  'Why was a managed vector database rejected?',
  "What are George's certifications?",
  'How does the retrieval fall back when embeddings fail?',
  'What does George think about AI-generated code review?',
] as const;

/** Every distinct suggestion, for the ingest to precompute. */
export const ALL_SUGGESTIONS: string[] = [
  ...new Set<string>([...CHAT_SUGGESTIONS, ...HOME_SUGGESTIONS, ...SANDBOX_SUGGESTIONS]),
];

/**
 * Cache key for a query. Deliberately forgiving — trailing whitespace, casing
 * and a missing question mark should still hit a precomputed vector, since a
 * visitor who retypes a chip by hand is asking the same question.
 */
export function queryKey(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[?!.]+$/, '');
}
