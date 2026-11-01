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

## Lines: what to get

A line restates its entry and adds nothing new: the entry was checked
against its sources, the line wasn't. One per thing to get, on the list
for the job (`LISTS`) and in the section it's used in. Ids are stable
slugs, unique across items, tasks and lines, and never renamed: the marks
point at them. A line names its entry's task only when that task is the
getting of it. No lines on a `private` entry: a line is shared.

## Questions for the appointment

`appointment:` holds what a reader would want their midwife or doctor to
tell them about *them*: a result, a dose, whether it applies, what to do
next. Most entries have none; the reader can always write their own
(`docs/product/planner.md`).

- **None on** a card, a term, a private entry, or entries on loss, money,
  paperwork, gear, celebrations or the partner's own health (the
  appointment is the carrying parent's).
- **0–3, in the reader's voice,** as they'd say it to the midwife: first
  person, plain, short, ending in `?`. "Can you check my iron?", not "What
  is ferritin?" (the Library answers that). "We" and "us" on a `who:
  together` entry, "I" and "me" elsewhere.
- **Stay inside the entry:** every question follows from what it says. No
  new medical claims, no advice.
- **Not what the entry already says** for everyone ("every 4 to 6 weeks").
- **Never about cost,** even on a decision: "Would you suggest NIPT for me,
  given my age?", never "Is it covered?".
- **Gently on hard news** (a high-chance result, a small baby): what comes
  next for you ("What are my options from here?"), never outcomes or odds.
- **Never the wrong channel:** where the entry says to act now (call, go
  in, tell your doctor immediately, anti-D within 72 hours), no question
  parks it for the next appointment.
- **Never for some readers only** ("If I'm RhD negative, …"): every reader
  sees the suggestions. Put it on the entry for those readers.
- **"What did my … show?" only on the entry about that result,** not on
  every entry that mentions the test.
- **On an `ask` verdict** the entry's own `ask:` is already offered: add
  others only if they're different.
- **The list is shared:** nothing whose wording tells the partner what she
  may not have said (drug use, a medicine she takes). Ask about the need
  ("What else can I try for nausea or sleep?"), not the disclosure. Mark
  the entry `discreet: true` where its title would tell what the question
  doesn't.
- **"The hospital I'm booked into",** not "this hospital": the appointment
  may be with a GP.
- **Have someone else review** each batch against its entry and these
  rules: the writer doesn't catch their own blind spots.

Check records live in `content/map/checks/`, as for the map. Records from
before 2026-10-30 name files in `content/drafts/`, where the entries were
drafted; they are the same entries, now in `content/items/`.
