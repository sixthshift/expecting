# The timeline

The map: the whole pregnancy at once, weeks 1–42, a line a week, and what
each thing asks of you drawn across its weeks. It's the thread the other
pillars meet on: a Library entry on the week it matters, a task on the week
it's due, a Journal entry on its day. The others are where things live;
the timeline is where they meet.

How it's built is [`architecture.md`](../architecture.md), The timeline;
the week itself is `src/lib/timeline.ts`.

## Why you open it

- **"Where are we in all of it?"** How far along, and what's ahead.
- **"When do we have to…?"** The windows: when something opens, is best
  done by, or closes.
- **"What happened in week 22?"** Behind today it's the diary.

## What it holds to

- **The week is the spine.** Pregnancy weeks are completed weeks of
  gestation, the way midwives count: "28 weeks" runs from 28+0 to 28+6.
  Before week 1 the app reads as week 1; past 42 it stays at 42. The
  current week is worked out from the due date as it's read, never stored,
  so a new due date moves everything at once.
- **Everything is always there.** You can read week 34 in week 8. The due
  date changes where you land, never what you can see.
- **Everything with a date has a week.** Ahead of today, the timeline is
  the plan; behind today, the diary; by the birth, the story of the
  pregnancy, without anyone having sat down to write it.
- **A thread, not a shelf.** Nothing lives only on the timeline, and
  "nobody tells you" isn't a view of it: that would put a shelf onto the
  thread. A week's detail is This week's: every week's line opens This week
  at that week.
- **Expecting knows what to do; you don't fill it in.** The weeks carry no
  add box. An own task for the odd thing Expecting couldn't know is added
  in the Planner, and shows on its week like any other.
- **Quietly.** A week's line says what happened in a few words ("felt
  moving", "sick 3 days", "scan", "result") and a faint dot a feeling,
  never names, pictures or counts that read as a grade.

## What's on it

- **The windows:** each entry that asks something of you, across its
  weeks, as open now, ahead, closed or done, over the trimesters, with
  today as a line. Each opens its entry.
- **The weeks:** each its note's title or a landmark (Halfway, Full term,
  Due date), with what opens, what's to do or has slipped, what's done, the
  questions asked there, and the Journal's marks. Today is marked, with a
  Today button on a phone. Grouped by trimester (three columns on a
  desktop).

## While something has happened

Paused at the week it happened: the weeks and windows are put away, with
their marks, and come back as they were.

## Not yet

- **The phases before and after the pregnancy:** getting ready (private
  cover's 12-month wait, folate), the birth, and the weeks after it,
  counted from the birth date. The first version is the pregnancy alone.
- **The named chapters** people think in (the early weeks, the middle, the
  home stretch, any day now), in place of the trimesters.
- **A way from a week to the Journal at it.** The week's line already opens
  This week, and a second link inside it isn't possible, so it wants its
  own design.
