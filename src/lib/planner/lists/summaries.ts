// The lists there are, each summed up: what's left, what's got, and the
// first few still to get, and where it's up to in its own words.

import type { Line } from "../../../content/schema";
import { isApart, LISTS, wordsFor } from "./builtIn";
import { isLeft, type Mark, type OwnList } from "./lines";
import { sectionsOf } from "./sections";

/** A list, as the lists page shows it. */
export type ListSummary = {
  id: string;
  title: string;
  /** What it's for; null for your own. */
  about: string | null;
  origin: "built-in" | "own";
  /** Still to get, the arranged among them. */
  left: number;
  /** Arranged: on their way. */
  arranged: number;
  /** Got. */
  got: number;
  /** Every line but the not-needed. */
  total: number;
  /** The first few still to get, in the list's order, for a glance. */
  next: string[];
};

/** How many of what's left a list names at a glance, before "and N more". */
const PREVIEW = 2;

/** The lists there are: each built-in list with a line on it, in LISTS' order, then your own, oldest first. */
export function listsOf(lines: readonly Line[], own: readonly OwnList[], marks: Readonly<Record<string, Mark>>): ListSummary[] {
  const count = (id: string) => {
    const { sections } = sectionsOf(id, lines, marks);
    const on = sections.flatMap((s) => s.lines);
    const left = on.filter((l) => isLeft(marks[l.id]));
    return {
      left: left.length,
      arranged: on.filter((l) => marks[l.id]?.state === "arranged").length,
      got: on.filter((l) => marks[l.id]?.state === "got").length,
      total: on.length,
      next: left.slice(0, PREVIEW).map((l) => l.title),
    };
  };
  const builtIn = Object.entries(LISTS)
    .filter(([id]) => lines.some((l) => l.listId === id))
    .map(([id, list]): ListSummary => ({ id, title: list.title, about: list.about, origin: "built-in", ...count(id) }));
  return [...builtIn, ...own.map((l): ListSummary => ({ id: l.id, title: l.title, about: null, origin: "own", ...count(l.id) }))];
}

/** Whether a list is among the Planner's: not one kept apart (the bag). */
export function inPlanner(list: ListSummary): boolean {
  return !isApart(list.id);
}

/** What's left on a list, in its words: "9 to get", "3 still to do". */
export function leftSaying(listId: string, { left, total }: { left: number; total: number }): string {
  if (total === 0) return "Nothing on it yet";
  if (left === 0) return "All sorted";
  return `${left} ${wordsFor(listId).none.toLowerCase()}`;
}

/** Where a list is up to, in a line: "12 of 27 got · 3 on their way". */
export function upToSaying(listId: string, { got, arranged, total }: { got: number; arranged: number; total: number }): string {
  if (total === 0) return "Nothing on it yet";
  const done = `${got} of ${total} ${wordsFor(listId).got.toLowerCase()}`;
  return arranged === 0 ? done : `${done} · ${arranged} on ${arranged === 1 ? "its" : "their"} way`;
}
