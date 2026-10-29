# Drafts

Library entries written from the map (`content/map/*.yaml`). They have moved
to `content/items/<id>.md`, beside the items, and the app loads them (marked
draft); this folder keeps the format they were written to and `REVIEW.md`, the
calls for the review pass, until the plan in `docs/plan-content-types.md`
retires it. `src/content/parse.ts` checks the shapes below.

One file per map entry, the name its map id. Ids are stable: never rename one.

## Frontmatter

```yaml
---
id: soft-cheese                  # the map id
title: Soft cheese               # the map title, or better
type: can-i                      # the map type
topic: food                      # the map topic
ask: Can I eat brie or camembert?
aliases: [brie, camembert, feta]
weeks: [1, 42]                   # optional, from the map
who: carrying                    # optional, from the map
stakes: high
summary: "One sentence: the answer, or why it matters."
verdict: avoid                   # can-i only: yes | limit | avoid | ask
decide_by: 20                    # decision only: the week to decide by, from a source
sources:                         # every page a claim in the body comes from
  - title: Publisher — Page title
    url: https://...
related: [deli-meats, listeria-foods]
draft: true
checked: 2026-10-29              # only once a second agent confirmed every claim against the sources
---
```

## Body, by type

Plain Markdown, `##` headings as below, en-AU spelling, metric. "The pregnant
parent" (or "you"), not mother or woman. Every claim from a listed source, in
its own urgency wording: never softer, never stronger, never merged.

- `symptom`: `## What's usual`, then only the levels the sources give, most
  urgent first: `## Call 000 or go to emergency` (either or both, as the source says), `## Contact your hospital now`, `## See your
  doctor or midwife`, `## Mention it at your next visit`.
- `can-i`: `## Why`, then `## What to do` when there is anything to do (how to, alternatives, what if you
  already did).
- `guide`: a short opening paragraph, then `##` sections as the subject needs.
  Red flags under `## When to get help`.
- `decision`: `## The options`, `## Things to weigh`, `## When to decide`.
- `moment`, `payment`: what it is, when, what to do and by when; tasks in
  frontmatter as in `content/items/` if there are any.
- `card`: no headings; a paragraph or two.
- `term`: no headings; one or two short paragraphs.

Checks live in `content/map/checks/drafts-<n>.yaml`, as for the map.
