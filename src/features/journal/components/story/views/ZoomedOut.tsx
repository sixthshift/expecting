// The story zoomed out. Weeks: a tile a week under its trimester, its bump
// (or a photo), a mark per kind kept, its firsts; a week with nothing is
// faint, never marked as missing. The pregnancy: weeks 1–42 as one line, the
// firsts as its landmarks, and where you are. A week opens the story at it.

import { cn } from "@sixthshift/design-system/utils";
import { getRouteApi } from "@tanstack/react-router";
import { Camera, FileText, Footprints, IceCreamCone, type LucideIcon, NotebookPen, Smile, Star } from "lucide-react";
import { useFirstsQuery } from "../../../../../api/rpc/firsts";
import { useNow, useSettingsQuery } from "../../../../../api/rpc/settings";
import { type FirstMark, firstOf } from "../../../../../lib/firsts";
import type { StoryItem } from "../../../../../lib/story/items";
import { KEPT_KIND_LABEL, type KeptKind } from "../../../../../lib/story/kinds";
import { landmarks, TRIMESTERS, type WeekTile, weekTiles } from "../../../../../lib/story/zoom";
import { WEEKS, type Week, weekLabel } from "../../../../../lib/timeline";
import { Picture } from "../../entries/photos/Picture";

/** Each kind's mark. */
const KIND_ICON: Record<KeptKind, LucideIcon> = {
  notes: NotebookPen,
  movements: Footprints,
  appetite: IceCreamCone,
  photos: Camera,
  feelings: Smile,
  papers: FileText,
  firsts: Star,
};

/** A week zoomed out, opening the story at it. */
function Tile({ tile, now, onOpen }: { tile: WeekTile; now: Week | null; onOpen: (week: Week) => void }) {
  const marks = tile.kinds.filter((k) => k !== "photos");
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(tile.week)}
        aria-label={`${weekLabel(tile.week)}${tile.empty ? ", nothing kept" : `: ${tile.kinds.map((l) => KEPT_KIND_LABEL[l].toLowerCase()).join(", ")}`}`}
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
              const Icon = KIND_ICON[l];
              return <Icon key={l} size={12} className={l === "firsts" ? "fill-current" : undefined} />;
            })}
          </span>
        </span>
      </button>
    </li>
  );
}

/** Weeks, a tile each, newest first, under their trimesters. */
function WeekGrid({ tiles, now, onOpen }: { tiles: readonly WeekTile[]; now: Week | null; onOpen: (week: Week) => void }) {
  return (
    <div className="flex flex-col gap-6">
      {[...TRIMESTERS].reverse().map((t) => {
        const these = tiles.filter((tile) => tile.week >= t.from && tile.week <= t.to);
        if (these.length === 0) return null;
        return (
          <section key={t.key} aria-label={t.title} className="flex flex-col gap-2">
            <h3 className="font-display text-base font-semibold text-fg-strong">{t.title}</h3>
            <ol className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-7">
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

/** The whole pregnancy as one line: the weeks, the firsts on it, and where you are. */
function PregnancyLine({
  landmarks,
  tiles,
  now,
  onOpen,
}: {
  landmarks: readonly { week: Week; mark: FirstMark & { day: string } }[];
  tiles: readonly WeekTile[];
  now: Week | null;
  onOpen: (week: Week) => void;
}) {
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

const route = getRouteApi("/app/journal");

/** Opening a week from a zoomed-out view: the story in days, at that week (`?at=`). */
function useOpenWeek() {
  const navigate = route.useNavigate();
  return (week: Week) => navigate({ search: { at: week } });
}

/** The story zoomed out to weeks: a tile a week, under its trimester. Needs a due date (the view isn't offered without one). */
export function WeeksView({ items }: { items: readonly StoryItem[] }) {
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  const now = useNow();
  const onOpen = useOpenWeek();
  if (!dueDate) return null;
  return <WeekGrid tiles={weekTiles(items, dueDate, now)} now={now} onOpen={onOpen} />;
}

/** The whole pregnancy as one line, with the firsts on it as landmarks (`withFirsts`; not on the quiet Journal). Needs a due date. */
export function PregnancyView({ items, withFirsts }: { items: readonly StoryItem[]; withFirsts: boolean }) {
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  const { data: firsts } = useFirstsQuery();
  const now = useNow();
  const onOpen = useOpenWeek();
  if (!dueDate) return null;
  return <PregnancyLine landmarks={withFirsts ? landmarks(firsts, dueDate) : []} tiles={weekTiles(items, dueDate, now)} now={now} onOpen={onOpen} />;
}
