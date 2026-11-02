import { createContext, type ReactNode, use, useMemo } from "react";
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
import { type StoryItem, storyItems } from "../../../lib/story/items";
import { pairs } from "../../../lib/weekly";
import { useTasks } from "../../tasks/hooks/useTasks";

/**
 * The Journal's context: what must be worked out once. What only one part
 * needs, that part works out (the lens, the quiet story's lines, what's
 * folded away).
 */
export type JournalPage = {
  /** What has happened, or null: which page draws it (`Journal` or `QuietJournal`). */
  quiet: QuietKind | null;
  /** The story: everything kept, and what was done, newest first: `storyItems` over the queries, built once. */
  items: StoryItem[];
};

const PageContext = createContext<JournalPage | null>(null);

/**
 * The Journal's context: its data layer, what its pages draw, worked out
 * once. It holds no data of its own: the queries stay in the query cache,
 * read through their hooks. The story is built here once, and whether
 * something has happened decides which page draws it: `Journal`, or
 * `QuietJournal`. KeptBefore reads the story too, beside the quiet one.
 */
export function JournalPageProvider({ children }: { children: ReactNode }) {
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

  const page = useMemo(() => ({ quiet, items }), [quiet, items]);

  return <PageContext value={page}>{children}</PageContext>;
}

/** What the Journal's pages draw, inside `JournalPageProvider`. */
export function useJournalPage(): JournalPage {
  const page = use(PageContext);
  if (!page) throw new Error("useJournalPage must be called inside JournalPageProvider");
  return page;
}
