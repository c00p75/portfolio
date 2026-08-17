import type { Chunk } from './types';

/**
 * Token estimate. Deliberately an estimate: the exact count only matters for
 * sizing chunks, and calling a tokeniser for every candidate split would cost
 * more than the precision is worth here.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

const TARGET_TOKENS = 215;
const OVERLAP_TOKENS = 40;
const MIN_TOKENS = 40;

/**
 * Prose the page may show but the index must never hold.
 *
 * The chat is an easier oracle than the writing it draws on: a visitor who
 * would never read an ADR end to end will happily ask where a key lives. So
 * operational detail — the endpoint behind a documented gap, what a compromise
 * would enable — gets fenced, and retrieval never sees it. This is deliberately
 * a build-time cut rather than an instruction to the model: a passage that is
 * not in the index cannot be leaked by a model having a bad day.
 *
 * MDX comments, so the fence renders as nothing and the page reads as authored.
 */
const PRIVATE_BLOCK = /\{\/\*\s*private\s*\*\/\}[\s\S]*?\{\/\*\s*\/private\s*\*\/\}/g;

/** Strip the syntax that would waste tokens or confuse retrieval. */
function cleanMdx(raw: string): string {
  return (
    raw
      // Frontmatter is indexed separately via structured fields.
      .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
      // Before any other pass: the JSX strip below would otherwise eat the
      // fence markers and leave the prose they were guarding behind.
      .replace(PRIVATE_BLOCK, '')
      // import/export lines from MDX.
      .replace(/^\s*(import|export)\s.+$/gm, '')
      // JSX tags — keep their text content, drop the markup.
      .replace(/<\/?[A-Za-z][^>]*>/g, '')
      // Images: keep alt text only.
      .replace(/!\[([^\]]*)]\([^)]*\)/g, '$1')
      // Links: keep label only.
      .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

type Block = { section: string; text: string };

/** Split into blocks, tracking the nearest heading for citation context. */
function toBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  let section = '';

  for (const raw of body.split(/\n{2,}/)) {
    const para = raw.trim();
    if (!para) continue;

    const heading = /^#{1,4}\s+(.+)$/.exec(para);
    if (heading?.[1]) {
      section = heading[1].replace(/[*_`]/g, '').trim();
      continue; // The heading itself is carried as metadata, not as a chunk.
    }
    blocks.push({ section, text: para });
  }
  return blocks;
}

/**
 * Pack blocks into chunks near the target size, never splitting a paragraph or
 * crossing a heading boundary. Consecutive chunks in the same section overlap by
 * roughly `OVERLAP_TOKENS` so a passage cut mid-argument is still recoverable.
 */
export function chunkDocument(input: {
  id: string;
  url: string;
  title: string;
  kind: Chunk['kind'];
  raw: string;
  /** Prepended to the first chunk so structured summary text is retrievable. */
  preamble?: string;
}): Chunk[] {
  const body = cleanMdx(input.raw);
  const blocks = toBlocks(body);
  if (input.preamble) blocks.unshift({ section: 'Summary', text: input.preamble.trim() });

  const chunks: Chunk[] = [];
  let buffer: string[] = [];
  let bufferSection = '';
  let n = 0;

  const flush = () => {
    if (buffer.length === 0) return;
    const text = buffer.join('\n\n').trim();
    const tokens = estimateTokens(text);
    if (tokens >= MIN_TOKENS || chunks.length === 0) {
      chunks.push({
        id: `${input.id}#${n++}`,
        url: input.url,
        title: input.title,
        section: bufferSection || input.title,
        kind: input.kind,
        text,
        tokens,
      });
    } else if (chunks.length > 0) {
      // Too small to stand alone — fold it into the previous chunk instead of
      // shipping a fragment that will never win a ranking.
      const prev = chunks[chunks.length - 1]!;
      prev.text = `${prev.text}\n\n${text}`;
      prev.tokens = estimateTokens(prev.text);
    }
    buffer = [];
  };

  for (const block of blocks) {
    if (block.section !== bufferSection) {
      flush();
      bufferSection = block.section;
    }

    const blockTokens = estimateTokens(block.text);
    const bufferTokens = estimateTokens(buffer.join('\n\n'));

    if (bufferTokens > 0 && bufferTokens + blockTokens > TARGET_TOKENS) {
      const tail = buffer[buffer.length - 1];
      flush();
      bufferSection = block.section;
      // Carry the previous paragraph forward when it's small enough to serve as
      // overlap rather than duplicating a large block into two chunks.
      if (tail && estimateTokens(tail) <= OVERLAP_TOKENS * 2) buffer.push(tail);
    }

    // A single oversized paragraph gets split on sentence boundaries.
    if (blockTokens > TARGET_TOKENS * 1.6) {
      flush();
      bufferSection = block.section;
      let acc: string[] = [];
      for (const sentence of block.text.split(/(?<=[.!?])\s+/)) {
        if (estimateTokens([...acc, sentence].join(' ')) > TARGET_TOKENS && acc.length > 0) {
          buffer = [acc.join(' ')];
          flush();
          bufferSection = block.section;
          acc = [];
        }
        acc.push(sentence);
      }
      if (acc.length > 0) buffer.push(acc.join(' '));
      continue;
    }

    buffer.push(block.text);
  }
  flush();

  return chunks;
}
