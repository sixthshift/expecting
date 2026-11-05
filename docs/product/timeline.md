# The whole pregnancy

The timeline: the whole pregnancy at once, weeks 1–42, a line a week. It's
opened from Home (a strip of the pregnancy under the week's heading,
and "The whole pregnancy" beside it), at `/timeline`. What's to do across
the weeks is the Planner's chart, [Across the weeks](planner.md#across-the-weeks).

How it's built is [`architecture.md`](../architecture.md), The whole
pregnancy; the week itself is `src/lib/timeline.ts`.

## Why it isn't a pillar

A pillar is where things live, and nothing lives only on the weeks. Each
job a timeline might do belongs to a pillar that already has the thing:

- **"Where are we in all of it?"** Home, which already said where you
  are. The strip under its heading puts the week in the whole pregnancy,
  and opens the timeline.
- **"When do we have to…?"** The Planner, which holds what's asked of you,
  with its chart, Across the weeks.
- **"What happened in week 22?"** The Journal, which is already by week.

So the week is the thread through everything, as data (every dated thing
has a week), and the bird's-eye view is a page without a tab. Five tabs fit
a phone better than six, and each answers a different question.

## Why you open it

- **"Where are we in all of it?"** How far along, and what's ahead, at a
  glance.
- **"What was week 22?"** Behind today, each week's line says what
  happened in a few words.

## What it holds to

- **The week is the spine.** Pregnancy weeks are completed weeks of
  gestation, the way midwives count: "28 weeks" runs from 28+0 to 28+6.
  Before week 1 the app reads as week 1; past 42 it stays at 42. The
  current week is worked out from the due date as it's read, never stored,
  so a new due date moves everything at once.
- **Everything is always there.** You can read week 34 in week 8. The due
  date changes where you land, never what you can see.
- **Everything with a date has a week.** Ahead of today, the timeline is the
  plan; behind today, the diary; by the birth, the story of the pregnancy,
  without anyone having sat down to write it.
- **A thread, not a shelf.** A week's detail is Home's: every week's
  line opens Home at that week.
- **Expecting knows what to do; you don't fill it in.** The weeks carry no
  add box. An own task for the odd thing Expecting couldn't know is added
  in the Planner, and shows on its week like any other.
- **Quietly.** A week's line says what happened in a few words ("felt
  moving", "sick 3 days", "scan", "result") and a faint dot a feeling,
  never names, pictures or counts that read as a grade.

## What's on it

- **The strip,** as on Home, with the landmarks named: a bar a week,
  the weeks behind tinted, this one solid, a dot under each week ahead
  with something best done by then. A week goes to Home at it.
- **The weeks:** each its note's title or a landmark (Halfway, Full term,
  Due date), with what opens, what's to do or has slipped, what's done, the
  questions asked there, and the Journal's marks. Today is marked, with a
  Today button on a phone. Grouped by trimester (three columns on a
  desktop). `?at=28` opens at a week: Home's peek and a Library
  entry's "See week 28 in the whole pregnancy" link this way.

## While something has happened

Paused at the week it happened: the weeks are put away, with their marks,
and come back as they were.

## Not yet

- **The phases before and after the pregnancy:** getting ready (private
  cover's 12-month wait, folate), the birth, and the weeks after it,
  counted from the birth date. The first version is the pregnancy alone.
  With three phases the timeline may earn a tab again.
- **The named chapters** people think in (the early weeks, the middle, the
  home stretch, any day now), in place of the trimesters.
- **A way from a week to the Journal at it.** The week's line already opens
  Home, and a second link inside it isn't possible, so it wants its
  own design.
