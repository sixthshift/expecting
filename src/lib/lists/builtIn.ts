// The lists Expecting knows (docs/product/planner.md): what to get, a list
// for each purpose, each with its sections and its own words for a line's
// states. Their lines come from the Library (an item's `lines`).

import type { LineState } from "./lines";

/** What a list calls each state: no mark first. */
type Words = Record<"none" | LineState, string>;

const GET: Words = { none: "To get", arranged: "Arranged", got: "Got", "not-needed": "Not needed" };

type ListDef = {
  title: string;
  /** What it's for, in one sentence. */
  about: string;
  /** Its sections, in order: key to heading. */
  sections: Readonly<Record<string, string>>;
  /** The heading over your own lines, put in no section. */
  yours: string;
  words: Words;
  /** Kept somewhere else, not among the Planner's lists: the bag is It's time's. */
  apart?: true;
};

/** The lists Expecting knows, in the order they're shown. */
export const LISTS = {
  baby: {
    title: "Before the birth",
    about: "Everything to have ready for the baby, and for you.",
    sections: {
      sleep: "Sleep",
      "out-and-about": "Out and about",
      feeding: "Feeding",
      changing: "Changing",
      bathing: "Bathing",
      clothes: "Clothes",
      "for-you": "For you",
    },
    yours: "Also",
    words: GET,
  },
  "freezer-meals": {
    title: "Freezer meals",
    about: "Cooking ahead, so the first weeks home are fed.",
    sections: { pantry: "The pantry", kit: "To freeze them in" },
    yours: "Meals to make",
    words: { none: "Still to do", arranged: "Someone's bringing it", got: "Done", "not-needed": "Not needed" },
  },
  // It's time's (docs/product/its-time.md): packed ahead, and its last things, the
  // lines that can only go in on the night, ticked off there.
  bag: {
    title: "The bag",
    about: "The hospital bag: packed ahead, and the last things on the night.",
    sections: {
      papers: "Papers",
      "for-her": "For her",
      "for-baby": "For the baby",
      "for-partner": "For the support partner",
      last: "Last thing, on the night",
    },
    yours: "Also",
    words: { none: "To pack", arranged: "Set aside", got: "Packed", "not-needed": "Not needed" },
    apart: true,
  },
} as const satisfies Record<string, ListDef>;

type ListId = keyof typeof LISTS;

/** A built-in list, by id. */
export function listOf(id: string): ListDef | undefined {
  return Object.hasOwn(LISTS, id) ? LISTS[id as ListId] : undefined;
}

/** The bag's section packed on the night, ticked off on It's time. */
export const LAST_THING = "last";

/** Whether a built-in list is kept apart from the Planner's lists. */
export function isApart(listId: string): boolean {
  const def: ListDef | undefined = listOf(listId);
  return def?.apart === true;
}

/** What a list calls its states: a built-in list its own words, yours the usual. */
export function wordsFor(listId: string): Words {
  return listOf(listId)?.words ?? GET;
}
