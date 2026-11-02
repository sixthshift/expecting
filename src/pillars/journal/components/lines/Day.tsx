// A day of the story: the day in the margin, its photos, then its lines.

import { memo, useCallback, useRef, useState } from "react";
import { useQuietQuery } from "../../../../api/rpc/quiet";
import type { AppetiteEntry } from "../../../../lib/appetite";
import type { ISODate } from "../../../../lib/dates";
import { marginDay } from "../../../../lib/labels";
import { kindsOffered } from "../../../../lib/photos";
import type { StoryItem } from "../../../../lib/story/items";
import type { StoryDay, StoryPart } from "../../../../lib/story/spine";
import { PhotoViewer } from "../entries/photos/PhotoViewer";

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

/** A day: the day in the margin, its photos large, then its lines. Drawn again only when it changed. */
export const Day = memo(function Day({ day, today, onOpenPhoto }: { day: StoryDay; today: ISODate; onOpenPhoto: (id: string) => void }) {
  const photos = day.items.flatMap((i) => (i.kind === "photo" ? [i.photo] : []));
  return (
    <li className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3">
      <h4 className="pt-1.5 text-xs font-medium tracking-wide text-fg-subtle uppercase">{marginDay(day.day, today)}</h4>
      <div className="flex flex-col gap-1">
        {photos.length > 0 ? <PhotoThumbs photos={photos} onOpen={onOpenPhoto} /> : null}
        {dayLines(day.items).map((line) =>
          "item" in line ? <StoryLine key={line.key} item={line.item} /> : <AppetiteLine key={line.key} entries={line.appetite} />
        )}
      </div>
    </li>
  );
});

/** Photos, opened from any day of `groups`, one after another. `open` is the same each render, so a day isn't drawn again for it. */
export function usePhotoViewer(groups: readonly StoryPart[]) {
  const { data: quiet } = useQuietQuery();
  const [viewing, setViewing] = useState<{ ids: string[]; index: number } | null>(null);
  const order = useRef<string[]>([]);
  order.current = groups.flatMap((g) => (g.kind === "group" ? g.days.flatMap((d) => d.items.flatMap((i) => (i.kind === "photo" ? [i.photo.id] : []))) : []));
  const open = useCallback((id: string) => setViewing({ ids: order.current, index: Math.max(0, order.current.indexOf(id)) }), []);
  const viewer = viewing ? (
    <PhotoViewer ids={viewing.ids} index={viewing.index} kinds={kindsOffered(quiet?.kind ?? null)} onClose={() => setViewing(null)} />
  ) : null;
  return { open, viewer };
}
