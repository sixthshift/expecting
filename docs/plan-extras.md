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
