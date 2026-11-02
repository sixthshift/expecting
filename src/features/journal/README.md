# The Journal

What happens, kept and given back. What it does and why is
[`docs/product/journal.md`](../../../docs/product/journal.md); this is the map
of the code.

## Words

The Journal is the same things two ways: **the story**, everything by time
(its tab says Timeline), and **the collections**, everything by what it is.
In code it stays the story: `/timeline` is the whole pregnancy's map.

| Word | Means | Where |
|---|---|---|
| **line** | One line of the story: a note, a day's movements, a photo, a first, a task done… (`StoryItem`) | `src/lib/story/items.ts` |
| **view** | A way to look at the story, all by time: days, weeks, the whole pregnancy. `?view=` on `/journal`. | `src/lib/story/views.ts` |
| **collection** | One sort of thing kept: movements, sickness & cravings (`appetite`), feelings, papers, notes & letters, photos, firsts. `/journal/collections`, and one in full at `/journal/collections/<name>`. What was done, the night it started, a week's question and bingo are lines, but in no collection. | `src/lib/story/collections.ts` |
| **summary** | A collection's short answer at its top ("10 of the last 14 days") and the lines behind it. | `src/lib/summaries.ts` |
| **quiet** | Something has happened (a loss, hard news): the quiet Journal, which folds away what's about the baby. Not "a week with nothing kept": that's **empty**. | `src/lib/quiet.ts` |

## From the store to the screen

```
queries (journal, appetite, photos, papers, feelings, firsts, ticks, …)
  → storyItems()            the lines, newest first            lib/story/items.ts
  → JournalPageProvider     built once for the page            contexts/
  → useStoryView()          the view open                      hooks/
  → the view's component    days, weeks, the whole pregnancy   components/story/
  → StoryList / Day         weeks, days                        components/lines/
  → StoryLine               one line, by its kind              components/lines/
```

The collections read the queries too: `lib/summaries.ts` turns each into its
answer, `components/collections/` draws them, and each in full.

## Where things are

```
pages/          JournalPage (the story, or the quiet one), CollectionsPage, CollectionPage, BookPage
contexts/       JournalPageContext: the story's lines, and whether something has happened
hooks/          useStoryView, useStorySearch, useScrollToWeek, useBook, useOnThisPhone
model/labels.ts the Journal's words: a photo's title, who kept it, a week's title
components/
  JournalFrame  every page's header, Story and Collections, and column
  story/        the Journal's story: JournalStory, its controls and search, JournalDays,
                views/ZoomedOut (weeks, the whole pregnancy)
  thisWeek/     what's to keep now (KeepNow: around now, places, already happened) and the calls
  lines/        a file per kind of line, Day, StoryList; parts.tsx is what lines are made of
  collections/  the overview (Collections), and each collection in full, <name>/
  book/         the cover and contents, the recaps
  quiet/        the quiet Journal's story, and what's folded away
  entries/      each kind's forms and rows; the "+" and other pillars use these
```

How days and weeks are said ("Thu 29", "Week 28", "27 Oct – 2 Nov") is
`src/lib/labels.ts`, for every page.

## Adding a kind of line

1. Add it to `StoryItem` and build its lines in `storyItems` (`lib/story/items.ts`).
2. Put it in a collection, or none, in `COLLECTION_OF` (`lib/story/collections.ts`);
   say what it's found by in `storyText` (`lib/story/search.ts`).
3. Draw it: `components/lines/<Kind>Line.tsx`, and a case in `StoryLine`.

Steps 2 and 3 can't be forgotten: `COLLECTION_OF`, `storyText` and `StoryLine`
are over every kind, so TypeScript stops until each has the new one.
