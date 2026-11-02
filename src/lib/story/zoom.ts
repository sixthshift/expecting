// The story zoomed out: a tile a week, and the whole pregnancy as one line
// with the firsts on it.

import type { ISODate } from "../dates";
import { type FirstMark, isMarked } from "../firsts";
import { placeOf } from "../journal";
import type { Photo } from "../photos";
import type { Week } from "../timeline";

import type { StoryItem } from "./items";
import { KEPT_KINDS, type KeptKind, keptKindOf } from "./kinds";

/** The trimesters, as weeks. */
export const TRIMESTERS = [
  { key: "first", title: "First trimester", from: 1, to: 13 },
  { key: "second", title: "Second trimester", from: 14, to: 27 },
  { key: "third", title: "Third trimester", from: 28, to: 42 },
] as const;
export type Trimester = (typeof TRIMESTERS)[number];

/** A week zoomed out: its picture (the bump, else any photo), the kinds it has something of, and its firsts. */
export type WeekTile = { week: Week; photo: Photo | null; kinds: KeptKind[]; firsts: FirstMark[]; done: number; empty: boolean };

/** Every week from the first to the last that has anything (at least to `now`), newest first, each a tile; one with nothing is empty. */
export function weekTiles(items: readonly StoryItem[], dueDate: ISODate, now: Week | null): WeekTile[] {
  const byWeek = new Map<Week, StoryItem[]>();
  for (const item of items) {
    const place = placeOf(item.day, dueDate);
    if (typeof place === "number") byWeek.set(place, [...(byWeek.get(place) ?? []), item]);
  }
  const last = Math.max(now ?? 0, ...byWeek.keys());
  const tiles: WeekTile[] = [];
  for (let week = last; week >= 1; week--) {
    const these = byWeek.get(week) ?? [];
    const photos = these.flatMap((i) => (i.kind === "photo" ? [i.photo] : []));
    tiles.push({
      week,
      photo: photos.find((p) => p.kind === "bump") ?? photos[0] ?? null,
      kinds: KEPT_KINDS.filter((k) => these.some((i) => keptKindOf(i) === k)),
      firsts: these.flatMap((i) => (i.kind === "first" ? [i.mark] : [])),
      done: these.filter((i) => i.kind === "done").length,
      empty: these.length === 0,
    });
  }
  return tiles;
}

/** The firsts on the whole pregnancy's line: each at its week, in order. */
export function landmarks(firsts: readonly FirstMark[], dueDate: ISODate): { week: Week; mark: FirstMark & { day: string } }[] {
  return firsts
    .filter(isMarked)
    .flatMap((mark) => {
      const place = placeOf(mark.day as ISODate, dueDate);
      return typeof place === "number" ? [{ week: place, mark }] : [];
    })
    .sort((a, b) => a.week - b.week || a.mark.day.localeCompare(b.mark.day));
}
