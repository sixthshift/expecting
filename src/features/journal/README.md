# The Journal

What happens, kept and given back. What it does and why is
[`docs/product/journal.md`](../../../docs/product/journal.md); this is the map
of the code.

## Words

| Word | Means | Where |
|---|---|---|
| **line** | One line of the story: a note, a day's movements, a photo, a first, a task done… (`StoryItem`) | `src/lib/story/items.ts` |
| **kind** | What a line is, as the Journal names it: notes, movements, appetite (sickness & cravings), photos, feelings, papers, firsts (`KeptKind`). What was done, the night it started, a week's question and bingo are lines but no kind. | `src/lib/story/kinds.ts` |
| **view** | A way to look at the story, one at a time: days, weeks, pregnancy, or a kind (notes, photos, firsts). `?view=` on `/journal`. | `src/lib/story/views.ts` |
| **record** | A kind looked up rather than read back: movements, appetite, feelings, papers. Its **summary** is a short answer and the lines behind it. `/journal/records`, and one at `/journal/records/<kind>`. | `src/lib/records.ts` |
| **quiet** | Something has happened (a loss, hard news): the quiet Journal, which folds away what's about the baby. Not "a week with nothing kept": that's **empty**. | `src/lib/quiet.ts` |

## From the store to the screen

```
queries (journal, appetite, photos, papers, feelings, firsts, ticks, …)
  → storyItems()            the lines, newest first            lib/story/items.ts
  → JournalPageProvider     built once for the page            contexts/
  → useStoryView()          the view open, the views kept      hooks/
  → the view's component    days, weeks, pregnancy, a kind     components/story/
  → StoryList / Day         weeks, days                        components/lines/
  → StoryLine               one line, by its kind              components/lines/
```

The records read the queries themselves: `lib/records.ts` turns them into
summaries, `components/records/` draws them.

## Where things are

```
pages/          JournalPage (the story, or the quiet one), RecordsPage, RecordPage, BookPage
contexts/       JournalPageContext: the story's lines, and whether something has happened
hooks/          useStoryView, useStorySearch, useScrollToWeek, useBook, useOnThisPhone
model/labels.ts the Journal's words: a photo's title, who kept it, a week's title
components/
  JournalFrame  every page's header, Story and Records, and column
  story/        the Journal's story: JournalStory, its controls and search, JournalDays,
                views/ (KindView, ZoomedOut, photos/, firsts/)
  thisWeek/     this week's page (WeekPage, places, already happened) and the calls
  lines/        a file per kind of line, Day, StoryList; parts.tsx is what lines are made of
  records/      the overview (Records), and each record at full size, <kind>/
  book/         the cover and contents, the recaps
  quiet/        the quiet Journal's story, and what's folded away
  entries/      each kind's forms and rows; the "+" and other pillars use these
```

How days and weeks are said ("Thu 29", "Week 28", "27 Oct – 2 Nov") is
`src/lib/labels.ts`, for every page.

## Adding a kind of line

1. Add it to `StoryItem` and build its lines in `storyItems` (`lib/story/items.ts`).
2. Give it a kind, or none, in `KIND_OF` (`lib/story/kinds.ts`); say what it's
   found by in `storyText` (`lib/story/search.ts`).
3. Draw it: `components/lines/<Kind>Line.tsx`, and a case in `StoryLine`.

Steps 2 and 3 can't be forgotten: `KIND_OF`, `storyText` and `StoryLine`
are over every kind, so TypeScript stops until each has the new one.
