// The book's chapters: a pregnancy's, by weeks, each with the firsts that
// usually come in it. On the contents page each is begun, now, still to
// come, or passed with nothing kept: the whole shape of what the Journal
// could become, without anyone being told to fill it. The birth is drawn and
// never filled: it comes with the birth, after the first version.

import type { ISODate } from "./dates";
import type { FirstKey } from "./firsts";
import { placeOf } from "./journal";
import type { StoryItem } from "./story";
import type { Week } from "./timeline";

export type Chapter = { key: string; title: string; weeks: [Week, Week] | null; firsts: readonly FirstKey[] };

export const CHAPTERS: readonly Chapter[] = [
  { key: "finding-out", title: "Finding out", weeks: [1, 6], firsts: ["found-out"] },
  { key: "first-scan", title: "The first scan", weeks: [7, 13], firsts: ["first-scan", "heartbeat", "first-craving"] },
  { key: "telling", title: "Telling people", weeks: [14, 17], firsts: ["told-family", "first-outfit"] },
  { key: "halfway", title: "Halfway", weeks: [18, 22], firsts: ["showing", "boy-or-girl"] },
  { key: "moving", title: "Feeling them move", weeks: [23, 27], firsts: ["first-kick", "felt-outside"] },
  { key: "ready", title: "Getting ready", weeks: [28, 36], firsts: ["cot-up"] },
  { key: "last-weeks", title: "The last weeks", weeks: [37, 42], firsts: ["bag-packed", "it-started"] },
  { key: "birth", title: "The birth", weeks: null, firsts: [] },
];

/** The chapter a week is in. */
export function chapterOf(week: Week): Chapter {
  return CHAPTERS.find((c) => c.weeks && week >= c.weeks[0] && week <= c.weeks[1]) ?? CHAPTERS[0]!;
}

type ChapterState = "begun" | "now" | "to-come" | "passed";

/** A chapter on the contents page: how it stands, and how much is in it (kept in its weeks; ticks aside). */
export type ChapterLine = { chapter: Chapter; state: ChapterState; kept: number };

/**
 * Every chapter, in order, as it stands. Begun once anything is kept in its
 * weeks (a first on the day it was); else now (the one you're in), still to
 * come, or passed. The birth is always still to come.
 */
export function contents({ items, dueDate, now }: { items: readonly StoryItem[]; dueDate: ISODate | null; now: Week | null }): ChapterLine[] {
  return CHAPTERS.map((chapter) => {
    const inWeeks = (day: ISODate) => {
      if (!dueDate || !chapter.weeks) return false;
      const place = placeOf(day, dueDate);
      return typeof place === "number" && place >= chapter.weeks[0] && place <= chapter.weeks[1];
    };
    // What's in it is what's on its weeks, a first among them on the day it was marked, as the book draws it.
    const kept = items.filter((i) => i.kind !== "done" && inWeeks(i.day)).length;
    const weeks = chapter.weeks;
    const state: ChapterState = kept > 0 ? "begun" : !weeks || now === null || now < weeks[0] ? "to-come" : now > weeks[1] ? "passed" : "now";
    return { chapter, state, kept };
  });
}

/** While fewer than this many things are kept (ticks aside), the book's cover and contents sit on the page; after, one line. */
const YOUNG_BELOW = 5;

/** Whether the Journal is still young: little kept yet. */
export function young(items: readonly StoryItem[]): boolean {
  return items.filter((i) => i.kind !== "done").length < YOUNG_BELOW;
}
