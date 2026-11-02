// The kinds of thing kept, as the Journal names them: each is a way to look at
// the story (notes, photos, firsts) or a record (movements, sickness and
// cravings, feelings, papers). What was done in the Planner, the night it
// started, a week's question and bingo are lines of the story, but no kind.

import type { StoryItem, StoryKind } from "./items";

export const KEPT_KINDS = ["notes", "movements", "appetite", "photos", "feelings", "papers", "firsts"] as const;
export type KeptKind = (typeof KEPT_KINDS)[number];

export const KEPT_KIND_LABEL: Record<KeptKind, string> = {
  notes: "Notes",
  movements: "Movements",
  appetite: "Sickness & cravings",
  photos: "Photos",
  feelings: "Feelings",
  papers: "Papers",
  firsts: "Firsts",
};

const KIND_OF: Record<StoryKind, KeptKind | null> = {
  note: "notes",
  letter: "notes",
  movements: "movements",
  appetite: "appetite",
  photo: "photos",
  paper: "papers",
  feeling: "feelings",
  first: "firsts",
  done: null,
  night: null,
  question: null,
  bingo: null,
};

/** The kind a line is, or null for one that's no kind (what was done, the night, a question, bingo). */
export function keptKindOf(item: StoryItem): KeptKind | null {
  return KIND_OF[item.kind];
}
