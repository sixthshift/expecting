# The Journal

What happens, kept and given back. What it does and why is
[`docs/product/journal.md`](../../../docs/product/journal.md); this is the map
of the code.

## Words

The Journal is the same things two ways: **the story**, everything by time,
and **the collections**, everything by what it is.

| Word | Means | Where |
|---|---|---|
| **line** | One line of the story: a note, a day's movements, a photo, a first, a task done… (`StoryItem`) | `src/lib/journal/story/items.ts` |
| **view** | A way to look at the story, all by time: days, weeks, the whole pregnancy. `?view=` on `/journal`. | `src/lib/journal/story/views.ts` |
| **collection** | One sort of thing kept: movements, sickness & cravings (`appetite`), feelings, papers, notes & letters, photos, firsts. `/journal/collections`, and one in full at `/journal/collections/<name>`. What was done, the night it started, a week's question and bingo are lines, but in no collection. | `src/lib/journal/story/collections.ts` |
| **summary** | A collection's short answer at its top ("10 of the last 14 days") and the lines behind it. | `src/lib/journal/summaries/` |
| **quiet** | Something has happened (a loss, hard news): the quiet Journal, which folds away what's about the baby. Not "a week with nothing kept": that's **empty**. | `src/lib/quiet.ts`, `src/lib/journal/quiet.ts` |

## From the store to the screen

```
queries (journal, appetite, photos, papers, feelings, firsts, ticks, …)
  → storyItems()            the lines, newest first            lib/journal/story/items.ts
  → useStoryItems()         over the queries, kept the same    hooks/
  → JournalPageProvider     built once for the page            contexts/
  → useStoryView()          the view open                      hooks/
  → the view's component    days, weeks, the whole pregnancy   components/story/
  → StoryList / Day         weeks, days                        components/lines/
  → StoryLine               one line, by its kind              components/lines/
```

The collections read the queries too: `lib/journal/summaries/` turns each into its
answer, `components/collections/Collections.tsx` draws the overview, and each
kind's feature draws its own in full (`features/<kind>/components/collection/`).

## Where things are

```
pages/          JournalPage (the story, in JournalPageProvider), CollectionsPage,
                CollectionPage, BookPage (the book); the route draws the quiet twin instead
routes/         journal (/journal, a path only), story (its index, ?view= ?at=),
                collections (a path, and the loader its pages share) over collectionsIndex
                and collection ($name), book; index.ts, journalRoutes
contexts/       JournalPageContext: the story's lines
hooks/          useStoryItems (the story, over the queries), useStoryView, useStorySearch,
                useScrollToWeek, useOpenWeek, useBook (and the cover's words, useCover), useOnThisPhone,
                useCollectionCards (the collections' cards, each with its summary), useShowAll
model/labels.ts the Journal's words: a photo's title, who kept it and who changed it, a week's title
components/
  JournalTabs   Story, Collections and Book, as tabs in the bar at the top of every page on a phone
                (PillarLayout's `tabs`, BarTabs)
  story/        the story: JournalStory, StoryViews (its controls and search, and the view
                open, for both worlds), JournalDays; views/weeks/ (WeeksView, Tile) and
                views/pregnancy/ (PregnancyView), the story zoomed out
  thisWeek/     what's to keep now: KeepNow (the firsts around now and the places ready, drawn
                here and on Home), firsts/ (AroundNow, AlreadyHappened, AroundNowFirst),
                places/ (Places), and Calls (here and on Home)
  lines/        a file per kind of line, Day (with `margin`, the diary's on a desktop: its marks
                on the right), StoryList; parts.tsx is what lines are made of
  collections/  the overview: Collections, Group, CollectionCard
  book/         the cover and contents, the recaps, a chapter (ChapterPage, WeeksWritten)
  (loose)       what the features' forms and cards share: KeptCard (one kept, to change or
                delete), UntilDone (a call kept on screen), ChangeOrDelete (a photo's or paper's,
                asked first), WhenFields and DayField, Pick (the camera or the picker)
quiet/          the quiet Journal, while something has happened (below)
desktop/        JournalRail: the story, the collections and the book, down the left of each page
                on a desktop, in both worlds (JournalTabs is a phone's)
mobile/         KeepNowFold: what's to keep now folded to a line above the story on a phone
features/       a feature per kind kept: appetite, feelings, firsts, movements, notes,
                papers, photos. Each has its forms and rows loose in components/ (the "+"
                and other pillars use these) and its collection in full, components/collection/
                (sickness/ and cravings/ for appetite's); a paper opened is PaperViewer, its
                parts in viewer/, and its change model/change.ts (a check-in's too, with
                feelings/hooks/useKeepStep); photos/quiet/ is the
                photos' own quiet part (QuietAddPhoto)
```

How days and weeks are said ("Thu 29", "Week 28", "27 Oct – 2 Nov") is
`src/lib/labels.ts`, for every page.

## While something has happened

The quiet Journal is a world of its own, mirroring the Journal: a loss or
hard news (`src/lib/quiet.ts`) turns it over, and nothing in the Journal's own
world checks for it. See [`docs/product/journal.md`](../../../docs/product/journal.md),
While something has happened.

```
quiet/pages/        QuietJournalPage (the story as kept, and what's folded), QuietBookPage (only a line)
quiet/contexts/     QuietJournalPageContext: what has happened, the lines that stay, the ones folded
quiet/components/   QuietStory (the lines that stay), KeptBefore (what's folded, behind one line)
features/photos/quiet/components/  QuietAddPhoto (the one way to add a photo, while quiet: the album's and KeptBefore's)
```

- **The route chooses.** `routes/story.ts` and `routes/book.ts` name
  each world's page through `worlds()` (`src/app/features/quiet/worlds.tsx`);
  no page asks. Each page takes its own provider inside itself
  (`QuietJournalPage` its `QuietJournalPageProvider`, which reads the kind
  through `useQuietKind`). `JournalPageContext` doesn't carry quiet. No URL
  changes.
- **The rules are one file**, `src/lib/journal/quiet.ts`: what folds away
  (`foldedWhileQuiet`, `FOLDED_WHILE_QUIET`), what a photo can be
  (`kindsOffered`), who to talk to (`QUIET_SUPPORT`), and the papers after a
  loss (`QUIET_PAPERS`: no topics, nothing handy, the collection's lead).
- **Parts both worlds draw** (the collections, a day's photos, a paper's form,
  a check-in) read neither world's context: they ask
  `useQuietKind()` (`src/app/features/quiet/hooks/`), or take it as a prop.

## Adding a kind of line

1. Add it to `StoryItem` and build its lines in `storyItems` (`lib/journal/story/items.ts`).
2. Put it in a collection, or none, in `COLLECTION_OF` (`lib/journal/story/collections.ts`);
   say what it's found by in `storyText` (`lib/journal/story/search.ts`).
3. Draw it: `components/lines/<Kind>Line.tsx`, and a case in `StoryLine`.

Steps 2 and 3 can't be forgotten: `COLLECTION_OF`, `storyText` and `StoryLine`
are over every kind, so TypeScript stops until each has the new one.
