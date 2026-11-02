import type { Paper, PaperChange } from "../../../../../lib/journal/papers";

/** A paper's change: what it is now, with `fields` changed. */
export function changeOf(paper: Paper, fields: Partial<PaperChange> = {}): PaperChange {
  const { id, kind, title, itemId, day, note, handy } = paper;
  return { id, kind, title, itemId, day, note, handy, ...fields };
}
