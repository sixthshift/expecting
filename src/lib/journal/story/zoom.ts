// The story zoomed out: a tile a week, and the whole pregnancy as one line
// with the firsts on it.

import type { ISODate } from "../../dates";
import { placeOf, type Week } from "../../timeline";
import type { FirstMark } from "../firsts";
import type { Photo } from "../photos";
import { COLLECTIONS, type Collection, collectionOf } from "./collections";
import type { StoryItem } from "./items";

/** A week zoomed out: its picture (the bump, else any photo) and the collections it has something in. */
export type WeekTile = { week: Week; photo: Photo | null; collections: Collection[]; empty: boolean };

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
      collections: COLLECTIONS.filter((c) => these.some((i) => collectionOf(i) === c)),
      empty: these.length === 0,
    });
  }
  return tiles;
}

/** The firsts on the whole pregnancy's line: each at its week, in order. */
export function landmarks(firsts: readonly FirstMark[], dueDate: ISODate): { week: Week; mark: FirstMark }[] {
  return firsts
    .flatMap((mark) => {
      const place = placeOf(mark.day as ISODate, dueDate);
      return typeof place === "number" ? [{ week: place, mark }] : [];
    })
    .sort((a, b) => a.week - b.week || a.mark.day.localeCompare(b.mark.day));
}
