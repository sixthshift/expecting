// The story zoomed out to weeks: a tile a week under its trimester. A week
// opens the story at it.

import { useNow, useSettingsQuery } from "../../../../../../api/rpc/settings";
import type { StoryItem } from "../../../../../../lib/journal/story/items";
import { weekTiles } from "../../../../../../lib/journal/story/zoom";
import { TRIMESTERS } from "../../../../../../lib/timeline";
import { useOpenWeek } from "../../../../hooks/useOpenWeek";
import { Tile } from "./Tile";

/** The story zoomed out to weeks: a tile a week, newest first, under its trimester. Needs a due date (the view isn't offered without one). */
export function WeeksView({ items }: { items: readonly StoryItem[] }) {
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  const now = useNow();
  const onOpen = useOpenWeek();
  if (!dueDate) return null;
  const tiles = weekTiles(items, dueDate, now);
  return (
    <div className="flex flex-col gap-6">
      {[...TRIMESTERS].reverse().map((t) => {
        const these = tiles.filter((tile) => tile.week >= t.from && tile.week <= t.to);
        if (these.length === 0) return null;
        return (
          <section key={t.key} aria-label={t.title} className="flex flex-col gap-2">
            <h3 className="font-display text-base font-semibold text-fg-strong">{t.title}</h3>
            <ol className="grid grid-cols-4 gap-2 sm:grid-cols-6 desktop:grid-cols-7">
              {these.map((tile) => (
                <Tile key={tile.week} tile={tile} now={now} onOpen={onOpen} />
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
