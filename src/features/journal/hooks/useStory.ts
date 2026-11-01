import { useMemo } from "react";
import { useAppetite } from "../../../api/rpc/appetite";
import { useBingo } from "../../../api/rpc/bingo";
import { useChecklist } from "../../../api/rpc/checklist";
import { useExtras } from "../../../api/rpc/extras";
import { useFeelings } from "../../../api/rpc/feelings";
import { useFirsts } from "../../../api/rpc/firsts";
import { useItsTime } from "../../../api/rpc/itsTime";
import { useJournal } from "../../../api/rpc/journal";
import { usePapers } from "../../../api/rpc/papers";
import { usePhotos } from "../../../api/rpc/photos";
import { useWeekly } from "../../../api/rpc/weekly";
import { useKeepSame } from "../../../app/hooks/useKeepSame";
import { moments } from "../../../lib/bingo";
import { todayISO } from "../../../lib/dates";
import { extrasOn } from "../../../lib/extras";
import { type StoryItem, storyItems } from "../../../lib/story";
import { pairs } from "../../../lib/weekly";
import { useTasks } from "../../tasks/hooks/useTasks";

/** The Journal's story: everything kept, and what was done, newest first, as each of them changes. */
export function useStory(): StoryItem[] {
  const { data: journal } = useJournal();
  const { data: appetite } = useAppetite();
  const { data: photos } = usePhotos();
  const { data: papers } = usePapers();
  const { data: feelings } = useFeelings();
  const { data: firsts } = useFirsts();
  const { data: checklist } = useChecklist();
  const { data: itsTime } = useItsTime();
  const { data: weekly } = useWeekly();
  // A question a week's answers, while its extra is on: turned off, they're hidden, not deleted.
  const { data: asking } = useExtras({ select: (e) => extrasOn(e).has("question-a-week") });
  const { data: bingo } = useBingo();
  const { data: playing } = useExtras({ select: (e) => extrasOn(e).has("pregnancy-bingo") });
  const tasks = useTasks();
  const items = useMemo(
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
  return useKeepSame(items);
}
