# Writing an entry

How a Library entry (`content/items/<id>.md`) is written: its frontmatter and
the shape of its body by type. `src/content/schema.ts` and
`src/content/parse.ts` check both, so a file that breaks them fails the gate.
Most entries were drafted from the map (`content/map/*.yaml`); `REVIEW.md`,
beside this file, holds the calls left for the review pass. Week notes are
`content/weeks/<week>.md` (`src/content/weeks.ts`).

One file per entry, named for its id (the map's id, where it came from the map). Ids are stable: never rename one.

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
decide_by: 20                    # decision only: the week to decide by, from a source, within its weeks; it becomes a task
private: true                    # family violence and the like only: leaves no trace (docs/architecture.md, Content)
discreet: true                   # mental health, drugs, smoking: a question from it isn't named "from <title>" on the shared list
sources:                         # every page a claim in the body comes from
  - title: Publisher — Page title
    url: https://...
related: [deli-meats, listeria-foods]
lines:                           # optional: what to get, a line each on a list (src/lib/lists.ts), restating the body
  - id: get-bottles              # stable, unique across items, tasks and lines: marks point at it
    title: Bottles
    list: baby                   # one of LISTS
    section: feeding             # one of its list's sections
    when: { feeding: [formula, both] }   # optional, narrows the entry's
    task: buy-bottles            # optional, one of this entry's tasks; never on a private entry
appointment:                     # optional, at most 3: what to ask your midwife or doctor about your own case
  - Is soft cheese a risk with my results?   # first person, short (≤ 120), ends in ?; never on a card, term or private entry
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
  frontmatter if there are any (`tasks:`, each an `id`, `title` and
  optionally `opens`, `due`, `deadline`, `who` and `keeps`; see CLAUDE.md,
  Content). `keeps` is what doing it keeps, and the task offers the way
  there: `letter` (a letter to the baby), `photo`, or a first
  (`{ first: told-family }`, from `src/lib/firsts.ts`); kept, it's ticked.
- `card`: no headings; a paragraph or two.
- `term`: no headings; one or two short paragraphs.

Check records live in `content/map/checks/`, as for the map. Records from
before 2026-10-30 name files in `content/drafts/`, where the entries were
drafted; they are the same entries, now in `content/items/`.
