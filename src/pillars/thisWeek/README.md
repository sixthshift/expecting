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
| **peek** | Looking at another week: `/?at=29`. This week is plain `/`, so it's the URL you'd share. | `src/routes/search.ts` |
| **"that week"** | How a peek's headings say the week ("Asked that week"); now, "this week". | `model/labels.ts` (`whichWeek`) |
| **the note** | The week's note, `content/weeks/<week>.md`: The baby, Your body, For the partner. Now, the one in force carries on until the next; a peek shows only that week's own. | `src/content/weeks.ts` |
| **day reads** | A read for each day after the note, +1 to +6, `content/days/<week>/<day>.md`, out a day at a time (`readsOut`). With the note, one carousel: the day by day. | `src/content/days.ts` |
| **the week's question** | A question a week, while its extra is on: answered on each phone, shown side by side once both have. | `src/lib/weekly.ts` |
| **quiet** | Something has happened (a loss, hard news): no week, no size, no countdown, support and the next steps instead (`QuietWeek`). | `src/lib/quiet.ts` |

## From the store to the screen

```
settings, ?at=          the due date, the week peeked at
  → ThisWeekPageProvider  the week shown, now, peeking, where you are,  contexts/
                          today, the week's note, worked out once
  → ThisWeek              QuietWeek, or Week                            pages/
  → each part             reads the context, and its own queries         components/
                          through their hooks (tasks, items, questions,
                          appointments, journal, …), working out what
                          only it needs
```

## Where things are

```
pages/            ThisWeek: the provider, then QuietWeek or Week, and Week's layout (phone `order`, desktop columns)
contexts/         ThisWeekPageContext: the week shown and where you are
model/            labels.ts ("this week" / "that week"), sizeIcons.ts (the size's drawings)
components/
  header/         Hero (the week's heading, the size, the strip), NowLine, WeekStepper
  dayByDay/       DayByDay, the note and the day reads in one carousel, and a day's Read
  weekNote/       WeekNote, read as whoever holds the phone
  sizeIcon/       SizeIcon, the drawing of what the baby's size is like
  headsUp/        HeadsUp, the week's "Nobody tells you"
  worthKnowing/   WorthKnowing, what starts this week
  week/           a peek's appointments, what was asked, what was kept
  doing/          the right column: DoingNow, or on a peek BestDoneThatWeek
  welcome/        Welcome: no due date yet
  quiet/          QuietWeek and its Guide
features/
  timeline/       the whole pregnancy at /timeline: TimelinePage, the weeks, the strip
  weekly/         the week's question, and the earlier weeks'
```

What other pillars draw here (To do now, Coming up, the check-in, the next
appointment, AskNow, OfferExtra, It's time's way in) stays in its own feature
and reads its own queries. How days and weeks are said ("Week 28", "27 Oct –
2 Nov", "84 days to go") is `src/lib/labels.ts`.

## Adding a section

1. Make it a component in a folder for its part, `components/<part>/`. It
   reads the week from `useThisWeekPage()` and its data through its query's
   hook, works out what it shows, and returns null when there's nothing.
2. Put it in `Week` (`pages/ThisWeek.tsx`), in the left column with the week
   or in `DoingNow` / `BestDoneThatWeek` on the right, wrapped in a
   `<div className="order-N empty:hidden lg:order-0">`: `order` places it in
   the phone's one column, and `empty:hidden` drops the wrapper when it
   draws nothing.
3. A heading that names the week says it through `whichWeek(peeking)`.
