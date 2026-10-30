# Plan: how you're feeling

The Journal's "Still to come" promises "How you're feeling: a quick mood,
with words if you want them. Gentle, never a score." `intent.md` (The log)
gives its shape: a five-step scale, optional words, and if the entries stay
low for a fortnight, a suggestion to talk to someone, with the PANDA
helpline. It never scores or diagnoses. This plan builds it.

Decided with Jason on 2026-10-30:

- **It asks you; you don't go looking.** Once a day, This week asks
  whoever is holding the phone "How are you today?". One tap keeps it. It is
  also always there in the Journal.
- **Five steps, as words with a face: Rough, Low, Okay, Good, Great.** The
  word is what's kept and shown. The faces are line icons, not emoji. No
  numbers anywhere (a "3/5" is a score), and no red or green: the steps are
  the theme's accent at rising strength, so a low day is quieter, not an
  alarm.
- **Words after the tap, only if you want them:** a row of feeling words to
  pick from, and a box to say more. Anxiety is the common struggle in
  pregnancy and it isn't low mood, so it shows up as a word ("anxious, 8
  days") rather than a second scale, which would double the effort of a
  daily check-in.
- **Both of you.** Each phone checks in its own holder. Partners get
  perinatal depression too, and the Library already speaks to them.
- **The step is shared, the words are yours.** The other sees your step
  (that's how you look out for each other); the words and the sentence go
  only to the phone of the person who wrote them, so they can be honest
  ("scared", "lonely", something about the two of you). This is a
  courtesy, not security: with one password and no accounts, anyone can say
  they're you on their phone and read them. The names game's votes are the
  same.
- **Only yours to change.** Unlike a note, a feeling is changed or deleted
  only by the person it's about.
- **No streaks, no reminders, no "you missed three days".**

## The shape

On This week, under To do now, one line for whoever is holding the phone:

```
How are you today, Jason?
  ☹      🙁      😐      🙂      😄        (line icons, the accent rising)
 Rough   Low    Okay    Good   Great
```

A tap keeps it at once (through the outbox) and opens the words underneath,
which are skipped by default:

```
Okay today · change
Any words for it?
 (tired) (anxious) (worried) (overwhelmed) (teary) (irritable) (flat)
 (lonely) (scared) (calm) (happy) (excited) (connected) (grateful)
 ┌───────────────────────────────────┐
 │ Say more, if you want…  Only you see this │
 └───────────────────────────────────┘
```

Once answered today, the line folds to "Okay today · change". A phone that
hasn't said who's holding it isn't asked. Several in a day are fine
(mornings and evenings differ); the day shows its latest.

On the Journal, "How you're feeling" (out of Still to come):

- The last four weeks as rows of small dots, a row each, the dot's
  strength the step. No line chart: a line going down reads as a grade.
- Under your own row, the words you used most ("tired, 9 days"). Under
  the other's, only their steps.
- Tap a day for its entries: the step and time, and on your own, the words
  and what you wrote.

On the timeline, a week's line gets one faint dot each for the week's
feelings, nothing louder.

### The careful parts

- **Rough is never met with alarm.** Picking it adds one quiet line, "Want
  to talk to someone?": PANDA, 1300 726 306, and Lifeline, 13 11 14, if
  it's a crisis (from `perinatal-mental-health-help`, checked), linking to
  that entry.
- **The fortnight.** If, in the last 14 days, you've checked in at least
  four times and most were Low or Rough, or you picked "anxious" on most of
  the days you checked in, This week shows you (only you) a card: "It's
  been a hard couple of weeks. Low or anxious feelings that last more than
  two weeks are worth talking about with your GP or midwife." Then PANDA,
  and for a partner, PANDA's support for dads. Dismissed, it stays away for
  two weeks (remembered on the phone). The wording follows `mood-swings`'s
  checked summary. It never names a condition and never asks the EPDS's
  questions.
- **While something has happened,** This week asks nothing (it is
  `QuietWeek`). The Journal still has the check-in, and its support points
  to the loss entries rather than PANDA alone.

### Where it's kept

A table of its own, `feeling`, not a `kind` of `journal_entry`: its fields
differ (a step and words, no required body), only its owner may change it,
and half of it is filtered by who's asking. `by` is required (the person
holding the phone), `day` and `time` as notes have them, `step` (`rough` …
`great`), `words` (a JSON list of word ids), `note` (nullable), and
`created_at`. The steps and words are a typed list,
`src/features/journal/model/feelings.data.ts`, beside their rules.

## Steps

Each step ends with the gate green (`check`, `test`, `lint`, `e2e`), and is
committed on its own if Jason asks.

1. **The store.** *Not started.* The next migration (`017_feeling.sql`),
   `src/db/models/feelings/schema.ts` and `repo.ts`; `feelings` in
   CLAUDE.md's domains. Tests in `test/db/`.
2. **The server functions.** *Not started.* `src/api/rpc/feelings.ts`:
   `addFeeling`, `changeFeeling`, `removeFeeling`, as the person holding the
   phone (refused if none, or if it isn't theirs), each a `Save` in
   `src/app/model/saves.ts`; `feelingsQuery` and `useFeelings`, with the
   words and note only on the asker's own. A test that the other person's
   words never leave the server.
3. **The rules.** *Not started.* `src/lib/feelings.ts`: the day's latest,
   the dots per week, the words most used, and the fortnight. Unit tests,
   especially the fortnight's edges (three entries, a gap, anxious on half
   the days).
4. **The check-in on This week.** *Not started.* Under To do now; the
   steps, the words, the fold. The Rough line and the fortnight card. A dom
   test.
5. **The Journal's section.** *Not started.* The rows, the words, a day's
   entries, changing and deleting your own. Out of Still to come. An e2e:
   check in on This week, see it in the Journal on both phones, the words
   on one only.
6. **The timeline's dot.** *Not started.*
7. **Docs.** *Not started.* `architecture.md` (Journal row, This week),
   `intent.md` (The log: built), this plan's steps ticked.

## To settle while building

- The fortnight's numbers (four check-ins, most Low or Rough) are a first
  guess, not from a source. Jason to judge them once it's on a phone.
- The word list: fourteen to start; shorter is better than complete.

## Not in this plan

- **The summary for the midwife** ("low on 4 days, often anxious"): comes
  with appointments.
- **What's behind it** (sleep, work, money, us): a second row of words.
  Later, if the first proves light enough.
- **The capture "+"**: its own plan, with movements.
- **A reminder to check in:** never.

## Progress

- 2026-10-30: plan written. Next: step 1.
