# Plan: sickness and cravings

The Journal's "Still to come" promises "Cravings and sickness: what and
when. Useful when the midwife asks 'since when?', and fun later."
`intent.md` (The log) gives the fields: sick (when, how bad) and craving
(what, when); "can't keep fluids down" leads straight to the call; and "You
craved pickles 14 times." This plan builds it.

## Who wants it, and when they reach for it

- **3 am, a wave of nausea, or just after being sick.** One hand, half
  asleep, maybe on the bathroom floor. She wants it written down without
  thinking; often it's the partner holding the phone, so either of you can
  keep one, and it says who did.
- **The midwife or GP asks "since when?", "how often?", "are you keeping
  fluids down?", "is it getting better?"** Nobody remembers. The Journal
  answers on one screen you can turn round and show: since when, the weeks
  as rows of days, and the last one.
- **A sudden craving** (pickles, ice, a Golden Gaytime at 11 pm) or going
  off something (coffee, the smell of onions). Mostly fun: the second time,
  it's one tap. By the birth, it's half the story: "Pickles, 14 times, from
  week 14".
- **The one that matters:** sickness that turns into can't keep fluids down
  (hyperemesis), and cravings for things that aren't food (pica, linked to
  low iron). Both are in the Library already (`severe-vomiting`,
  `morning-sickness`, `food-cravings-and-aversions`, all checked), and the
  log points to them without alarm.

It is never about her body beyond what she tells it: no advice on what to
eat, no "try ginger", no score. Directive only where its sources are (the
call) and about admin (a question for the appointment).

## The shape

Two rows in the capture "+", after the baby moved, body things together:

```
 ♡  The baby moved
 ≈  Sick or queasy
 🍦 A craving
 ✎  A note
 …
```

**Sick or queasy: one tap keeps it.** Three choices, worst last, as large
tap targets:

```
  Queasy        Threw up       Can't keep fluids down
```

A tap keeps it at once, now (through the outbox). Then, if you want, the
same sheet offers a few words and "Today, 3:10 am · Change" (for one kept
after the fact) and Done. Closing the sheet keeps it as it is.

- **Can't keep fluids down** keeps the entry and shows, in the sheet, the
  call (as a movement felt as different does), from `severe-vomiting`'s
  checked summary: call your doctor, midwife or hospital now; if you can't
  keep fluids down at all, the emergency department can give fluids through
  a drip. The birth suite's number (`CallBirthSuite`), Emergency info, and
  the entry. The sheet doesn't close on its own while this shows. Changing
  an entry to it shows the call too.
- **No "how many times"** field: each time is its own tap, so the days count
  themselves. No hours of nausea, no score (the clinic's PUQE score is the
  clinic's).

**A craving: what, then Keep.** A box ("What?"), "Craving" or "Gone off"
(one toggle, craving first), Keep it. What you've craved before sits under
the box as chips, most often first: a tap keeps that one again, now. The
second pickle is one tap.

- **Not food** (ice, chalk, clay, soil, dirt, soap, paper, starch, …): kept
  as any other, and a quiet line under it: "Craving things that aren't food
  is worth mentioning to your midwife or doctor: it's been linked to low
  iron." with "Add to your questions" (a question for the appointment, in
  the Planner) and the entry. Not an alert, not a call.

## What's kept

A table of its own, `appetite_entry` (domain `appetite`), not a `kind` of
`journal_entry`: its fields differ (how bad, what), and its checks are its
own.

- `kind`: `sick`, `craving` or `off` (gone off it).
- `how`: for `sick` only, `queasy`, `vomited` or `fluids`.
- `what`: for `craving` and `off` only, the words, trimmed.
- `note`: a few words, if any.
- `day`, `time` (filled in as now, changeable), `by` (whoever is holding the
  phone, or nobody), `created_at`, `edited_by`, `edited_at`: as notes have.

Shared, as notes and movements are: either of you sees and changes any.
The partner keeping "she threw up at 3" is the point.

## How it's shown back: the Journal's "Sickness and cravings"

1. **The add**: the two forms, side by side on a desktop.
2. **Sickness, since when** (once one is kept): "Since Tue 8 Sep, week 6.
   Last: today, 3:10 am, threw up." Then the weeks as rows, newest first, a
   cell a day, each day's worst as the brand's colour at rising strength
   (queasy faint, threw up fuller, can't keep fluids down full with a ring;
   never red), and at the row's end how many days had any. Pregnancy weeks
   with a due date ("Week 9"), seven-day runs ending today without. The
   last eight weeks, then "Show every week". It answers "how often?" and
   "getting better?" by looking, without the app saying "easing".
3. **Sick often** (a first guess, not a source's number: threw up on four or
   more of the last seven days): one quiet line above the rows, from
   `severe-vomiting`: "Being sick often is worth a call to your midwife or
   doctor; there is treatment." With "Add to your questions" ("I've been
   sick on 5 of the last 7 days, since 8 Sep. What can help?") and the
   entry. Not red, no alert.
4. **What you've craved**, the fun list: "Pickles · 14 times · from week
   14", most first; then **Gone off**: "Coffee · from week 7".
5. **Each entry**, newest first, eight then "Show all": changed or deleted
   by either of you, a deleted one put back from its toast.

## The rest

- **While something has happened:** nothing new is offered (not in the "+",
  not in the Journal), and what was kept is folded behind one quiet line,
  "The sickness and cravings you kept", never deleted. As the movements.
- **No one holding the phone:** still offered; `by` is left empty, as a
  note's is.
- **Offered at any week:** sickness can start at 4 weeks and last to the
  birth; cravings run through the second trimester. With no due date too.
- **On the timeline:** a week's line says "sick 3 days" (the days with any)
  and "craved pickles" (the week's most kept craving, one), quietly.

## Steps

Each step ends with the gate green (`check`, `test`, `lint`, `e2e`).

1. **The store.** *Done.* `019_appetite.sql`;
   `src/db/models/appetite/schema.ts` and `repo.ts`; `appetite` in
   CLAUDE.md's domains. Tests in `test/db/appetite.test.ts`.
2. **The rules.** *Done.* `src/lib/appetite.ts`: the kinds and how bad,
   since when, the weeks, sick often, the tallies, the chips, not food. In
   `test/lib/appetite.test.ts`.
3. **The server functions.** *Done.* `src/api/rpc/appetite.ts`:
   `addAppetite`, `editAppetite`, `restoreAppetite`, `deleteAppetite`, each a
   `Save` in `src/app/model/saves.ts`; `appetiteQuery`, `useAppetite`. Each
   in `test/server/private.test.ts`.
4. **The Journal's section.** *Done.*
   `src/features/journal/components/appetite/`: `AddSickness`,
   `AddCraving`, `TooSick` (the call), `NotFood`, `SicknessWeeks`,
   `Cravings`, `AppetiteSection`. Out of Still to come. DOM tests in
   `test/features/journal/appetite.dom.test.tsx`.
5. **The "+".** *Done.* "Sick or queasy" and "A craving" in
   `captureChoices`, never while something has happened.
6. **The timeline.** *Done.* `sick` and `craved` on `MapWeek`, drawn by
   `WeekMap`.
7. **e2e.** *Done.* `e2e/plus-sickness.spec.ts` (named to run after the
   journey, at week 28, and before `quiet.spec.ts`): sick from the "+", the
   call on can't keep fluids down, a craving twice by its chip, the
   Journal's rows and tally, the timeline, and ice with its question.
   `quiet.spec.ts` checks the "+" offers neither after a loss and the
   Journal folds them away.
8. **Docs.** *Done.* `architecture.md`, `intent.md`, CLAUDE.md.

## To settle while building

- "Sick often": four days in seven is a first guess. Jason to judge.
- The not-food words are a short list, matched as whole words; "ice" is in
  it (craving ice is the commonest pica, and in the entry's aliases), "ice
  cream" and "iced coffee" are not.
- Whether "Threw up" or "Vomited" reads better at 3 am.

## Not in this plan

- **The summary before an appointment** ("sickness on 5 days, easing"):
  comes with appointments, and will read from these rows.
- **Hours of nausea a day, or a PUQE score:** a score is the clinic's.
- **What helped** (ginger, crackers, medicines): advice about her body, and
  a medicine log is its own feature.
- **Weight:** intent keeps it behind a switch, later.
- **The partner's sympathy cravings:** a craving is the pregnancy's, kept by
  either of you.
- **This week:** the peek at a week shows notes and movements; sickness
  stays in the Journal and on the timeline.

## Progress

- 2026-10-30: plan written, and built, steps 1–8.
