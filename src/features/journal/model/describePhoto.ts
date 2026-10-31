import type { ISODate } from "../../../lib/dates";
import { placeOf } from "../../../lib/journal";
import type { Photo, PhotoKind } from "../../../lib/photos";
import { when } from "./dates";

/** "Bump photo", "Scan", "Photo". */
export function photoTitle(kind: PhotoKind): string {
  return kind === "bump" ? "Bump photo" : kind === "scan" ? "Scan" : "Photo";
}

/** What it is and when, for a screen reader and a heading: "Scan, week 12, Tue 8 Sep". */
export function describePhoto(photo: Photo, dueDate: ISODate | null): string {
  const place = dueDate ? placeOf(photo.day as ISODate, dueDate) : null;
  return [photoTitle(photo.kind), typeof place === "number" ? `week ${place}` : null, when(photo.day, photo.time), photo.caption].filter(Boolean).join(", ");
}
