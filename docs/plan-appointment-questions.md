# Plan: asking at the next appointment, from the Library

The Planner has "For the next appointment" (`src/features/questions/`, the
`question` table): add a question, mark it asked with what they said, ask it
again. What it lacks is a way in from what you're reading. You read
"Anaemia and low iron", wonder whether *your* iron is low, and want that on
the list for the midwife without retyping it in the Planner.

Decided with Jason on 2026-10-30:

- **The Library answers Expecting's questions; the list is for yours.** The
  list holds what only your midwife or doctor can answer: your case, your
  results, your medication. A general question the Library already answers
  doesn't belong on it, so the Planner never suggests anything.
- **Suggestions live on the Library entry,** in the moment you read it. The
  Planner shows only what you chose to add.
- **Every entry can send a question,** in your own words, with no content
  written. Suggestions only make it quicker, and only where your own case
  matters: not on terms, cards, money, paperwork, gear, celebrations, loss
  entries, and never on private ones.
- **Every entry is looked at** in the content sweep, even those that end up
  with nothing, and the sweep records why each was skipped.
- **Sonnet does the sweep, Opus writes the brief and reviews each batch.**
  A pilot batch (tests) comes first, to settle the brief with Jason.

## The shape

On a Library entry, one action: **Ask at my next appointment** (at the foot
on a phone, in the side column on desktop). It opens a sheet:

```
Ask at your next appointment
─────────────────────────────
Suggested
 ○ Can you check my iron on my next bloods?
 ○ Is my ferritin low enough to need tablets?

 ┌─────────────────────────────────────────┐
 │ Or in your own words…                   │
 └─────────────────────────────────────────┘
                              [ Add to my questions ]
```

- A suggestion can be edited before it's added. One already on the list
  says so, as `Ask` does now ("On your list").
- On a can-i whose `verdict` is `ask` ("Ask first", 52 entries), the
  entry's own `ask:` line ("Can I keep taking my antidepressants?") is
  offered as a suggestion: it needs nothing written.
- **The question remembers its entry.** In the Planner it reads "from
  *Anaemia and low iron*", linking back. Once asked, the entry shows what
  you were told: "You asked on 3 Nov: ferritin 18, start tablets."
- **The question remembers who added it,** drawn as tasks are (`whose()` in
  `src/lib/people.ts`: "Yours", "Sam's").
- **Private entries** (`private: true`) offer nothing and show no answers
  back: a saved question would be a trace.
- The inline `{% ask %}` tag (`src/content/markdoc.ts`, drawn by
  `src/features/library/components/content/Ask.tsx`, used by 2 entries and by
  `Triage`) keeps working, and now also records its entry.

### Where suggestions are written

Proposed, to confirm at step 1: a frontmatter list, not inline tags.

```yaml
appointment:
  - Can you check my iron on my next bloods?
  - Is my ferritin low enough to need tablets?
```

- One place per entry, so the sweep edits frontmatter only and never
  touches checked prose; the sheet reads it without walking the body.
- Checked by `src/content/schema.ts`: at most 3, each a question (ends in
  `?`), short (≤ 120 characters), none on a `private` entry, a `card` or a
  `term`. A bad one fails `bun run test`.
- In the eager index or the lazy `?page` chunk (`src/content/vite.ts`):
  the page chunk, since only the item page reads them.

## Steps

Each step ends with the gate green (`check`, `test`, `lint`, `e2e`), and is
committed on its own if Jason asks.

1. **The store.** *Done 2026-10-31.* Migration `023_question_source.sql`: add
   `item_id` (nullable text, an item id, not a foreign key: items are files)
   and `by` (nullable, a person id as photos, papers and the Journal keep it,
   `ON DELETE SET NULL`; null for rows from before).
   Schema and `QuestionsRepo.add(text, { itemId, by })`; `addQuestion` takes
   an optional `itemId`, checked against the built-in ids (`isBuiltInItemId`
   or like) and refused for a private item; `by` comes from who's holding the
   phone. Tests in `test/db/` for the repo, migration applied from 015.
2. **The Planner shows where from, and whose.** *Done 2026-10-31.* `OpenQuestion`
   and `AskedQuestion` draw "from *title*" (linking to `/library/<id>`) and
   whose it is. The timeline's asked questions too, if it fits the line.
3. **The entry's action and sheet.** *Done 2026-10-31.* "Ask at my next
   appointment" on every non-private item page, the sheet with suggestions
   (`appointment:` plus, on an `ask` verdict, the entry's `ask:`) and the
   free box. Check the design system's exports for a sheet/dialog first.
   `Ask` (inline) passes the entry's id. A dom test for the sheet; an e2e
   from an entry to the Planner and back.
4. **Answers back on the entry.** *Done 2026-10-31.* The entry lists the asked
   questions that came from it, with their answers and dates; open ones say
   "On your list for the next appointment".
5. **The schema field.** *Done 2026-10-31.* `appointment:` in
   `src/content/schema.ts` with the checks above, and the two existing
   inline `{% ask %}` entries left as they are. Docs: `docs/architecture.md`
   (Planner row, content fields), `docs/intent.md` (the appointment job).
6. **Content pilot: tests (56 entries).** *Not started.* Opus writes the
   brief (below); one Sonnet agent goes through every `topic: tests` entry;
   Opus reviews the diff; Jason reads it. Settle the brief before going on.
7. **Content sweep: the rest, by topic.** *Not started.* About 50 entries an
   agent, a few agents a round (the session's workflow size is under 10),
   each round reviewed by Opus before it's kept. Record each round below.
8. **Docs and memory.** *Not started.* Mark built in `docs/architecture.md`,
   tick the steps here, update the memory note.

Steps 1–5 are the app; 6–7 the content. The content can go in before the
app (the field is only data), but steps 6–7 need step 5's schema to pass
the gate.

## The brief for the sweep (draft, to settle at step 6)

For each entry in the batch, read the whole file and decide:

- **Does your own case matter here?** Would a reader reasonably want their
  midwife or doctor to tell them something about *them*: a result, a
  dose, whether it applies, what to do next? If not, write nothing.
- **Never** on `private: true`, `type: card`, `type: term`, `topic: loss`,
  money, paperwork, gear, celebrations, unless Jason says otherwise.
- **Write 0–3 questions** in the reader's voice, as they'd say it to the
  midwife: first person, plain, short, ending in `?`. "Can you check my
  iron?", not "What is ferritin?" (the Library answers that).
- **Stay inside the entry.** Every question follows from what the entry
  says (it was checked against its sources); no new medical claims, no
  advice, nothing about her body that tells her what to do.
- **On an `ask` verdict,** the entry's own `ask:` is already offered: add
  others only if they're different.
- Edit frontmatter only. Never touch the body, `checked:`, or `draft:`.
- Report every entry in the batch: `added (n)` or `skipped: <reason>`, as a
  table at the end, so every entry is shown to have been looked at.

Opus's review per batch: tone (first person, short), no drift beyond the
entry, nothing that reads as medical advice, the skip reasons sound, `bun
run test` green.

## Progress

Record each session here: what was done, what was decided, where to pick up.

- 2026-10-30: plan written. Next: step 1.
- 2026-10-31: step 1 done. `by` is a person id, not a role, matching the
  other records. A private `itemId` is refused by the privacy middleware
  before the validator; an unknown one by `isBuiltInItemId`. Next: step 2.
- 2026-10-31: step 2 done. `OpenQuestion` and `AskedQuestion` draw a line
  "from *entry* · Sam's" (`whoseBy` in `src/lib/people.ts`, by person id);
  the same cards show on This week. The timeline only counts asked
  questions, so it has nothing to add. Nothing sends an `itemId` yet, so
  the "from" half is first seen at step 3 (its e2e covers it). Next: step 3.
- 2026-10-31: step 3 done. `AskAtAppointment`
  (`src/features/library/components/askAtAppointment/`) under the entry's
  card, on phone and desktop alike (the item page has one column, so no side
  column yet). A `Modal`, as every sheet in the app is, not the design
  system's `Sheet` (a side panel). Tapping a suggestion fills the box, to
  send as it is or change; one already open on the list says "On your list"
  and can't be added twice. Suggestions are `suggestionsFor`
  (`src/features/library/model/suggestions.ts`): for now only an ask-first
  can-i's own `ask:`; step 5 adds `appointment:`. The inline `Ask` sends the
  entry from the route's `itemId`. Next: step 4.
- 2026-10-31: step 4 done. `QuestionsAbout` (beside the Planner's cards in
  `src/features/questions/components/questions/questions.tsx`) under the
  entry's action, above its papers: "Your questions", open ones first
  ("On your list for the next appointment", linking to the Planner), then
  asked ones, latest first, "You asked on 3 Nov: …". Never on a private
  entry. Covered by the journey e2e. Next: step 5.
- 2026-10-31: step 5 done. `appointment:` is a page field (`PAGE_FIELDS`,
  `pageSchema`, so in the lazy `?page` chunk), checked as planned; the card,
  term and private refusals are in `parsePage`, which knows the type. The
  sheet takes it from the loaded page, after an ask-first can-i's `ask:`,
  each once. No entry has one yet. Docs: architecture (Planner row,
  content), intent (Format), content/README. The app is done; next: step 6,
  the pilot, which costs tokens: settle the brief with Jason first.

## Not in this plan

- **Appointments as things** (a date, what it is, where): the store's
  "appointments", not built. Until then "the next appointment" means
  whichever comes next. When they exist, a question may be aimed at one.
- **Ask about a highlighted sentence:** fiddly on a phone; later.
- **Matching as you type in the Planner** ("The Library has this"): later,
  with search.
- **The capture "+"** outside the pillars: its own plan.
