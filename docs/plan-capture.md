# Plan: the capture "+"

`intent.md` puts one button outside every pillar: a "+" always within thumb
reach that files a kick, a question or a photo into the right pillar (The
pillars; The log). Until now everything is added on its own page: a note in
the Journal, how you're feeling on This week or the Journal, a question and
an own task in the Planner. `intent.md` held the button back "until it has
more than one thing to file", and planned it to arrive with movements. This
plan builds both.

Decided with Jason on 2026-10-30:

- **It files five things:** a movement, a note, how you're feeling, a
  question for the appointment, and something to do. Movements are new; the
  other four already exist and keep their own add boxes. The rest of the log
  (sickness, cravings, symptoms) and photos come later.
- **On a phone, a round "+" floating bottom-right,** just above the tab bar,
  where a thumb reaches. The tab bar already holds six pillars, so it doesn't
  take a seventh slot. On a desktop, an "Add" button at the top of the
  sidebar.
- **Filled in where it's opened.** The "+" opens a bottom sheet (the design
  system's `Modal`, which slides up from the bottom on a phone; its `Sheet`
  only slides in from the side) listing the five. Picking one shows its short form in
  the same sheet. A save goes through the outbox, the sheet closes, and a
  toast says where it went ("In the Journal", with a link). You stay on the
  page you were on.

## The shape

```
                                   ┌─────────────────────────┐
                                   │ Add                     │
                                   │  ♡  The baby moved      │
                                   │  ✎  A note              │
                                   │  ☺  How I'm feeling     │
                                   │  ?  A question to ask   │
                                   │  ✓  Something to do     │
                                   └─────────────────────────┘
 ─────────────────────────────── (+)
 [This week] [Timeline] [Library] [Planner] [Journal] [Drawer]
```

Each choice's form is the one its pillar already draws, reused, not copied:

- **A note:** the Journal's add box (`notes.tsx`), with its day and time
  filled in as now and "You both see every note".
- **How I'm feeling:** `StepPicker`, then `MoreWords`, as on This week.
  Picking Rough shows `Support` in the sheet, as it does on This week.
- **A question to ask:** the Planner's add box (`questions.tsx`).
- **Something to do:** `AddTask`, for this week, as at the foot of the
  Planner's To do.
- **The baby moved:** new (see below).

The order is fixed: no "most used first", and no remembering the last pick.
Moving rows are harder to hit by thumb.

### Movements

- **One tap is enough.** "The baby moved" with Keep, the time filled in as
  now (changeable), and an optional note. Either of you can log one:
  partners feel kicks too. It is shared and either of you can change it,
  like a note, and it says who logged it.
- **A change is the careful part.** One line under it: "Slower, weaker or
  stopped?" Ticking it keeps the entry and shows, in the sheet, the
  `baby-movements` advice (its checked summary: contact the midwife or
  birth unit straight away, not tomorrow) with the call button
  (`CallBirthSuite`, or the way to Emergency info if no number is set yet).
  The sheet doesn't close on its own while this shows.
- **It never reassures.** No counts, no "a good day", no "all normal". The
  toast says only where the movement went. Kick counting isn't Australian
  advice, so there is no target and no tally.
- **The pattern, in the Journal:** the last two weeks as a row per day, each
  movement a dot at its time of day, so the baby's own rhythm shows (the
  evenings, after meals). Only days with one kept: a day without is a day
  nobody wrote one down. No totals, and no line marking what's usual. A
  movement marked as a change gets a ring, never red. The movements are
  listed under it in a section of their own, not among the notes, so the
  notes' search stays about words. A peek at a week on This week shows both.
- **Offered from week 16,** where `baby-movements`'s weeks start. Before then
  the choice isn't in the list. In the Journal the section shows from then,
  or earlier once one has been logged.
- **On the timeline,** a week with movements gets one faint mark, like a
  note's.

### Who's asked what

- **No one holding the phone:** "How I'm feeling" isn't in the list, as a
  phone that hasn't said who's holding it isn't asked on This week. A
  movement or note keeps no `by`, as a note does today.
- **While something has happened:** the Journal folds the movements kept
  behind one quiet line, "The movements you kept", rather than show the
  baby's last movements on every visit; they are never deleted. The "+"
  offers a note, how you're feeling, and a question, which is what the Journal and Planner still
  offer. No movement, ever, and no "Something to do", because To do is put
  aside. A Rough check-in points to `loss-support-services`, as in the
  Journal.
- **Where it shows:** on the pillars only, which `PillarLayout` draws. Not
  on Emergency info, onboarding, settings or the login page.

### Where a movement is kept

A `kind` of `journal_entry`, as that table was made for: `movement` beside
`note`. It is dated, shared, changed by either of you, and lands on its day.
Two changes to the table:

- `body` may be empty for a movement (the note is optional). It stays
  required for a note.
- a new `different` column (0 or 1, only for a movement): marked as slower,
  weaker or stopped (`intent.md`'s "different from usual").

SQLite can't alter a `CHECK`, so `018_movement.sql` rebuilds the table
(create new, copy, drop, rename) in one transaction.

## Steps

Each step ends with the gate green (`check`, `test`, `lint`, `e2e`), and is
committed on its own if Jason asks.

1. **The store.** *Done.* `018_movement.sql`; `kind` and `different` in
   `src/db/models/journal/schema.ts`, its repo reading and writing them.
   Tests in `test/db/journal.test.ts`, and that the migration keeps
   existing notes in `test/db/movement-migration.test.ts`.
2. **The server functions.** *Done.* `addMovement`, `editMovement`,
   `restoreMovement` (undo) and `deleteMovement`, as a note's are named, in `src/api/rpc/journal.ts`, each a `Save` in
   `src/app/model/saves.ts` whose `apply` gives the same answer run twice.
   Each is listed in `test/server/private.test.ts`.
3. **The rules.** *Done.* In `src/lib/journal.ts`: the pattern
   (`movementPattern`), whether movements are offered (`movementsOffered`).
   What the "+" lists is the capture feature's own model
   (`src/features/capture/model/choices.ts`). Tests in
   `test/lib/journal.test.ts` and `test/features/capture/choices.test.ts`.
4. **The sheet.** *Done.* `src/features/capture/` (its own feature, because
   it files into four others): `CaptureButton` (the floating "+" and the
   sidebar's Add) and `CaptureSheet` (the list and the chosen form). The
   movement's form is the Journal's (`AddMovement`), and the Journal's
   check-in became `CheckInNow` so the sheet draws the same one. Drawn by
   `PillarLayout`. Each pillar's page gets bottom
   room so the "+" never covers its last row. DOM tests in
   `test/features/capture/`, including that the change line shows the call.
   In the call box the birth suite is a button (`CallBirthSuite`'s
   `button` layout), the strongest thing there.
5. **The Journal's movements.** *Done.* The pattern and the day's movements beside
   the notes, out of Still to come. Change and delete as a note's, with a
   deleted one put back from its toast.
6. **The timeline's mark.** *Done.* `moved` on `MapWeek`, drawn by
   `WeekMap` as "felt moving"; `kept` now counts notes only.
7. **e2e.** *Done.* `e2e/plus.spec.ts` (named to run after the journey, as
   specs run by name): each of the five from the "+", landing where it
   says; a movement marked as a change shows the call; the "+" only on the
   pillars. `smoke.spec.ts` opens the sheet on a phone and a desktop, and
   `quiet.spec.ts` checks it offers no movement after a loss.
8. **Docs.** *Done.* `architecture.md` (the frame, the Journal, Something has
   happened), `intent.md` (The pillars, The log), CLAUDE.md's summary.

## To settle while building

- The wording of the five, and of "Slower, weaker or stopped?".
- Week 16 as the start, for a second baby who may be felt earlier. Logging
  is harmless, so earlier may be fine.
- Whether a phone's "+" should sit lower on the Library's entry pages,
  where it may cover reading. Judged on a phone.

## Not in this plan

- **Sickness, cravings, symptoms:** the rest of the log. Each is one more
  `kind`, and one more row in the sheet.
- **Photos:** they wait for uploads and backups (Records).
- **A name for the names game:** it stays in the Drawer.
- **The summary for the midwife** ("movements daily"): comes with
  appointments.
- **A shortcut key, or a "+" that guesses from the page you're on.**

## Progress

- 2026-10-30: plan written, and built, steps 1–8. Left: Jason to judge the
  wording, week 16, and the "+" over the Library's reading, on a phone.
- 2026-10-30: after review: movements folded away after a loss; changing a
  movement to slower, weaker or stopped shows the call, as a new one does;
  `restoreNote` takes a note without `different`, from a phone still on the
  build before movements.
