// A day of the story: the day in the margin, its photos, then its lines. In
// the diary on a desktop, a margin on the right too, for the day's marks:
// the bookkeeping beside the words, which keep the middle.

import { memo, useCallback, useRef, useState } from "react";
import { useQuietKind } from "../../../../app/features/quiet/hooks/useQuietKind";
import type { ISODate } from "../../../../lib/dates";
import type { AppetiteEntry } from "../../../../lib/journal/appetite";
import { kindsOffered } from "../../../../lib/journal/quiet";
import type { StoryItem } from "../../../../lib/journal/story/items";
import type { StoryDay, StoryPart } from "../../../../lib/journal/story/spine";
import { marginDay } from "../../../../lib/labels";
import { PhotoViewer } from "../../features/photos/components/PhotoViewer";

import { AppetiteLine } from "./AppetiteLine";
import { PhotoThumbs } from "./PhotoThumbs";
import { StoryLine } from "./StoryLine";

/** A day's lines, with its sickness on one line and each thing craved on one, however many times. */
function dayLines(items: readonly StoryItem[]): ({ key: string; item: StoryItem } | { key: string; appetite: AppetiteEntry[] })[] {
  const out: ({ key: string; item: StoryItem } | { key: string; appetite: AppetiteEntry[] })[] = [];
  const groups = new Map<string, AppetiteEntry[]>();
  for (const item of items) {
    if (item.kind === "photo") continue;
    if (item.kind !== "appetite") {
      out.push({ key: item.key, item });
      continue;
    }
    const e = item.entry;
    const key = e.kind === "sick" ? "sick" : `${e.kind}:${(e.what ?? "").trim().toLocaleLowerCase("en-AU")}`;
    const group = groups.get(key);
    if (group) group.push(e);
    else {
      const entries = [e];
      groups.set(key, entries);
      out.push({ key: `appetite-${key}-${e.id}`, appetite: entries });
    }
  }
  return out;
}

/**
 * The kinds that are a day's bookkeeping rather than its words: kept in a
 * tap, read at a glance. With a margin, they sit in it; the notes, letters,
 * photos, firsts, papers, answers and the night it started keep the middle.
 */
const MARKS: ReadonlySet<StoryItem["kind"]> = new Set(["movements", "feeling", "done", "appetite", "bingo"]);

/** One of a day's lines, as `dayLines` gives it. */
function Line({ line }: { line: ReturnType<typeof dayLines>[number] }) {
  return "item" in line ? <StoryLine item={line.item} /> : <AppetiteLine entries={line.appetite} />;
}

/**
 * A day: the day in the margin, its photos large, then its lines. With
 * `margin` (the diary on a desktop), its marks go in a margin on the right,
 * beside its words; a day of only marks keeps its place, its words empty.
 * Drawn again only when it changed.
 */
export const Day = memo(function Day({
  day,
  today,
  onOpenPhoto,
  margin = false,
}: {
  day: StoryDay;
  today: ISODate;
  onOpenPhoto: (id: string) => void;
  margin?: boolean;
}) {
  const photos = day.items.flatMap((i) => (i.kind === "photo" ? [i.photo] : []));
  const lines = dayLines(day.items);
  const isMark = (line: (typeof lines)[number]) => !("item" in line) || MARKS.has(line.item.kind);
  const words = margin ? lines.filter((l) => !isMark(l)) : lines;
  const marks = margin ? lines.filter(isMark) : [];
  return (
    <li
      className={
        margin
          ? "grid grid-cols-[3.25rem_minmax(0,1fr)_15rem] gap-x-3 xl:grid-cols-[3.25rem_minmax(0,1fr)_17rem] xl:gap-x-6"
          : "grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3"
      }
    >
      <h4 className="pt-1.5 text-xs font-medium tracking-wide text-fg-subtle uppercase">{marginDay(day.day, today)}</h4>
      <div className="flex min-w-0 flex-col gap-1">
        {photos.length > 0 ? <PhotoThumbs photos={photos} onOpen={onOpenPhoto} /> : null}
        {words.map((line) => (
          <Line key={line.key} line={line} />
        ))}
      </div>
      {margin ? (
        <aside
          aria-label={`${marginDay(day.day, today)}, marks`}
          className="flex min-w-0 flex-col gap-0.5 border-l border-border-subtle pl-3 text-sm empty:border-transparent"
        >
          {marks.map((line) => (
            <Line key={line.key} line={line} />
          ))}
        </aside>
      ) : null}
    </li>
  );
});

/** Photos, opened from any day of `groups`, one after another. `open` is the same each render, so a day isn't drawn again for it. */
export function usePhotoViewer(groups: readonly StoryPart[]) {
  const quiet = useQuietKind();
  const [viewing, setViewing] = useState<{ ids: string[]; index: number } | null>(null);
  const order = useRef<string[]>([]);
  order.current = groups.flatMap((g) => (g.kind === "group" ? g.days.flatMap((d) => d.items.flatMap((i) => (i.kind === "photo" ? [i.photo.id] : []))) : []));
  const open = useCallback((id: string) => setViewing({ ids: order.current, index: Math.max(0, order.current.indexOf(id)) }), []);
  const viewer = viewing ? <PhotoViewer ids={viewing.ids} index={viewing.index} kinds={kindsOffered(quiet)} onClose={() => setViewing(null)} /> : null;
  return { open, viewer };
}
