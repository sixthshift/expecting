import { getRouteApi } from "@tanstack/react-router";
import { createContext, type ReactNode, use, useMemo, useState } from "react";
import { useAppetiteQuery } from "../../../api/rpc/appetite";
import { useBingoQuery } from "../../../api/rpc/bingo";
import { useChecklistQuery } from "../../../api/rpc/checklist";
import { useExtrasQuery } from "../../../api/rpc/extras";
import { useFeelingsQuery } from "../../../api/rpc/feelings";
import { useFirstsQuery } from "../../../api/rpc/firsts";
import { useItsTimeQuery } from "../../../api/rpc/itsTime";
import { useJournalQuery } from "../../../api/rpc/journal";
import { usePapersQuery } from "../../../api/rpc/papers";
import { usePhotosQuery } from "../../../api/rpc/photos";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { useWeeklyQuery } from "../../../api/rpc/weekly";
import { useKeepSame } from "../../../app/hooks/useKeepSame";
import { moments } from "../../../lib/bingo";
import { todayISO } from "../../../lib/dates";
import { extrasOn } from "../../../lib/extras";
import type { QuietKind } from "../../../lib/quiet";
import { type Lens, lensesKept, type StoryItem, storyItems } from "../../../lib/story";
import { pairs } from "../../../lib/weekly";
import { useTasks } from "../../tasks/hooks/useTasks";
import { type HighlightsData, useHighlights } from "../hooks/useHighlights";

const route = getRouteApi("/app/journal");

/**
 * The Journal's context: its state, what must be worked out once, and what
 * several parts must agree on. What only one part needs, that part works
 * out (the quiet story's lines, what's folded away, whether the week draws
 * its days).
 */
export type JournalPage = {
  /** What has happened, or null: which page draws it (`Journal` or `QuietJournal`). */
  quiet: QuietKind | null;
  /** The story: everything kept, and what was done, newest first: `storyItems` over the queries, built once. */
  items: StoryItem[];
  /** The lens open (`?show=`, or all when it has nothing), and the lenses there's something in (while quiet, not the folded kinds). */
  lens: Lens;
  lenses: Lens[];
  /** What matters now and the patterns there's enough for: while quiet, no Now cards and only feelings' pattern. */
  highlights: HighlightsData;
};

/** The words the story is searched with, and their setter. */
export type JournalSearch = { words: string; setWords: (words: string) => void };

// Two contexts, so typing in the search draws again only what reads the words (the story, the week so far), not the highlights or the layout.
const PageContext = createContext<JournalPage | null>(null);
const SearchContext = createContext<JournalSearch | null>(null);

/**
 * The Journal's context: its data layer, what its pages draw, worked out
 * once. It holds no data of its own: the queries stay in the query cache,
 * read through their hooks. The story is built here once, for the parts
 * that read it; the lens is worked out here, as the story and the week so
 * far must agree on it; `useHighlights` is called here and nowhere else, as
 * it marks the Journal seen and keeps when you last looked. What's drawn
 * from it is the page's: `Journal`, or while something has happened
 * `QuietJournal`.
 */
export function JournalPageProvider({ children }: { children: ReactNode }) {
  const { show } = route.useSearch();
  // The story: everything kept, and what was done, newest first, built once for the page.
  const { data: journal } = useJournalQuery();
  const { data: appetite } = useAppetiteQuery();
  const { data: photos } = usePhotosQuery();
  const { data: papers } = usePapersQuery();
  const { data: feelings } = useFeelingsQuery();
  const { data: firsts } = useFirstsQuery();
  const { data: checklist } = useChecklistQuery();
  const { data: itsTime } = useItsTimeQuery();
  const { data: weekly } = useWeeklyQuery();
  // A question a week's answers, while its extra is on: turned off, they're hidden, not deleted.
  const { data: asking } = useExtrasQuery({ select: (e) => extrasOn(e).has("question-a-week") });
  const { data: bingo } = useBingoQuery();
  const { data: playing } = useExtrasQuery({ select: (e) => extrasOn(e).has("pregnancy-bingo") });
  const tasks = useTasks();
  const built = useMemo(
    () =>
      storyItems({
        journal,
        appetite,
        photos,
        papers,
        feelings,
        firsts,
        ticks: checklist.ticks,
        titles: new Map(tasks.map((t) => [t.id, t.title])),
        starts: itsTime.starts,
        weekly: asking ? pairs(weekly, (at) => todayISO(new Date(at))) : [],
        bingo: playing ? moments(bingo.cards) : [],
      }),
    [journal, appetite, photos, papers, feelings, firsts, checklist.ticks, tasks, itsTime.starts, weekly, asking, bingo, playing]
  );
  // Rebuilt in full on any change: the lines that didn't change are kept as they were, so their days aren't drawn again.
  const items = useKeepSame(built);
  const { data: quietNow } = useQuietQuery();
  const quiet = quietNow?.kind ?? null;
  const lenses = useMemo(() => lensesKept(items, quiet !== null), [items, quiet]);
  const lens = show && lenses.includes(show) ? show : "all";
  const highlights = useHighlights(items, quiet !== null);
  const [words, setWords] = useState("");

  const page = useMemo(() => ({ quiet, items, lens, lenses, highlights }), [quiet, items, lens, lenses, highlights]);
  const search = useMemo(() => ({ words, setWords }), [words]);

  return (
    <PageContext value={page}>
      <SearchContext value={search}>{children}</SearchContext>
    </PageContext>
  );
}

/** What the Journal's pages draw, inside `JournalPageProvider`. */
export function useJournalPage(): JournalPage {
  const page = use(PageContext);
  if (!page) throw new Error("useJournalPage must be called inside JournalPageProvider");
  return page;
}

/** The story's search words, inside `JournalPageProvider`. */
export function useJournalSearch(): JournalSearch {
  const search = use(SearchContext);
  if (!search) throw new Error("useJournalSearch must be called inside JournalPageProvider");
  return search;
}
