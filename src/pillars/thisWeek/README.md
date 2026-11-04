# This week

Home, `/`: where you are and what matters now. What it does and why is
[`docs/product/this-week.md`](../../../docs/product/this-week.md); this is the
map of the code. The whole pregnancy at once, `/timeline`, is
`src/pillars/thisWeek/features/timeline/`.

## Words

| Word | Means | Where |
|---|---|---|
| **week** | A pregnancy week, 1–42: the week shown, this one or a peek's. | `src/lib/timeline.ts` |
| **now** | This week, worked out from the due date on read (`useNow`, `usePosition`); none until there's a due date. | `src/api/rpc/settings.ts` |
| **peek** | Looking at another week: `/?at=29`. This week is plain `/`, so it's the URL you'd share. | `timelineSearch`, `features/timeline/routes/timeline.ts` |
| **"that week"** | How a peek's headings say the week ("Asked that week"); now, "this week". | `model/labels.ts` (`whichWeek`) |
| **the note** | The week's note, `content/weeks/<week>.md`: The baby, Your body, For the partner. Now, the one in force carries on until the next; a peek shows only that week's own. | `src/content/weeks.ts` |
| **day reads** | A read for each day after the note, +1 to +6, `content/days/<week>/<day>.md`, out a day at a time (`readsOut`). With the note, one carousel: the day by day. | `src/content/days.ts` |
| **the week's question** | A question a week, while its extra is on: answered on each phone, shown side by side once both have. | `src/lib/thisWeek/weekly.ts` |
| **quiet** | Something has happened (a loss, hard news): no week, no size, no countdown, support and the next steps instead (`QuietThisWeekPage`). | `src/lib/quiet.ts`, `src/lib/thisWeek/quiet.ts` |

## From the store to the screen

```
settings, ?at=          the due date, the week peeked at
  → ThisWeekPage          the provider and the layout (the route draws  pages/
                          QuietThisWeekPage while quiet)
  → ThisWeekPageProvider  the week shown, now, peeking, where you are,  contexts/
                          today, the week's note, worked out once
  → each part             reads the context, and its own queries         components/
                          through their hooks (tasks, items, questions,
                          appointments, journal, …), working out what
                          only it needs
```

## Where things are

```
pages/            ThisWeekPage: ThisWeekPageProvider around ThisWeekMobile or ThisWeekDesktop (useLayout)
mobile/           components/ThisWeekMobile: one column, the doing first, the week's reads between its runs
desktop/          components/ThisWeekDesktop: Now | The week, Now the larger share and labelled
                  by pillar (To do, from the Planner; To keep, for the Journal), the week with
                  where you are and To read, from the Library; DayTabs: the day by day as tabs
hooks/            useWeekDays: the week's days (its note, a read a day), for DayByDay and DayTabs
routes/           thisWeek (/, ?at=); index.ts, thisWeekRoutes, with the timeline's beside it
                  (features/timeline/routes/, not under /)
contexts/         ThisWeekPageContext: the week shown and where you are
model/            labels.ts ("this week" / "that week"), sizeIcons.ts (the size's drawings)
components/
  Part            one part in its column, dropped when it draws nothing
  header/         WeekHeader (Hero, or "This week" and the welcome), Hero (the week's heading, the size, the strip), NowLine, WeekStepper
  dayByDay/       DayByDay, the note and the day reads in one carousel, and a day's Read
  weekNote/       WeekNote, read as whoever holds the phone
  sizeIcon/       SizeIcon, the drawing of what the baby's size is like
  headsUp/        HeadsUp, the week's "Nobody tells you"
  worthKnowing/   WorthKnowing, what starts this week
  week/           TheWeek (WeekReads, WeekKept: each layout places them); a peek's appointments, what was asked, what was kept
  doing/          DoingNow (DoingFirst, DoingAsked, DoingAhead: the phone puts the week between them), or on a peek BestDoneThatWeek
  welcome/        Welcome: no due date yet
quiet/            while something has happened: pages/QuietThisWeekPage, components/Guide
features/
  timeline/       the whole pregnancy at /timeline: TimelinePage, the weeks, the strip; quiet/pages/QuietTimelinePage
  weekly/         the week's question, and the earlier weeks'
```

What other pillars draw here (To do now, Coming up, the check-in, the next
appointment, AskNow, OfferExtra, It's time's way in) stays in its own feature
and reads its own queries. How days and weeks are said ("Week 28", "27 Oct –
2 Nov", "84 days to go") is `src/lib/labels.ts`.

## While something has happened

Quiet is a world of its own: `quiet/` mirrors the pillar's shape
(`quiet/pages/`, `quiet/components/`). The route (`routes/thisWeek.ts`) is
the one place that chooses, `worlds(ThisWeekPage, QuietThisWeekPage)`
(`src/app/features/quiet/worlds.tsx`), with `ThisWeekPageProvider` inside
`ThisWeekPage` only; nothing in the normal world checks quiet. `QuietThisWeekPage` shows the guide's opening words and its parts for
what happened (`Guide`), then the next steps. The timeline's page,
`features/timeline/pages/TimelinePage.tsx`, is chosen the same way, by
`features/timeline/routes/timeline.ts`: `QuietTimelinePage`, the weeks paused at the week it happened
(`features/timeline/quiet/`). The rules (the guide's parts shown,
`QUIET_PARTS`; the week paused at, `pausedAt`; the next steps,
`NEXT_STEPS` and `nextSteps`) are `src/lib/thisWeek/quiet.ts`; what quiet is,
`src/lib/quiet.ts`.

## Adding a section

1. Make it a component in a folder for its part, `components/<part>/`. It
   reads the week from `useThisWeekPage()` and its data through its query's
   hook, works out what it shows, and returns null when there's nothing.
2. Put it in a run, wrapped in `<Part>` (which drops it when it draws
   nothing): with the week (`WeekReads`, `WeekKept`, `components/week/TheWeek.tsx`)
   or with the doing (`DoingFirst`, `DoingAsked`, `DoingAhead`,
   `components/doing/DoingNow.tsx`; on a peek `BestDoneThatWeek`). Each
   layout places them: `ThisWeekMobile` the runs in one column, the doing's
   runs with the week between them; `ThisWeekDesktop` takes their parts apart
   into the board's columns (the doing, the reading, the other things), so a
   new part goes in both.
3. A heading that names the week says it through `whichWeek(peeking)`.
