import { useMemo } from "react";
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
import { useWeeklyQuery } from "../../../api/rpc/weekly";
import { useKeepSame } from "../../../app/hooks/useKeepSame";
import { todayISO } from "../../../lib/dates";
import { moments } from "../../../lib/drawer/bingo";
import { extrasOn } from "../../../lib/extras";
import { pairs } from "../../../lib/home/weekly";
import { type StoryItem, storyItems } from "../../../lib/journal/story/items";
import { useTasks } from "../../planner/features/tasks/hooks/useTasks";

/**
 * The story: everything kept, and what was done, newest first: `storyItems`
 * over the queries. Built once by whichever page draws it: the Journal's
 * context, the quiet Journal's, and the book.
 */
export function useStoryItems(): StoryItem[] {
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
  return useKeepSame(built);
}
