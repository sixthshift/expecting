# Plan: extras that change the app

Most extras add an entry and its tasks, and for many that's the whole job.
The ones worth most bring something you *do*. Built so far, in
[the Drawer](product/drawer.md) and [extras](product/extras.md): a task that
ends by keeping something (`keeps`), Your people and its four views, Who
does what, A question a week and Pregnancy bingo. This plan is what's left:
ideas, except where it says *decided*.

## Left from what's built

- **The maternity shoot:** a photo kind of its own, `shoot` (decided: the
  bump's week-by-week line is for bump photos), one migration on the
  `photo_kind` check, and a task, *Add your favourites from the shoot*.
- **Emergency info as a place a task keeps** (`keeps: { emergency: <field> }`):
  nothing needs it yet.

## Next

**Minding cards** (Older siblings, Pets), then the trackers once their
lists exist. The leave plan is core, not an extra, and gets a plan of its
own.

## More like the names game

Each of you on your own phone, something revealed when you both have. The
small ones join extras that already exist rather than adding new ones.

- **Same page.** The big choices (dummies, where the baby sleeps, screens,
  religion, whose surname) answered alone, shown side by side once both are
  in. Starts a conversation; no right answers. Waits.
- **Date night picker.** Swipe a deck of ideas; the matches are your list.
  Joins Date nights.
- **Predictions.** The sex, the day, the hair, whose nose: sealed until the
  birth, so it needs the weeks after the birth. Waits.
- **Letters to open at the birth,** and a **time capsule** for their 18th:
  the Journal's letter, with a seal. Join Keepsakes; need the birth to open.
- **Size of a…** The baby's size each week in a theme you choose (fruit,
  Australian animals, coffee orders). Waits.
- **Shower games.** Bingo cards and a guess-the-bump sheet, as a page to
  print, since guests can't log in. Joins Baby shower.
- **The two of you as babies,** side by side, for comparing later; **voice
  notes to the bump,** which need audio in the upload store. Wait.

## For the admin

Not games: what Expecting is best at, telling you what to do and by when.

- **Trackers,** a list where each thing has a state. Decided: these are
  more of the lists' `list` values, each with its own states.
  - **Childcare waitlists:** joined during the pregnancy in much of
    Australia. A centre a line, *enquired*, *toured*, *on the list*,
    *offered* or *declined*, with the day applied, the start wanted, and a
    task to check in. Check its dates fit when it comes.
  - **Freebies:** each pack or program *signed up*, then *arrived*.
  - **What's in the freezer:** Freezer meals' meals and portions, crossed
    off after the birth.
- **The leave plan** (decided: core, in the Planner, for everyone). Each of
  you's leave on one calendar, the days you're both off, when each goes
  back, and the claims' deadlines as tasks.
- **The route card.** The hospital, where to park, the after-hours
  entrance, a backup route. Partly in It's time's getting there now; what's
  left is Partner prep's *Plan the route* keeping into it.
- **Minding cards.** A card for each thing someone minds when labour
  starts: the older child (routines, allergies, pick-up, who to call), the
  pets (feeding, the vet, the keys), the house. Decided: it goes out through
  the share sheet as text, or printed; never a public link.
- **Visitor rules.** A short note for visitors (hands washed, whooping
  cough vaccine, drop food and go), with Your people's Visitors.
- **Birth preferences.** Her choices, kept and shared with the midwife as a
  page. Expecting keeps what she decides, never suggests what she should.
- **Life admin.** A will, guardians, life insurance, super beneficiaries:
  each a decision and a paper.
- **Asking the grandparents.** Their pregnancies, the family's health
  history, what you were like as babies, kept in the Journal. Gives
  Grandparents a feature.
- **A gift registry** over the lists, with Baby shower. Gifts received are
  Your people's; this is gifts wanted.

## Picked: Before the baby, What we'll keep, Predictions

Picked by Jason on 2026-11-01, after a look at more fun things (it
reverses settled 9's "Predictions waits"). Two give an extra that's only
reading a tool of its own; one is a new extra. In the order to build: the
simplest first, then the two that reuse "both answer, then reveal".

### Before the baby (Date nights)

A shared list of the things you want to do as two before the baby: a
sleep-in, a gig, the long lunch, a night away. The Date nights extra's
tool, at `/drawer/before`.

- **Shared, not hidden.** It's one list for both of you: anything either
  adds, the other sees. Nothing to reveal, so it's the simplest of the
  three.
- **Ideas to start from.** A short deck of ideas (`BEFORE`,
  `src/lib/before.ts`, drawn from the entry's: the restaurant you keep
  meaning to try, a show, a class together, a night in done properly, the
  beach, a night away), shown beneath the list, a tap to add one. Your own
  go straight on. An idea added isn't shown again; taken off, it comes
  back.
- **Done is a moment.** Ticking one asks for the day (today by default), a
  few words and a photo if you want one. The photo is the Journal's
  (`photo`, kind `photo`), so it's kept like any other; the done item is a
  line in the Journal's story on its day ("Did: dinner at the place on
  Smith St").
- **No count, no nag.** It never says how many are left or that time is
  running out. Done ones fold beneath, newest first.
- **It doesn't end at 40 weeks.** Some things happen late or after; the
  list stays open as long as the extra is on.
- **The entry's task opens it.** *Put a few date nights in the calendar*
  keeps `{ tool: before }`: "Open the list", ticked by hand as now.
- **Put away while something has happened,** never deleted.

Built as: `before_item` (id, text, idea_id or null, added_by, added_at,
done_day, done_note, photo_id → `photo(id)` on delete set null), a
migration, `BeforeRepo`, `src/api/rpc/before.ts` with its saves (add,
edit, remove, done, undone), `src/pillars/drawer/features/before/`, the Drawer row, and
a `before` line in the Journal's story.

### What we'll keep (Traditions)

The Traditions extra's tool, at `/drawer/traditions`: the customs and
habits each of you grew up with, and which you'll carry on. Who does
what's shape, for something warmer.

- **A deck of traditions** (`TRADITIONS`, `src/lib/traditions.ts`), in
  groups: *Welcoming the baby* (a naming ceremony, a baptism, the
  confinement month, a full-month or hundred-day party, a tree planted),
  *Every day* (bedtime songs, a family dinner, the language you speak at
  home, Sunday at the grandparents'), *The year* (how birthdays go,
  Christmas, Lunar New Year, Diwali, Eid, the Easter hunt), *The family*
  (a name passed down, an heirloom, the photo every birthday). Broad, not
  one culture's; written and reviewed like any deck (`content/REVIEW.md`).
- **Each of you answers on your own phone,** a card at a time: *Keep it*,
  *Maybe* or *Not for us*, and whether it's from *my family*, *yours*,
  *both* or *neither* (it's new to both of you). Undo, as the jobs.
- **Neither sees the other's answer until both have,** Who does what's
  rule (`JobsRepo.view`). Then a tradition is *Keeping* (both keep it),
  *To talk about* (you differ, or either said maybe) or left out (both
  not for us, folded away, never "rejected").
- **Your own.** Either of you adds a tradition from your family, in a few
  words; the other is dealt it first, as the names game deals added names.
- **Kept ones that need booking say so.** A tradition with a booking
  (a celebrant, a parish, a confinement nanny, the people a brit milah or
  an aqiqah needs) links to the Traditions entry, whose *Book what your
  traditions need* is the task. No new tasks, no dates.
- **The entry's task opens it.** *Talk through which traditions you'll
  keep* keeps `{ tool: traditions }`.
- **Kept on trust; put away while something has happened.**

Built as: `tradition_pick` (tradition_id, person_id, keep, from, updated_at)
and `tradition_own` (id, text, added_by, added_at), a migration,
`TraditionsRepo` with the reveal in its view, `src/api/rpc/traditions.ts`,
`src/pillars/drawer/features/traditions/`, the Drawer row. The third use of "both answer,
then reveal": lift the rule out of the three repos into one helper then,
not before.

### Predictions (a new extra)

Each of you guesses, on your own phone; the guesses are sealed until the
baby is here, then opened side by side with who was closest. The baby pool
for two: nobody else needs a login. Its own extra, *Predictions* (For you
two, offered at 20), at `/drawer/predictions`.

- **The guesses** (`PREDICTIONS`, `src/lib/predictions.ts`): boy or girl
  (only while you don't know: settings' `unknown`), the day (a date, the
  due date shown), the time (morning, afternoon, evening, overnight), the
  weight (kg, one place), the hair (none, a little, lots, and its colour),
  who they'll look like (me, you, both, neither), who cries first (me, you,
  both), and the name (one off the names game's shortlist, or typed, if
  Choosing a name is on). Nothing about her body or the labour: not how
  long, not how.
- **Sealed.** You see your own; of the other's, only that they've guessed
  ("Sam's are in"). Changeable until opened. Kept on trust, and the page
  says so: switch phones and they're there.
- **Opened when you say they're here.** Either of you fills in what
  happened, whatever you like of it (the day, the time, the weight…), and
  opens it. Opening shows both of you's guesses beside the answer, the
  closest of each marked, and who was closest most often. Once opened,
  guesses are fixed; the answers can be corrected.
- **A record of the game, not of the birth.** The day you type in is the
  game's answer, kept only here: it isn't the app's birth date, doesn't
  move the weeks, and nothing else reads it. The weeks after the birth,
  when they come, ask for the birth on their own.
- **The opening is in the Journal's story,** on the day it's opened:
  "Predictions opened: Sam guessed the weight within 100 g".
- **Twins:** one set of guesses per baby for boy or girl, weight, hair and
  name; the rest once.
- **Quiet:** put away, never deleted; nothing asks for answers.

Built as: `prediction_guess` (question_id, baby, person_id, value,
updated_at), `prediction_answer` (question_id, baby, value, set_by,
set_at) and its opened day, a migration, `PredictionsRepo` (sealed in its
view: the other's values only once opened), `src/api/rpc/predictions.ts`,
`src/pillars/drawer/features/predictions/`, the extra in `extras.data.ts` (with `tool`),
the Drawer row, a `predictions` line in the Journal.

### What it holds to

All of "Across all of it", and: every save through the outbox, idempotent
(a guess is a set, done/undone a set); every new write path in
`test/server/private.test.ts`; the decks are content, reviewed by Claude
(`content-is-claudes`); each settings switch says it adds a tool.

### Questions

1. **The bucket list's name.** "Before the baby" (recommended: plain, and
   says when) or "Bucket list"?
2. **Ideas: tap to add, or swipe to match?** Tap (recommended: it's a
   shared list, a match adds a step for nothing) or the date night picker's
   swipe, each of you, a match goes on.
3. **Predictions opens by hand** (recommended), or opens itself when It's
   time's "they're here"? It's time has no such moment yet.
4. **Who wins is said** (recommended: "closest most often", it's a game),
   or only the guesses beside the answer?

### Steps

1. **Before the baby**: table, repo, rpc and saves, the page, Drawer row,
   Journal line, `keeps: { tool }` on the task (the field gains `tool`),
   Date nights' `tool`. Tests: repo, saves twice, private paths; e2e: add
   an idea, tick it with a photo, see it in the Journal.
2. **What we'll keep**: the deck written and reviewed, table, repo with
   the reveal, rpc, page (a card at a time, then Keeping and To talk
   about), your own dealt first, Drawer row, the task. e2e: answer as
   each of you, see the reveal.
3. **Predictions**: the extra, deck, tables, sealed view, page (guess,
   then open), the Journal line. e2e: guess as each, the other's sealed,
   open, see both.
4. Fold into `docs/product/drawer.md` and `extras.md`; take Part 5 out of
   this plan.

## What every new one holds to

Beyond what [extras](product/extras.md) and [the Drawer](product/drawer.md)
already say:

- **One pillar each.** The Drawer for tools, the Planner for admin, This
  week for the weekly ones; anything dated also shows on its week. Dates
  after week 42 (the leave plan, the meal train, childcare starts) stay in
  their feature until the weeks after the birth exist.
- **What's kept, never what's missing.** A match or a marked square belongs
  in the Journal's story; an empty one doesn't, and nothing nags.
- **Some need more than hiding while quiet:** the leave plan still matters
  after a loss, and should say so gently, not vanish.
- **The decks are writing:** reviewed before they go in, under
  [`content/REVIEW.md`](../content/REVIEW.md). Facts that change (Paid
  Parental Leave, the Child Care Subsidy) are sourced like any entry.
- **Every save through the outbox** with an `apply` that gives the same
  answer twice, and **every new write path** in
  `test/server/private.test.ts`.
- **Mind the cost.** Each is a build, not an entry. Pick a few, build them
  well, leave the rest here.
