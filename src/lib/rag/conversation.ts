/**
 * Social and meta turns should not hit the retriever. "Hi" matching a random
 * ADR makes the model cite a circuit breaker for a greeting.
 */
const SOCIAL =
  /^(hi+|hey+|heya|hello(?:\s+there)?|hi\s+there|hey\s+there|yo|sup|hiya|howdy|thanks|thank\s+you|thx|ty|ok|okay|cool|nice|great|got\s+it|cheers|bye|goodbye|good\s+(?:morning|afternoon|evening|night)|(?:nice|good)\s+to\s+meet\s+you|how\s+are\s+you(?:\s+doing)?|how(?:'s|s|\s+is)\s+it\s+going|what(?:'s|s|\s+is)\s+up|what\s+can\s+you\s+(?:do|help\s+with)|who\s+are\s+you|what\s+are\s+you|help(?:\s+me)?|can\s+you\s+help(?:\s+me)?)[\s!.?,]*$/i;

/**
 * The visitor accepted an offer without naming a topic. These words have no
 * topical signal — searching "proceed" returns a random ADR.
 */
const ACKNOWLEDGEMENT =
  /^(proceed|continue|go\s+ahead|go\s+on|yes|yeah|yep|yup|sure|please|ok(?:ay)?|do\s+it|tell\s+me(?:\s+more)?|more|that|this|any(?:thing)?|whatever|surprise\s+me|sounds\s+good|let'?s\s+go|why\s+not)[\s!.?,]*$/i;

export type HistoryTurn = { role: 'user' | 'assistant'; content: string };

export function isSocialTurn(text: string): boolean {
  const t = text.trim();
  if (t.length === 0) return false;
  if (t.length <= 2) return true;
  if (SOCIAL.test(t)) return true;
  // "Hi, how are you" is still social; "Hi, where did George study?" is not.
  const stripped = t.replace(/^(hi+|hey+|hello)[\s,!.—–-]+/i, '').trim();
  return stripped.length > 0 && stripped !== t && SOCIAL.test(stripped);
}

export function isAcknowledgement(text: string): boolean {
  return ACKNOWLEDGEMENT.test(text.trim());
}

export function lastAssistantContent(history: HistoryTurn[]): string | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    const turn = history[i];
    if (turn?.role === 'assistant') return turn.content;
  }
  return undefined;
}

/**
 * The previous assistant turn is still waiting on an answer — it asked a
 * question or offered topics ("projects, certifications, or current roles").
 */
export function assistantIsWaiting(lastAssistant: string | undefined): boolean {
  if (!lastAssistant) return false;
  return (
    /[?]/.test(lastAssistant) ||
    /\b(would you like|if you(?:'d| would) like|what interests|which (?:one|of)|shall i|want me to|i can (?:look|tell|walk)|pick one)\b/i.test(
      lastAssistant,
    )
  );
}

/**
 * Greetings, thanks, and dangling "proceed" with nothing to continue. Follow-ups
 * that accept an open offer are *not* social — they need the index.
 */
export function isConversationalTurn(question: string, history: HistoryTurn[]): boolean {
  const waiting = assistantIsWaiting(lastAssistantContent(history));
  if (isAcknowledgement(question)) return !waiting;
  return isSocialTurn(question) && !waiting;
}

/**
 * What we actually retrieve on.
 *
 * Short acknowledgements have no topical words. If the previous assistant turn
 * offered topics, search that offer. A short topic pick ("work", "certs") is
 * grounded in the same offer so it does not match a stray mention.
 */
export function retrievalQuery(question: string, history: HistoryTurn[]): string {
  const last = lastAssistantContent(history);
  if (!last || !assistantIsWaiting(last)) return question;

  const q = question.trim();
  if (isAcknowledgement(q) || isSocialTurn(q)) return last;
  if (q.length <= 48) return `${q}\n${last}`;
  return question;
}
