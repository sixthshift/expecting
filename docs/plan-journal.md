# Plan: the Journal, redesigned

The Journal grew a section at a time: notes, movements, sickness and
cravings, photos and scans, how you're feeling, and results and papers, each
with its own add box, its own picture and its own list, each grouping by
week again. It was shaped like the store, not like the reasons you open it,
and five of its six add boxes were copies of what the capture "+" already
offers.

Talked through with Jason on 2026-10-31.

## Why you open it

1. **"Did it go in?"** Straight after keeping something with the "+".
2. **"What's happened so far?"** Looking back, often together.
3. **"How has it been?"** A pattern, before an appointment.
4. **"Where's that paper?"** Looking something up.
5. **"What did they add?"** What the other one kept since you last looked.

None of them is "choose a kind, then fill in its form". The "+" does the
keeping; the Journal gives it back.

## Not a paper journal

Paper journals are built like books because paper is static: a prompt on
page 20 because it's page 20, and empty frames for every week. Expecting
knows the week, what's been kept, who's holding the phone and what just
happened, so the page is composed for the moment. The keepsake is one way
to look at it, not the page: it is made as you go and shown back at the
right moments, a trimester's end and the end.

## And for whoever keeps whatever

Some keep nothing, some one or two kinds, some everything. The page shows
what's kept and never what's missing:

1. **No empty slots.** A lens, a pattern or a recap's part is there only
   once its kind has something. No "no movements yet".
2. **A pattern needs enough to be one** (`PATTERN_MIN`): movements on three
   days of the fortnight, sickness in two weeks, a craving kept twice,
   three check-ins in four weeks, a bump photo in two weeks. Below that the
   entries are rows in the story.
3. **A series is yours to start.** This week's empty bump frame shows only
   once there are bump photos in two weeks; "first time since week 22" only
   with a history.
4. **Quiet weeks fold.** A run of weeks with nothing is one line ("Weeks
   9–13"), and faint when zoomed out, never marked as missing.
5. **The story has a backbone.** What you did in the Planner (a tick, on
   its day) and the firsts are in it, so someone who never opens the "+"
   still has a Journal, and a recap.
6. **Two voices only when there are two.**
7. **One invitation, at most.** While little is kept, one line says what can
   be kept; once something is, or it's put away, it doesn't come back (put
   away on that phone). No nudges, no streaks.

## The shape

```
 Journal                    Week 28
 [Moved][Sick][Craving][Note][Photo][Paper][Feeling][A first]   the Keep row
 ┌ Now ─────────────────────────┐   one or two cards, fixed priority
 │ Since you looked: Sam kept…  │
 └──────────────────────────────┘
 Lately   movements · feelings · sickness · cravings · bump     patterns that have enough
 [All][Notes][Movements][Sickness & cravings][Photos][Feelings][Papers][Firsts]
 🔍 Look through what's kept         Days | Weeks | Pregnancy
 Week 28 · This week · 27 Oct – 2 Nov
   Thu 30   ⋯ Felt moving 9:40 am · 2:15 pm
            ✎ "Hiccups again" — Sam
 Weeks 23–27
 Week 22 · Halfway
   ★ The first scan …
```

On a desktop (`lg`), Now and Lately are a sticky column to the right of
the story.

### The Keep row

The Journal's choices from the "+" (`captureChoices`, those it files in
the Journal), as one tap each, opening the same sheet already on that form.
Each form is written once and used everywhere. Kept from the Journal there's
no "In the Journal" toast: the page shows it as just kept. Kept from another
pillar, the toast's "See it" opens the Journal on it (`?kept=`).

### Now

Fixed rules, fixed order (`nowCards`, `src/lib/journalNow.ts`), at most two
cards, so nothing jumps about:

0. **A call to make, always first.** A movement felt as slower, weaker or
   stopped in the last two days (`MovementsChanged`), or can't keep fluids
   down today (`TooSick`). Not counted in the two.
1. **Just kept** (`?kept=<kind>.<id>`): it, and its thread: a craving's
   times and since when ("Again: first time since week 22"), a movement on
   the fortnight's pattern, a photo beside the last of its kind.
2. **Since you looked:** what the other one kept since this phone's person
   last opened the Journal (`journal_seen`), shown for that visit.
3. **A first to claim:** one suggested from what's kept (the first movement:
   "was this the first kick?"), with its question.
4. **A trimester, kept,** for the week after it ends, and **your pregnancy,
   kept** from week 37: open the recap.
5. **Last week, kept,** for the first two days of a week, if it had anything.
6. **This day, weeks ago:** a first, photo or note from a whole number of
   weeks ago today (two or more), the nearest.

### The story

Everything, newest first, under its week and day (by month with no due
date; before and after the pregnancy under their own headings, as notes
were): notes, letters to the baby, movements (a day's on one line, times
only, uncounted), sickness and cravings, photos (thumbnails), feelings (a
dot and the step; your words only to you, as now), papers, firsts, and
what was done (ticks). Each week's heading has its note's title
("Halfway"). Tapping a row opens it, to change or delete as before.

- **Lenses** (`?show=`): All, Notes (with letters), Movements, Sickness &
  cravings, Photos, Feelings, Papers, Firsts, each only once it has
  something. A lens is its pattern at full size, its own tools (the bump week
  by week, side by side and the scrubber; papers' kinds, handy first; the
  feelings' days), then its entries: each old section's insides, without
  its add box.
- **Search** over all of it, held on the page, not the address.
- **Zoom** (`?zoom=`): Days (the story), Weeks (a tile a week under its
  trimester: the bump or a photo, a mark per kind, the firsts), Pregnancy
  (1–42 as one line, the firsts as landmarks, you are here). A tile opens
  its week (`?at=`), the same key as the timeline's.
- **The scrubber,** in Photos once there's a bump series: drag through the
  weeks, the bump changes, that week's story under it; and play it.

### Firsts

A typed list (`FIRSTS`, `src/lib/firsts.ts`): found out, told family,
heard the heartbeat, the first scan, showing, the first craving, the first
kick, felt from the outside, found out boy or girl (only if you know), the
first outfit, the cot is up, the bag is packed. Each has its question,
asked once it's marked ("Where were you?"), answered by each of you in your
own words. Some are suggested from what's kept or done (the first scan
photo, the first movement, one kept by the partner, the first bump photo,
the first craving, the `pack-hospital-bag` and `set-up-cot-in-your-room`
ticks), only ever as a question to confirm, with a day you can move, or put
aside; never marked on their own. Kept in `first_mark` (a first, its day,
or put aside) and `first_words` (each of you's answer).

### Letters to the baby

A note can be a letter to the baby (`journal_entry.kind = 'letter'`), from
the note form. They're in the story, the Notes lens, and the recaps.

### Recaps

Built from what's there, a part only when it has something
(`src/lib/recap.ts`): the firsts, the bump as a flipbook, the scans, the
most craved, both voices (the firsts' answers), the letters, and what you
got done. A trimester's recap is offered on Now the week after it ends; the
whole pregnancy's from week 37. Stepped through card by card
(`RecapViewer`), and the whole pregnancy as a page to print or save as a PDF
(`/journal/book`).

### While something has happened

The story keeps the notes, letters, feelings, papers and what was done. The
movements, sickness and cravings, photos and firsts are folded behind one
quiet line, "What you kept before", opened only when asked, with one quiet
"Add a photo" inside (never a bump). No Now cards (but a call), no Lately,
no recaps, no "weeks ago", no suggested firsts, no scrubber, no bump frame,
no Firsts lens. The Keep row offers what the "+" does then: a note, a paper,
a feeling. Papers after a loss as before.

## The second pass: full on day one

Looked at by Jason on 2026-10-31: an early or sparse Journal was too bare,
with nothing enticing you to use it, and the story read like a list of
database rows. So the Journal is full before anything is kept, from what
Expecting already knows, and what you keep is written into it:

- **This week's page, first** (`WeekPage`): the week large, its note's
  title, the baby this week (the first sentence of its note's "The baby",
  `babyLead`), its size when the note gives one; then what's kept this week.
- **Around now** (`aroundNow`): each first has the weeks it usually comes in
  (`FirstDef.weeks`, a first guess); those that take this week in, not yet
  marked or put aside, are invitations with their question: Write it (your
  words, kept today or the day you say) or Not yet (put off on this phone
  for the week). One suggested from what's kept is asked on Now instead.
- **Still to come in your story** (`stillToCome`): the next three firsts and
  their weeks.
- **A diary, not rows** (`Story.tsx`): the day in the margin, the words
  running as writing, photos large, a craving a chip ("Pickles, twice": a
  day's same craving is one line), sickness one line a day; no card and no
  buttons on a line: tap it, and it's changed or deleted in a sheet.
- **The weeks are the spine** (`storySpine`): every week back to the first,
  each with its note's title, one with nothing kept a faint line, never a
  blank slot. A search shows only the weeks it finds.
- While something has happened: no week counted, nothing about the baby (no
  page, no titles, no around now, nothing to come), only the weeks with
  something in them. The invitation line is gone: the page itself invites.

## Steps

Each ends with the gate green.

1. **The store.** `022_journal_story.sql`: `journal_entry` rebuilt for a
   `letter` kind; `first_mark`, `first_words`, `journal_seen`. Repos and
   server functions; letters and firsts in the private-input list.
2. **The rules.** `src/lib/story.ts` (the story, its groups, quiet weeks,
   lenses kept, search, zoom tiles), `src/lib/firsts.ts`,
   `src/lib/journalNow.ts`, `src/lib/recap.ts`. Unit tests.
3. **The page.** Keep row, Now, Lately, lenses, search, zoom, the story;
   the sections split into a lens each; capture's `?kept=`.
4. **Firsts, letters, recaps, the book, the scrubber.**
5. **e2e and docs.** Not done: a way from a timeline week to the Journal at it
   (the week's line already opens This week at that week; a second link inside
   it isn't possible, so it wants its own design).
