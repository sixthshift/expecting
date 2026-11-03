// The Journal's collections: everything kept, grouped by what it is. The
// story is everything by time; a collection is one sort of thing, with a
// short answer at the top where one makes sense (`src/lib/journal/summaries/`)
// and every one under it. What was done in the Planner, the night it
// started, a week's question and bingo are lines of the story, but in no
// collection.

import { foldedWhileQuiet } from "../quiet";
import type { StoryItem, StoryKind } from "./items";

/** In the order they're shown. */
export const COLLECTIONS = ["movements", "appetite", "feelings", "papers", "notes", "photos", "firsts"] as const;
export type Collection = (typeof COLLECTIONS)[number];

export const COLLECTION_LABEL: Record<Collection, string> = {
  movements: "Movements",
  appetite: "Sickness & cravings",
  feelings: "Feelings",
  papers: "Papers",
  notes: "Notes & letters",
  photos: "Photos",
  firsts: "Firsts",
};

export function isCollection(name: string): name is Collection {
  return (COLLECTIONS as readonly string[]).includes(name);
}

const COLLECTION_OF: Record<StoryKind, Collection | null> = {
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

/** The collection a line is in, or null for one in none (what was done, the night, a question, bingo). */
export function collectionOf(item: StoryItem): Collection | null {
  return COLLECTION_OF[item.kind];
}

/** The collections there's something in, in their order; while something has happened (`quiet`), not the folded ones. */
export function collectionsKept(items: readonly StoryItem[], quiet: boolean): Collection[] {
  const kept = new Set(items.filter((i) => !(quiet && foldedWhileQuiet(i))).map(collectionOf));
  return COLLECTIONS.filter((c) => kept.has(c));
}
