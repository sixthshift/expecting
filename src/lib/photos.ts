// Photos and scans: a bump photo a week, the scans, and anything else worth
// a picture, each on its day, kept by either of you and shown to both. The
// picture itself is an upload (./files.ts); this is the record around it.
// Its week is worked out from the due date as it's read, as a note's is.
// See docs/plan-photos-scans.md.

import { type ISODate, todayISO } from "./dates";
import { type Place, placeOf } from "./journal";
import type { QuietKind } from "./quiet";
import type { Week } from "./timeline";

/** What a photo is: the bump, a scan, or something else (the nursery, the first outfit). */
export const PHOTO_KINDS = ["bump", "scan", "other"] as const;
export type PhotoKind = (typeof PHOTO_KINDS)[number];

export const PHOTO_KIND_LABEL: Record<PhotoKind, string> = { bump: "Bump", scan: "Scan", other: "Something else" };

export type Photo = {
  id: string;
  /** The upload it shows (src/lib/files.ts). */
  fileId: string;
  kind: PhotoKind;
  day: string;
  /** HH:MM, if given. */
  time: string | null;
  caption: string | null;
  by: string | null;
  createdAt: string;
  editedBy: string | null;
  editedAt: string | null;
};

/** What a phone sends for a new photo, once its upload is on its way. */
export type PhotoInput = { id: string; fileId: string; kind: PhotoKind; day: string; time: string | null; caption: string | null };

/** What a phone sends to change one: never its picture. */
export type PhotoChange = { id: string; kind: PhotoKind; day: string; time: string | null; caption: string | null };

/** The words as kept: trimmed, and none rather than blank. */
export function tidyCaption(caption: string | null): string | null {
  const words = caption?.trim() ?? "";
  return words.length > 0 ? words : null;
}

/** Newest first: by day, then time (one without a time after the timed ones that day), then when it was kept. */
export function newestFirst<T extends Pick<Photo, "day" | "time" | "createdAt">>(photos: readonly T[]): T[] {
  return [...photos].sort((a, b) => b.day.localeCompare(a.day) || (b.time ?? "").localeCompare(a.time ?? "") || b.createdAt.localeCompare(a.createdAt));
}

/** A run of photos under one heading: a week, before or after the pregnancy, or (with no due date) a month. */
export type PhotoGroup = { key: string; place: Place | null; month: string | null; photos: Photo[] };

/** Photos newest first, under their weeks; by month while there's no due date. */
export function photoGroups(photos: readonly Photo[], dueDate: ISODate | null): PhotoGroup[] {
  const groups: PhotoGroup[] = [];
  for (const photo of newestFirst(photos)) {
    const place = dueDate ? placeOf(photo.day as ISODate, dueDate) : null;
    const month = dueDate ? null : photo.day.slice(0, 7);
    const key = String(place ?? month);
    const last = groups.at(-1);
    if (last?.key === key) last.photos.push(photo);
    else groups.push({ key, place, month, photos: [photo] });
  }
  return groups;
}

/** A week's bump photo: that week's latest. */
export type BumpWeek = { week: Week; photo: Photo };

/**
 * The bump, week by week, first week first: one photo a week (its latest),
 * only weeks of the pregnancy. Empty without a due date: a row of weeks needs
 * weeks.
 */
export function bumpWeeks(photos: readonly Photo[], dueDate: ISODate | null): BumpWeek[] {
  if (!dueDate) return [];
  const byWeek = new Map<Week, Photo>();
  for (const photo of newestFirst(photos.filter((p) => p.kind === "bump"))) {
    const place = placeOf(photo.day as ISODate, dueDate);
    if (typeof place === "number" && !byWeek.has(place)) byWeek.set(place, photo);
  }
  return [...byWeek.entries()].sort(([a], [b]) => a - b).map(([week, photo]) => ({ week, photo }));
}

/**
 * The week whose bump photo is still to take: this week, until one is kept
 * in it. None while something has happened (the row offers nothing then),
 * and none without a due date.
 */
export function bumpToTake(photos: readonly Photo[], { now, dueDate, quiet }: { now: Week | null; dueDate: ISODate | null; quiet: boolean }): Week | null {
  if (quiet || now === null || !dueDate) return null;
  return bumpWeeks(photos, dueDate).some((b) => b.week === now) ? null : now;
}

/** The two weeks side by side opens on: the first bump week and the latest. Null with fewer than two. */
export function sideBySide(weeks: readonly BumpWeek[]): [BumpWeek, BumpWeek] | null {
  return weeks.length >= 2 ? [weeks[0]!, weeks.at(-1)!] : null;
}

/** What a photo can be, as things stand: after a loss never a bump; with hard news, whose pregnancy goes on, anything. */
export function kindsOffered(quiet: QuietKind | null): readonly PhotoKind[] {
  return quiet === "loss" ? ["scan", "other"] : PHOTO_KINDS;
}

/** What a week kept in pictures, for its line on the timeline. */
export type WeekPhotos = { bump: boolean; scans: number; others: number };

export function weekPhotos(photos: readonly Photo[], week: Week, dueDate: ISODate | null): WeekPhotos {
  const inWeek = dueDate ? photos.filter((p) => placeOf(p.day as ISODate, dueDate) === week) : [];
  return {
    bump: inWeek.some((p) => p.kind === "bump"),
    scans: inWeek.filter((p) => p.kind === "scan").length,
    others: inWeek.filter((p) => p.kind === "other").length,
  };
}

/** A week's pictures in words: "bump photo", "2 scans", "1 photo". */
export function weekPhotoWords({ bump, scans, others }: WeekPhotos): string[] {
  return [
    ...(bump ? ["bump photo"] : []),
    ...(scans > 0 ? [scans === 1 ? "scan" : `${scans} scans`] : []),
    ...(others > 0 ? [others === 1 ? "1 photo" : `${others} photos`] : []),
  ];
}

/** When a new photo is taken: the day its camera says, unless that's after today (a camera's clock wrong); else now. */
export function takenOn(exif: { day: ISODate; time: string } | null, now: Date = new Date()): { day: ISODate; time: string; fromPhoto: boolean } {
  const today = todayISO(now);
  if (exif && exif.day <= today) return { ...exif, fromPhoto: true };
  return { day: today, time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`, fromPhoto: false };
}
