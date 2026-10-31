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
- **A script, then Sonnet, then Opus** (settled 2026-10-31): a script
  skips by the rules, Sonnet decides which of the rest need questions,
  Opus writes them and checks Sonnet's skips. Opus must read a flagged
  entry whole either way (to review a question it must know the entry), so
  it writes rather than corrects. A pilot batch (tests) comes first.

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
6. **Content pilot: tests (56 entries).** *Done 2026-10-31.* The sweep below
   over every `topic: tests` entry (the script leaves 30 of them); Jason
   reads the diff. If Opus keeps overturning Sonnet's skips, tighten the
   brief, or let Opus sort too, before going on.
6b. **Second pilot: medicines (50 entries),** with the review stage, to
   test Sonnet's sorting on a topic that mixes general and personal
   entries, and the `ask` verdict rule. *Done 2026-10-31.*
7. **Content sweep: the rest, by topic.** *Done 2026-10-31.* The same sweep a
   topic at a time, a few Sonnet agents a round (the session's workflow
   size is under 10). Record each round below.
8. **Docs and memory.** *Done 2026-10-31.* Mark built in `docs/architecture.md`,
   tick the steps here, update the memory note.

Steps 1–5 are the app; 6–7 the content. The content can go in before the
app (the field is only data), but steps 6–7 need step 5's schema to pass
the gate.

## The sweep

1. **The script** reads frontmatter only and skips, with its reason, every
   `private: true`, `type: card`, `type: term`, `topic: loss` entry, and
   those on money, paperwork, gear, celebrations or the partner's own
   health (`partner-flu-vaccine`, …: the appointment is the carrying
   parent's, and the midwife isn't the partner's doctor). The last few are
   a list of ids the script holds, since no field says so.
2. **Sonnet** reads each remaining entry whole and answers one question,
   with a one-line reason: **does your own case matter here?** Would a
   reader reasonably want their midwife or doctor to tell them something
   about *them*: a result, a dose, whether it applies, what to do next?
   It writes nothing.
3. **Opus** writes the questions for each entry Sonnet flagged (the brief
   below), reads Sonnet's skip reasons and takes back any it disagrees
   with, and runs `bun run test`.
4. **A fresh agent reviews** every question against its entry and the
   brief, as `checked:` has a second agent confirm the facts: the writer
   doesn't catch its own blind spots. It flags, it doesn't edit; Opus
   settles each flag, and Jason reads the flags rather than every line.
5. **The report:** every entry in the batch, `added (n)` or `skipped:
   <reason>` (by the script, Sonnet, or Opus), and the review's flags with
   what was done, so every entry is shown to have been looked at.

## The brief for writing

- **Never** anything the script would skip, unless Jason says otherwise.
- **Never about cost,** even on a decision: "Would you suggest NIPT for me,
  given my age?", never "Is it covered?".
- **On hard news** (a high-chance result, a small baby, twins), gently:
  ask what comes next for you ("What are my options from here?"), never
  about outcomes or odds.
- **Write 0–3 questions** in the reader's voice, as they'd say it to the
  midwife: first person, plain, short, ending in `?`. "Can you check my
  iron?", not "What is ferritin?" (the Library answers that).
- **Stay inside the entry.** Every question follows from what the entry
  says (it was checked against its sources); no new medical claims, no
  advice, nothing about her body that tells her what to do.
- **On an `ask` verdict,** the entry's own `ask:` is already offered: add
  others only if they're different.
- **"What did my … show?" only on the entry about that result,** not as a
  template on every entry that mentions a test: repeated, it's filler.
- **Never for some readers only** ("If I'm RhD negative, …"): every reader
  of the entry sees its suggestions. Put it on the entry for those readers.
- **Your own voice:** "we" and "us" on a `who: together` entry, "I" and
  "me" elsewhere.
- **Not what the entry already says** for everyone ("every 4 to 6 weeks"),
  even about you.
- **Never the wrong channel:** where the entry says to act now (call, go
  in, tell your doctor immediately, anti-D within 72 hours), no question
  parks it for the next appointment.
- **The list is shared:** nothing whose wording tells the partner what she
  may not have (drug use, a medicine she takes). Ask about the need
  ("What else can I try for nausea or sleep?"), not the disclosure.
- **Mark it discreet** (`discreet: true`) where the entry's title would tell
  the partner what the question doesn't (mental health, drugs, smoking): a
  question from it then isn't shown "from <title>" on the shared list.
- Edit frontmatter only. Never touch the body, `checked:`, or `draft:`.

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
- 2026-10-31: the sweep settled with Jason before the pilot: a script,
  then Sonnet sorts, then Opus writes and checks the skips (see The
  sweep). The brief gained three rules: never the partner's own health,
  never cost, and gently on hard news. Next: step 6.
- 2026-10-31: step 6 written. Of 56 tests entries the script skipped 29
  (25 terms, 1 card; `partner-flu-vaccine` and
  `partner-whooping-cough-booster`, the partner's own health;
  `paying-for-scans`, money). Sonnet flagged all 27 others, so its sorting
  wasn't really tested: tests is nearly all your own results. Opus wrote 71
  questions over the 27 (1 to 3 each); `test/content/` green. The next
  topic should mix general and personal entries (`body`, `food`) to test
  the sorting. Next: Jason reads the diff.
- 2026-10-31: pilot critiqued with Jason. Kept: "we" on together entries
  (NIPT changed to match), the same question on several entries, and
  questions before their result (the list is for the next appointment).
  Three reworded or dropped; the brief gained the template, some-readers
  and voice rules; the sweep gained a review by a fresh agent. Next: a
  second pilot on `medicines` (6b).
- 2026-10-31: 6b written. The script skipped none (all can-i); Sonnet
  flagged 17 of 50. Opus overturned 6 (skipped antibiotics, iodine, aspirin,
  migraine-medicines and isotretinoin, which says tell your doctor
  immediately; flagged medicines-in-pregnancy) and wrote 20 questions on 12.
  The review (a fresh agent, over both pilots) raised 20 flags and 2 missed
  entries; Opus kept 17 and 1, rejecting three ("we" with the clinician on
  `large-for-dates`, the side effects the `iron-infusion` entry says to ask
  about, and aspirin, which pre-eclampsia covers). 13 questions dropped, 5
  reworded, 1 added: 77 questions on 38 entries. The brief gained three
  rules: not what the entry says, never the wrong channel, the list is
  shared. Open for Jason: an ask-first entry's `ask:` is offered even when
  it's general ("How do I know if a medicine is safe?"). Jason read both
  pilots and kept them. Next: step 7.
- 2026-10-31: step 7, round 1 (`body`, `care`, `mental-health`). The
  script also skips `type: payment` now (money). Of 207 entries it skipped
  118 (89 terms, 27 cards, 2 payments); four Sonnet agents sorted 159 and
  flagged 56; Opus overturned 6 (breathlessness, heartburn,
  signs-of-pre-eclampsia, thrush: wrong channel; heart-and-blood and
  private-midwife: covered elsewhere) and wrote 63 on 50. The review raised
  18 flags and 5 missed entries: 2 dropped (racing-heartbeat,
  antenatal-depression: urgent), 14 reworded, the misses rejected (an
  ask-first's own `ask:` covers chiropractic and the other therapies; thrush
  stays urgent). It also found that the Planner's "from <title>" line undid
  the neutral wording on sensitive entries, for any question asked from
  them. Decided with Jason: a `discreet` field (schema, `parse.ts`, `Source`
  in `questions.tsx`, tested in `test/features/questions/source.dom.test.tsx`)
  on the 24 mental-health entries and antidepressants, st-johns-wort,
  cannabis, illicit-drugs, vaping and nicotine-replacement; later rounds
  mark their own. Next: Jason reads round 1, then round 2.
- 2026-10-31: step 7, round 2: the 13 topics left (`activities`,
  `after-the-birth`, `appointments`, `baby`, `birth`, `drink`, `feeding`,
  `food`, `labour`, `relationships`, `special-circumstances`, `travel`,
  `work`). The script skipped 129 of 416 (69 terms, 47 cards, 10 money, 3
  private); eight Sonnet agents sorted 287 and flagged 82. Opus overturned
  3 (seaweed and cat-litter: subset only; morphology-scan flagged, its
  result's own entry) and wrote the first 5 itself; at this size five Opus
  agents wrote the rest from a shared brief, each free to overturn the
  sorter (they skipped 4 more: timing-contractions, malaria,
  the-babys-brain, twins-and-multiples), and
  marked 3 discreet (alcohol-before-you-knew, pregnancy-after-loss,
  pregnancy-after-birth-trauma). Two fresh reviewers raised 24 flags and 6
  missed entries; Opus kept 23 flags (4 dropped, 18 reworded, one pair
  folded into one) and 5 misses (anti-d, whooping-cough-vaccine,
  rsv-vaccine, working-while-pregnant, by the `rhd-negative` wording for
  anti-d), and rejected discreet on caesarean-on-request and a question on
  fasting (its `ask:` covers it). "This hospital" became "the hospital I'm
  booked into": the appointment may be with a GP. The same question on two
  entries can't go on the list twice (`AskAtAppointment` matches the open
  list by text).
- 2026-10-31: the sweep is done. Every entry was looked at: 280 questions
  on 167 entries, 33 entries discreet. The topics the script skips whole
  (`loss`, `money`, `paperwork`, `gear`, `celebrations`, `partner`) and
  every card, term and private entry have none. Content tests green.
  Still open for Jason: an ask-first entry's own `ask:` is offered even
  when it's general.

## Not in this plan

- **Appointments as things** (a date, what it is, where): the store's
  "appointments", not built. Until then "the next appointment" means
  whichever comes next. When they exist, a question may be aimed at one.
- **Ask about a highlighted sentence:** fiddly on a phone; later.
- **Matching as you type in the Planner** ("The Library has this"): later,
  with search.
- **The capture "+"** outside the pillars: its own plan.
