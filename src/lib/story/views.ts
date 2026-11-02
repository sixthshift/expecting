// The ways to look at the story, and which there's something for.

import { foldedWhileQuiet, type StoryItem, type StoryKind } from "./items";

/** The ways to look at the story: all of it, or one kind. */
export const LENSES = ["all", "notes", "movements", "appetite", "photos", "feelings", "papers", "firsts"] as const;
export type Lens = (typeof LENSES)[number];

/** The lenses the story offers: ways to read it. The rest (movements, sickness and cravings, feelings, papers) are looked up in the records (`src/lib/records.ts`). */
export const STORY_LENSES = ["all", "notes", "photos", "firsts"] as const satisfies readonly Lens[];
export type StoryLens = (typeof STORY_LENSES)[number];

export const LENS_LABEL: Record<Lens, string> = {
  all: "All",
  notes: "Notes",
  movements: "Movements",
  appetite: "Sickness & cravings",
  photos: "Photos",
  feelings: "Feelings",
  papers: "Papers",
  firsts: "Firsts",
};

const LENS_OF: Record<StoryKind, Lens | null> = {
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

/** The lens a line belongs to; what was done belongs only to All. */
export function lensOf(item: StoryItem): Lens | null {
  return LENS_OF[item.kind];
}

/** The lenses there's something for, in their fixed order: All first, always. While something has happened, not the folded kinds. */
export function lensesKept(items: readonly StoryItem[], quiet: boolean): StoryLens[] {
  const kept = new Set(items.filter((i) => !(quiet && foldedWhileQuiet(i))).map(lensOf));
  return STORY_LENSES.filter((l) => l === "all" || kept.has(l));
}
