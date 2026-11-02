// The Journal's own words for what's kept: a photo's title and description,
// who kept something, a week's title. How days and weeks are said is
// src/lib/labels.ts.

import { weekNotes } from "../../../content";
import { noteFor } from "../../../content/weeks";
import type { ISODate } from "../../../lib/dates";
import { placeOf } from "../../../lib/journal";
import { when } from "../../../lib/labels";
import type { Photo, PhotoKind } from "../../../lib/photos";
import type { Week } from "../../../lib/timeline";

/** "Bump photo", "Scan", "Photo". */
export function photoTitle(kind: PhotoKind): string {
  return kind === "bump" ? "Bump photo" : kind === "scan" ? "Scan" : "Photo";
}

/** What it is and when, for a screen reader and a heading: "Scan, week 12, Tue 8 Sep". */
export function describePhoto(photo: Photo, dueDate: ISODate | null): string {
  const place = dueDate ? placeOf(photo.day as ISODate, dueDate) : null;
  return [photoTitle(photo.kind), typeof place === "number" ? `week ${place}` : null, when(photo.day, photo.time), photo.caption].filter(Boolean).join(", ");
}

/**
 * "Kept by Sam", "Kept by you": who held the phone, said so it can't be read
 * as whose it is. Sickness, cravings, movements and photos are about her
 * body or the baby, whoever keeps them, so they never just say a name.
 */
export function keptBy(name: string | null): string | null {
  if (name === null) return null;
  return `Kept by ${name === "You" ? "you" : name}`;
}

/** A week's own note's title: "Halfway". */
export function weekTitle(week: Week): string | null {
  const note = noteFor(weekNotes, week);
  return note?.week === week ? note.title : null;
}
