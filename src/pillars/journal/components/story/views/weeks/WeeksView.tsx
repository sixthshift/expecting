// The story zoomed out to weeks: a tile a week under its trimester. A week
// opens the story at it.

import { useNow, useSettingsQuery } from "../../../../../../api/rpc/settings";
import type { StoryItem } from "../../../../../../lib/journal/story/items";
import { weekTiles } from "../../../../../../lib/journal/story/zoom";
import { useOpenWeek } from "../../../../hooks/useOpenWeek";
import { WeekGrid } from "./WeekGrid";

/** The story zoomed out to weeks: a tile a week, under its trimester. Needs a due date (the view isn't offered without one). */
export function WeeksView({ items }: { items: readonly StoryItem[] }) {
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  const now = useNow();
  const onOpen = useOpenWeek();
  if (!dueDate) return null;
  return <WeekGrid tiles={weekTiles(items, dueDate, now)} now={now} onOpen={onOpen} />;
}
