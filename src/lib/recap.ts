// A recap: a stretch of the pregnancy (a trimester, or all of it) given back,
// built from what's there, a part only when it has something. Nobody keeps a
// book; Expecting makes one as you go, and shows it back when a trimester
// ends and at the end.

import { type AppetiteEntry, type Tally, tally } from "./appetite";
import type { ISODate } from "./dates";
import { type FirstMark, isMarked } from "./firsts";
import { type JournalEntry, newestFirst, placeOf } from "./journal";
import type { RecapSpan } from "./journalNow";
import { type BumpWeek, bumpWeeks, type Photo } from "./photos";
import type { StoryItem } from "./story";

export type Recap = {
  span: RecapSpan;
  /** The firsts, in order. */
  firsts: (FirstMark & { day: string })[];
  /** The bump, a photo a week: a flipbook. */
  bump: BumpWeek[];
  scans: Photo[];
  /** What was craved most, from twice. */
  craved: Tally | null;
  /** The firsts with words, each of you's. */
  voices: (FirstMark & { day: string })[];
  letters: JournalEntry[];
  /** What was done, oldest first. */
  done: { title: string; day: ISODate }[];
};

/** Its parts, in the order they're stepped through; only those with something. */
const RECAP_PARTS = ["firsts", "bump", "scans", "craved", "voices", "letters", "done"] as const;
export type RecapPart = (typeof RECAP_PARTS)[number];

/** The recap of `span`: its weeks' firsts, bump, scans, most craved, both voices, letters, and what was done. */
export function recapOf({
  span,
  dueDate,
  firsts,
  photos,
  appetite,
  journal,
  items,
}: {
  span: RecapSpan;
  dueDate: ISODate;
  firsts: readonly FirstMark[];
  photos: readonly Photo[];
  appetite: readonly AppetiteEntry[];
  journal: readonly JournalEntry[];
  items: readonly StoryItem[];
}): Recap {
  const within = (day: string) => {
    const place = placeOf(day as ISODate, dueDate);
    // The whole pregnancy's takes in before and after it too.
    if (typeof place !== "number") return span.key === "whole";
    return place >= span.from && place <= span.to;
  };
  const marked = firsts
    .filter(isMarked)
    .filter((f) => within(f.day))
    .sort((a, b) => a.day.localeCompare(b.day));
  const top = tally(
    appetite.filter((e) => within(e.day)),
    "craving"
  )[0];
  return {
    span,
    firsts: marked,
    bump: bumpWeeks(photos, dueDate).filter((b) => b.week >= span.from && b.week <= span.to),
    scans: photos.filter((p) => p.kind === "scan" && within(p.day)).sort((a, b) => a.day.localeCompare(b.day)),
    craved: top && top.times >= 2 ? top : null,
    voices: marked.filter((f) => f.words.length > 0),
    letters: newestFirst(journal.filter((e) => e.kind === "letter" && within(e.day))).reverse(),
    done: items.flatMap((i) => (i.kind === "done" && within(i.day) ? [{ title: i.title, day: i.day }] : [])).sort((a, b) => a.day.localeCompare(b.day)),
  };
}

/** The parts with something in them, in order. */
export function recapParts(recap: Recap): RecapPart[] {
  return RECAP_PARTS.filter((part) => {
    const value = recap[part];
    return Array.isArray(value) ? value.length > 0 : value !== null;
  });
}

/** Whether there's anything to recap. */
export function hasRecap(recap: Recap): boolean {
  return recapParts(recap).length > 0;
}
