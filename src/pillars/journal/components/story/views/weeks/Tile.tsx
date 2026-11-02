// A week zoomed out: its bump (or a photo), a mark per kind kept, its
// firsts; a week with nothing is faint, never marked as missing.

import { cn } from "@sixthshift/design-system/utils";
import { Camera, FileText, Footprints, IceCreamCone, type LucideIcon, NotebookPen, Smile, Star } from "lucide-react";
import { COLLECTION_LABEL, type Collection } from "../../../../../../lib/journal/story/collections";
import type { WeekTile } from "../../../../../../lib/journal/story/zoom";
import { type Week, weekLabel } from "../../../../../../lib/timeline";
import { Picture } from "../../../../features/photos/components/Picture";

/** Each collection's mark. */
const COLLECTION_ICON: Record<Collection, LucideIcon> = {
  notes: NotebookPen,
  movements: Footprints,
  appetite: IceCreamCone,
  photos: Camera,
  feelings: Smile,
  papers: FileText,
  firsts: Star,
};

/** A week zoomed out, opening the story at it. */
export function Tile({ tile, now, onOpen }: { tile: WeekTile; now: Week | null; onOpen: (week: Week) => void }) {
  const marks = tile.collections.filter((k) => k !== "photos");
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(tile.week)}
        aria-label={`${weekLabel(tile.week)}${tile.empty ? ", nothing kept" : `: ${tile.collections.map((l) => COLLECTION_LABEL[l].toLowerCase()).join(", ")}`}`}
        className={cn(
          "flex w-full flex-col gap-1 rounded-lg border p-1.5 text-left focus-visible:ring-2 focus-visible:ring-border-focus",
          tile.empty ? "border-border-subtle opacity-50" : "border-border-normal hover:bg-bg-normal-hovered",
          tile.week === now && "border-border-brand"
        )}
      >
        {tile.photo ? (
          <Picture fileId={tile.photo.fileId} variant="thumb" alt="" className="aspect-square w-full rounded-md object-cover" />
        ) : (
          <span aria-hidden className="flex aspect-square w-full items-center justify-center rounded-md bg-bg-subtle font-display text-lg text-fg-subtle">
            {tile.week}
          </span>
        )}
        <span className="flex flex-wrap items-center gap-1 text-xs">
          {tile.photo ? <span className="font-medium text-fg-strong">{tile.week}</span> : null}
          <span aria-hidden className="flex flex-wrap gap-0.5 text-fg-brand">
            {marks.map((l) => {
              const Icon = COLLECTION_ICON[l];
              return <Icon key={l} size={12} className={l === "firsts" ? "fill-current" : undefined} />;
            })}
          </span>
        </span>
      </button>
    </li>
  );
}
