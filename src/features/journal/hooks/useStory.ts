import { useMemo } from "react";
import { useAppetite } from "../../../api/rpc/appetite";
import { useChecklist } from "../../../api/rpc/checklist";
import { useFeelings } from "../../../api/rpc/feelings";
import { useFirsts } from "../../../api/rpc/firsts";
import { useJournal } from "../../../api/rpc/journal";
import { usePapers } from "../../../api/rpc/papers";
import { usePhotos } from "../../../api/rpc/photos";
import { useKeepSame } from "../../../app/hooks/useKeepSame";
import { type StoryItem, storyItems } from "../../../lib/story";
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
      }),
    [journal, appetite, photos, papers, feelings, firsts, checklist.ticks, tasks]
  );
  // Rebuilt in full on any change: the lines that didn't change are kept as they were, so their days aren't drawn again.
  return useKeepSame(items);
}
