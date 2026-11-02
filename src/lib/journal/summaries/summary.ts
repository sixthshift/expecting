// What each collection says at its top: a short answer, short enough to read
// across a room, and the lines behind it. For the midwife's "since when?",
// "how often?", "is it easing?", and for what's been kept so far. From
// what's kept and nothing else: counts, days and weeks, never "normal",
// never a score, never what's missing (a collection with nothing kept has
// no summary). A file per collection beside this one, which holds what they
// share. See docs/product/journal.md, The collections.

import { addDays, type ISODate } from "../../dates";

/**
 * A collection's summary: the answer (`headline`), what backs it up
 * (`lines`), and whether any of it is from the last fortnight (`lately`):
 * the collections put what's going on now first.
 */
export type Summary = { headline: string; lines: string[]; lately: boolean };

/** How far back "lately" looks, today among them. */
export const LATELY_DAYS = 14;

/** "a, b and c". */
export function list(words: readonly string[]): string {
  return words.length <= 1 ? (words[0] ?? "") : `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;
}

/** "1 note", "24 notes". */
export function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** Whether any of `days` is in the last fortnight. */
export function anyLately(days: readonly string[], today: ISODate): boolean {
  const from = addDays(today, 1 - LATELY_DAYS);
  return days.some((d) => d >= from && d <= today);
}
