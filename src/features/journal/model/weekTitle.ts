import { weekNotes } from "../../../content";
import { noteFor } from "../../../content/weeks";
import type { Week } from "../../../lib/timeline";

/** A week's own note's title: "Halfway". */
export function weekTitle(week: Week): string | null {
  const note = noteFor(weekNotes, week);
  return note?.week === week ? note.title : null;
}
