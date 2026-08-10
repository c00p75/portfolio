# georgemsapenda.me

Portfolio and architecture writing for George M'sapenda. Built around the idea
that in an era of cheap code generation, the thing worth showing evidence of is
judgement — so projects are published as **architecture decision records** rather
than case studies, and the interactive demo is a real system with its own ADR.

**Live:** [georgemsapenda.me](https://georgemsapenda.me)

---

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | Server components, route handlers for the SSE endpoint |
| Language | TypeScript, `strict` + `noUncheckedIndexedAccess` | A site arguing for engineering rigour should be typed |
| Styling | Tailwind v4 (CSS-first `@theme`) | Design tokens live in CSS, no JS config to drift |
| Content | Velite + MDX, Zod-validated | Invalid frontmatter fails the build, not the page |
| Retrieval | In-process hybrid BM25 + dense, RRF fusion | See [ADR-001](content/adr/portfolio-retrieval-architecture.mdx) |
| Embeddings | Voyage | Anthropic has no embeddings endpoint; isolated behind one function |
| Generation | Claude via `@anthropic-ai/sdk`, streamed over SSE | No framework wrapper, so the prompt stays portable |

---

## Running it

```bash
npm install
cp .env.example .env.local   # optional — see below
npm run dev
```

Open <http://localhost:3000>.

**Everything works without API keys.** The sandbox degrades honestly rather than
breaking: retrieval runs on the lexical (BM25) half and the UI states that the
dense half is unavailable. Add keys to enable the rest.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server; Velite rebuilds content on change |
| `npm run build` | Production build |
| `npm run ingest` | Re-chunk and re-embed the corpus into `src/data/embeddings.json` |
| `npm run eval` | Run the retrieval golden set; reports recall@6, MRR, latency |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

### Environment

See `.env.example`. All three are optional and each degrades to a stated
fallback rather than an error:

- `ANTHROPIC_API_KEY` — generation. Without it, retrieval still runs and cited
  passages are shown.
- `VOYAGE_API_KEY` — embeddings for `npm run ingest`. Without it, a lexical-only
  index is built and labelled as such.
- `NEXT_PUBLIC_FORMSPREE_ID` — contact form. Without it, a mailto link.

---

## Adding content

See **[CONTENT.md](CONTENT.md)** for the full authoring guide. Short version:

```bash
cp content/adr/_template.mdx content/adr/my-decision.mdx
# fill it in, then set draft: false
npm run ingest && npm run eval
```

The retrieval index is **not** rebuilt by `npm run dev` or `npm run build` —
embedding costs money, so it is an explicit step. If the sandbox cites content
you have since edited, you forgot `npm run ingest`.

---

## Layout

```
content/
  adr/         Architecture decision records (the primary content type)
  playbooks/   Engineering standards and governance
  blog/        Longer-form writing
scripts/
  ingest.ts    Chunk + embed the corpus into a static artifact
  eval.ts      Retrieval golden set — recall@6, MRR, per-stage latency
src/
  app/         Routes, including the SSE endpoint at /api/ask
  components/
    blueprints/  Inline-SVG system diagrams, referenced by ADR frontmatter
    ui/          Design-system primitives (stickers, frames, links)
  lib/rag/     Chunking, BM25, embeddings, the Retriever interface
  data/        The committed retrieval index
```

### Why the index is committed

`src/data/embeddings.json` is checked in on purpose. It is a build artifact that
must version and roll back alongside the content it describes, and committing it
means a deploy never needs an embedding API key. The cost is that it must be
regenerated when content changes — which is what `npm run ingest` is for.

---

## Retrieval architecture in one paragraph

Queries run down two paths against the same chunks: BM25 for exact, rare terms
(library names, error codes) and dense cosine similarity for paraphrase. The two
ranked lists are combined with **reciprocal rank fusion**, which consumes rank
position rather than score — so the two scoring systems never need calibrating
against each other. If the embedding call fails, the lexical path still answers
and the telemetry panel says the result is degraded. The full reasoning,
including the options rejected, is in
[ADR-001](content/adr/portfolio-retrieval-architecture.mdx).

---

## License

MIT — see [LICENSE](LICENSE). The writing in `content/` is not: please don't
republish the decision records as your own.
