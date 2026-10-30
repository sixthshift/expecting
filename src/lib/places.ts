// Places ready: at the moments that matter, Expecting has made a place, and
// says so once, in a sentence; the place itself is the way in. Each from a
// Library entry's weeks. A place goes once it's used, or its weeks pass.
// Never one while something has happened.

import type { ISODate } from "./dates";
import { placeOf } from "./journal";
import type { Paper } from "./papers";
import type { Photo } from "./photos";
import type { Week } from "./timeline";

export type Place = {
  key: string;
  /** The Library entry it's for, whose weeks it takes; null for the bump. */
  itemId: string | null;
  weeks: [Week, Week];
  /** What it's a place for: a scan's picture, a paper about the entry, or a bump series. */
  kind: "scan" | "paper" | "bump";
  says: string;
};

export const PLACES: readonly Place[] = [
  {
    key: "dating-scan",
    itemId: "dating-scan",
    weeks: [6, 13],
    kind: "scan",
    says: "Your dating scan is usually around now. There's a place ready for the picture.",
  },
  {
    key: "morphology-scan",
    itemId: "morphology-scan",
    weeks: [16, 20],
    kind: "scan",
    says: "Your morphology scan is usually around now. There's a place ready for the picture.",
  },
  {
    key: "glucose-tolerance-test",
    itemId: "glucose-tolerance-test",
    weeks: [24, 28],
    kind: "paper",
    says: "There's a place ready for the glucose test's result.",
  },
  {
    key: "bump",
    itemId: null,
    weeks: [12, 40],
    kind: "bump",
    says: "If you'd like a bump series, the same spot each week works best. Expecting lines them up.",
  },
];

/**
 * The places ready now: in their weeks, and not yet used (a scan photo kept
 * in its weeks, a paper about its entry, any bump photo). Never while
 * something has happened, and none without a week.
 */
export function placesReady({
  now,
  photos,
  papers,
  dueDate,
  quiet,
}: {
  now: Week | null;
  photos: readonly Photo[];
  papers: readonly Paper[];
  dueDate: ISODate | null;
  quiet: boolean;
}): Place[] {
  if (quiet || now === null || !dueDate) return [];
  const weekOf = (day: string) => placeOf(day as ISODate, dueDate);
  return PLACES.filter((p) => {
    if (now < p.weeks[0] || now > p.weeks[1]) return false;
    if (p.kind === "bump") return !photos.some((ph) => ph.kind === "bump");
    if (p.kind === "paper") return !papers.some((paper) => paper.itemId === p.itemId);
    return !photos.some((ph) => {
      const w = weekOf(ph.day);
      return ph.kind === "scan" && typeof w === "number" && w >= p.weeks[0] && w <= p.weeks[1];
    });
  });
}
