# Authoring guide

Everything on this site that isn't chrome comes from `content/`. There are three
collections, all validated at build time by `velite.config.ts` — if a required
field is missing, **the build fails** rather than shipping a half-written record.

| Collection | Path | Shows up at | Template |
| --- | --- | --- | --- |
| Decision records | `content/adr/*.mdx` | `/architecture` | `content/adr/_template.mdx` |
| Playbooks | `content/playbooks/*.mdx` | `/playbooks` | see below |
| Writing | `content/blog/*.mdx` | `/blog` | see below |

The filename becomes the URL slug. `content/adr/payments-idempotency.mdx` →
`/architecture/payments-idempotency`.

Files whose name starts with `_` are ignored by the content build entirely —
which is why `_template.mdx` never appears anywhere. Copy it to a real filename
to start a new record.

---

## The `draft` flag

Every ADR and playbook has `draft`. While it is `true` the document is:

- hidden from production listings,
- excluded from the retrieval index (the sandbox will never cite a scaffold),
- visible in `npm run dev` with a yellow **Scaffold** label.

This is deliberate. A portfolio with three visibly-empty decision records is
worse than one with a single complete one. Write it, then flip the flag.

---

## Writing a decision record

Copy `content/adr/_template.mdx`, rename it, and work through the fields. The
template's comments explain each one. Four things carry most of the weight:

**1. `options` — at least two, each with a `verdict` and a `because`.**
The schema will not accept an option without a verdict. This is the guardrail
against the failure mode these records exist to avoid: listing technologies
instead of recording a decision. The `because` should be the sentence an
interviewer would push back on.

**2. The chosen option must have real `cons`.**
Nothing signals inexperience faster than a chosen option with an empty cons
list. If you cannot name what you gave up, you have not finished the analysis.

**3. `reversibility` — what it costs to change your mind.**
Most decisions are made with incomplete information, so the useful question is
rarely "was this right" but "what does being wrong cost". Name the interface or
seam that bounds the blast radius. Then name the one decision that genuinely is
expensive to reverse — every design has one, and knowing which is the point.

**4. Every metric needs a `basis`.**
`value: "65% fewer tokens"` is a claim. `basis: "Comparing billing exports for
March vs April after semantic caching shipped"` is a measurement. Only the
second survives a technical interview. If you have not measured something, do
not put a number on it — write what you did measure, or leave the metric out.

### Trade-off matrix

`tradeoffs[].scores` is keyed by **option name, spelled exactly as in
`options[].name`**. The renderer pivots this into a table, so the columns can
never drift from the options list. A criterion where the chosen option scores
`weak` is the most valuable row in the table — include it.

### Diagrams

Set `diagram:` to a key registered in `src/components/blueprints/index.tsx`.
Diagrams are inline SVG so they inherit the theme, stay sharp, and keep their
labels as real text. Add a new one by creating the component and registering it
in the `blueprints` map. Give every diagram a `<title>` and `<desc>` — the
existing one shows the pattern.

---

## Writing a playbook

```yaml
---
title: 'A standard, phrased as the rule it enforces'
date: '2026-01-01'
category: 'AI SDLC Governance'
accent: lime
principle: >-
  The one-line rule this playbook exists to enforce. Shown pulled out in large
  type — make it a claim, not a topic.
summary: >-
  Two sentences on the failure mode this prevents.
tags: ['Code review', 'Testing']
draft: true
---
```

Playbooks are opinions with reasons attached. The useful shape is: *here is the
failure mode → here are the gates → here is what I deliberately do **not** do*.
That last section is what makes it read as experience rather than advice.

---

## Writing a post

```yaml
---
title: 'Post title'
publishedAt: '2026-01-01'
updatedAt: '2026-01-02'   # optional
description: 'One or two sentences, used for search and social cards.'
image: '../../public/blogs/cover.png'   # optional, relative to the .mdx file
tags: ['web development']
isPublished: true
---
```

---

## After changing content

```bash
npm run ingest   # re-chunk and re-embed, so the sandbox reflects the new content
npm run eval     # confirm retrieval quality did not regress
```

`npm run dev` and `npm run build` rebuild the Velite output automatically, but
**they do not rebuild the retrieval index**. That is deliberate — embedding costs
money and hits a rate limit, so it is an explicit step. The trade-off is that
forgetting it leaves the sandbox citing old content. If the sandbox ever answers
from a page you have edited, that is the reason.
