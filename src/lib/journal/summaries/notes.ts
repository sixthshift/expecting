import type { ISODate } from "../../dates";
import { dayInSentence, placeInSentence } from "../../labels";
import type { JournalEntry } from "../journal";
import { anyLately, count, type Summary } from "./summary";

/** Notes and letters: how many of each, the last, and since when. Null with none. */
export function notesSummary(journal: readonly JournalEntry[], today: ISODate, dueDate: ISODate | null): Summary | null {
  const written = journal.filter((e) => (e.kind === "note" || e.kind === "letter") && e.day <= today).sort((a, b) => a.day.localeCompare(b.day));
  if (written.length === 0) return null;
  const letters = written.filter((e) => e.kind === "letter").length;
  const notes = written.length - letters;
  const headline = [notes > 0 ? count(notes, "note", "notes") : null, letters > 0 ? count(letters, "letter", "letters") : null].filter(Boolean).join(" · ");
  const lines = [`Last kept ${dayInSentence(written.at(-1)!.day as ISODate, today)}.`, `The first in ${placeInSentence(written[0]!.day as ISODate, dueDate)}.`];
  return {
    headline,
    lines,
    lately: anyLately(
      written.map((e) => e.day),
      today
    ),
  };
}
