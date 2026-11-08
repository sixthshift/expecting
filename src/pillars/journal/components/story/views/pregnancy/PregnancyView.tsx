// The story zoomed out to the whole pregnancy: weeks 1–42 as one line, the
// firsts as its landmarks, and where you are. A week opens the story at it.

import { Star } from "lucide-react";
import { useFirstsQuery } from "../../../../../../api/rpc/firsts";
import { useNow, useSettingsQuery } from "../../../../../../api/rpc/settings";
import { firstOf } from "../../../../../../lib/journal/firsts";
import type { StoryItem } from "../../../../../../lib/journal/story/items";
import { landmarks as landmarksOf, weekTiles } from "../../../../../../lib/journal/story/zoom";
import { WEEKS, type Week, weekLabel } from "../../../../../../lib/timeline";
import { useOpenWeek } from "../../../../hooks/useOpenWeek";

/** The whole pregnancy as one line, with the firsts on it as landmarks (`withFirsts`; not on the quiet Journal), and where you are. Needs a due date. */
export function PregnancyView({ items, withFirsts }: { items: readonly StoryItem[]; withFirsts: boolean }) {
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  const { data: firsts } = useFirstsQuery();
  const now = useNow();
  const onOpen = useOpenWeek();
  if (!dueDate) return null;
  const landmarks = withFirsts ? landmarksOf(firsts, dueDate) : [];
  const tiles = weekTiles(items, dueDate, now);
  const kept = new Set(tiles.filter((t) => !t.empty).map((t) => t.week));
  const at = (week: Week) => `${((week - WEEKS.first) / (WEEKS.last - WEEKS.first)) * 100}%`;
  return (
    <figure className="flex flex-col gap-4">
      <div className="relative mx-2 mt-2 h-10">
        <div aria-hidden className="absolute top-4 right-0 left-0 h-1 rounded-full bg-bg-subtle" />
        {now !== null ? <div aria-hidden className="absolute top-4 left-0 h-1 rounded-full bg-fg-brand" style={{ width: at(now) }} /> : null}
        {Array.from({ length: WEEKS.last }, (_, i) => i + 1).map((week) =>
          kept.has(week) ? (
            <button
              key={week}
              type="button"
              onClick={() => onOpen(week)}
              aria-label={`Open ${weekLabel(week).toLowerCase()}`}
              style={{ left: at(week) }}
              className="absolute top-3 size-3 -translate-x-1/2 rounded-full border-2 border-bg-normal bg-fg-brand focus-visible:ring-2 focus-visible:ring-border-focus"
            />
          ) : null
        )}
        {now !== null ? (
          <span style={{ left: at(now) }} className="absolute top-8 -translate-x-1/2 text-xs whitespace-nowrap text-fg-brand">
            You are here
          </span>
        ) : null}
        <span aria-hidden className="absolute -top-2 left-0 text-xs text-fg-subtle">
          1
        </span>
        <span aria-hidden className="absolute -top-2 right-0 text-xs text-fg-subtle">
          42
        </span>
      </div>
      {landmarks.length > 0 ? (
        <ol aria-label="Your firsts" className="flex flex-col gap-1">
          {landmarks.map(({ week, mark }) => (
            <li key={mark.key}>
              <button
                type="button"
                onClick={() => onOpen(week)}
                className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-bg-normal-hovered"
              >
                <Star aria-hidden size={16} className="shrink-0 fill-current text-fg-brand" />
                <span className="w-16 shrink-0 text-xs text-fg-subtle">{weekLabel(week)}</span>
                <span className="text-fg-strong">{firstOf(mark.key).title}</span>
              </button>
            </li>
          ))}
        </ol>
      ) : null}
    </figure>
  );
}
