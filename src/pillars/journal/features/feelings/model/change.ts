import type { OwnFeeling } from "../../../../../lib/journal/feelings";

/** A check-in as it's saved: what it is now, with `fields` changed. */
export function changeOf(feeling: OwnFeeling, fields: Partial<Pick<OwnFeeling, "step" | "words" | "note">> = {}) {
  const { id, day, time, step, words, note } = feeling;
  return { id, day, time, step, words, note, ...fields };
}
