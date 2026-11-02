// The story zoomed out to the whole pregnancy: weeks 1–42 as one line, the
// firsts as its landmarks, and where you are. A week opens the story at it.

import { useFirstsQuery } from "../../../../../../api/rpc/firsts";
import { useNow, useSettingsQuery } from "../../../../../../api/rpc/settings";
import type { StoryItem } from "../../../../../../lib/journal/story/items";
import { landmarks, weekTiles } from "../../../../../../lib/journal/story/zoom";
import { useOpenWeek } from "../../../../hooks/useOpenWeek";
import { PregnancyLine } from "./PregnancyLine";

/** The whole pregnancy as one line, with the firsts on it as landmarks (`withFirsts`; not on the quiet Journal). Needs a due date. */
export function PregnancyView({ items, withFirsts }: { items: readonly StoryItem[]; withFirsts: boolean }) {
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  const { data: firsts } = useFirstsQuery();
  const now = useNow();
  const onOpen = useOpenWeek();
  if (!dueDate) return null;
  return <PregnancyLine landmarks={withFirsts ? landmarks(firsts, dueDate) : []} tiles={weekTiles(items, dueDate, now)} now={now} onOpen={onOpen} />;
}
