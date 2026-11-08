import type { ISODate } from "../../dates";
import { placeInSentence } from "../../labels";
import { type FirstMark, firstOf, firstsOffered } from "../firsts";
import { anyLately, list, type Summary } from "./summary";

/** Firsts: how many of them are kept, the latest, and what's still to come. Null with none kept. */
export function firstsSummary(marks: readonly FirstMark[], knowing: boolean, today: ISODate, dueDate: ISODate | null): Summary | null {
  const kept = [...marks].sort((a, b) => a.day.localeCompare(b.day));
  if (kept.length === 0) return null;
  const offered = firstsOffered(knowing);
  const latest = kept.at(-1)!;
  const lines = [`The latest: ${firstOf(latest.key).title.toLowerCase()}, ${placeInSentence(latest.day as ISODate, dueDate)}.`];
  const toCome = offered.filter((f) => !marks.some((m) => m.key === f.key));
  if (toCome.length > 0 && toCome.length <= 3) lines.push(`Still to come: ${list(toCome.map((f) => f.title.toLowerCase()))}.`);
  return {
    headline: `${kept.length} of ${offered.length} kept`,
    lines,
    lately: anyLately(
      kept.map((m) => m.day),
      today
    ),
  };
}
