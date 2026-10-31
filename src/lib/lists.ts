// The lists: what to get, a list per job (docs/plan-lists.md). The built-in
// lists are LISTS, and their lines come from the Library (an item's `lines`);
// your own lists and lines sit beside them. Each line has a state, set by
// either of you, or none: still to get.

import type { Item, Line } from "../content/schema";
import { applies, type Facts } from "../features/settings/model/facts";

/** A line's state once marked; no mark is still to get. */
export const LINE_STATES = ["arranged", "got", "not-needed"] as const;

export type LineState = (typeof LINE_STATES)[number];

/** How a line was got, once it is. */
export const HOWS = { bought: "Bought", borrowed: "Borrowed", "second-hand": "Second hand", given: "Given" } as const;

export type How = keyof typeof HOWS;

/** What a list calls each state: no mark first. */
type Words = Record<"none" | LineState, string>;

const GET: Words = { none: "To get", arranged: "Arranged", got: "Got", "not-needed": "Not needed" };

type ListDef = {
  title: string;
  /** What it's for, in one sentence. */
  about: string;
  /** Its sections, in order: key to heading. */
  sections: Readonly<Record<string, string>>;
  words: Words;
};

/** The lists Expecting knows, in the order they're shown. */
export const LISTS = {
  baby: {
    title: "For the baby",
    about: "Everything to have ready before the birth.",
    sections: {
      sleep: "Sleep",
      "out-and-about": "Out and about",
      feeding: "Feeding",
      changing: "Changing",
      bathing: "Bathing",
      clothes: "Clothes",
      nursery: "The nursery",
    },
    words: GET,
  },
  "freezer-meals": {
    title: "Freezer meals",
    about: "Cooking ahead, so the first weeks home are fed.",
    sections: { meals: "Meals", pantry: "The pantry", kit: "To freeze them in" },
    words: { none: "Still to do", arranged: "Someone's bringing it", got: "Done", "not-needed": "Not needed" },
  },
} as const satisfies Record<string, ListDef>;

export type ListId = keyof typeof LISTS;

/** A built-in list, by id. */
export function listOf(id: string): ListDef | undefined {
  return Object.hasOwn(LISTS, id) ? LISTS[id as ListId] : undefined;
}

/** A line's mark, as stored: its state, how it was got, a few words, and who set it last. */
export type Mark = { lineId: string; state: LineState; how: How | null; note: string | null; by: string | null; updatedAt: string };

/** A list of your own, as stored. */
export type OwnList = { id: string; title: string; by: string | null; createdAt: string };

/** A line of your own, as stored: on a built-in list or one of your own. */
export type OwnLineRow = { id: string; listId: string; title: string; section: string | null; by: string | null; createdAt: string };

function ownLine(row: OwnLineRow): Line {
  return { id: row.id, title: row.title, listId: row.listId, section: row.section, when: {}, taskId: null, itemId: null, origin: "own" };
}

/** The lines for you: the built-in ones of the items shown whose own `when` fits, then your own, in the order added. */
export function tailorLines(items: readonly Item[], facts: Facts, own: readonly OwnLineRow[]): Line[] {
  return [...items.flatMap((i) => i.lines).filter((l) => applies(l.when, facts)), ...own.map(ownLine)];
}

/** Still to get: not marked, or arranged and not yet here. */
export function isLeft(mark: Mark | undefined): boolean {
  return mark === undefined || mark.state === "arranged";
}

/** A list, as the lists page shows it. */
export type ListSummary = {
  id: string;
  title: string;
  /** What it's for; null for your own. */
  about: string | null;
  origin: "built-in" | "own";
  /** Still to get. */
  left: number;
  /** Every line but the not-needed. */
  total: number;
};

/** The lists there are: each built-in list with a line on it, in LISTS' order, then your own, oldest first. */
export function listsOf(lines: readonly Line[], own: readonly OwnList[], marks: Readonly<Record<string, Mark>>): ListSummary[] {
  const count = (id: string) => {
    const on = lines.filter((l) => l.listId === id && marks[l.id]?.state !== "not-needed");
    return { left: on.filter((l) => isLeft(marks[l.id])).length, total: on.length };
  };
  const builtIn = Object.entries(LISTS)
    .filter(([id]) => lines.some((l) => l.listId === id))
    .map(([id, list]): ListSummary => ({ id, title: list.title, about: list.about, origin: "built-in", ...count(id) }));
  return [...builtIn, ...own.map((l): ListSummary => ({ id: l.id, title: l.title, about: null, origin: "own", ...count(l.id) }))];
}

/** What a list calls its states: a built-in list its own words, yours the usual. */
export function wordsFor(listId: string): Words {
  return listOf(listId)?.words ?? GET;
}

/** Part of a list: a section's heading (null for your own list, which has none) and its lines. */
export type Section = { key: string | null; title: string | null; lines: Line[] };

/**
 * A list's lines by its sections, in order, each with something in it; then
 * your own put in none, under "Also" (or no heading on a list of your own).
 * The not-needed are apart, for the foot.
 */
export function sectionsOf(listId: string, lines: readonly Line[], marks: Readonly<Record<string, Mark>>): { sections: Section[]; notNeeded: Line[] } {
  const on = lines.filter((l) => l.listId === listId);
  const needed = on.filter((l) => marks[l.id]?.state !== "not-needed");
  const list = listOf(listId);
  const sections: Section[] = Object.entries(list?.sections ?? {}).map(([key, title]) => ({ key, title, lines: needed.filter((l) => l.section === key) }));
  const loose = needed.filter((l) => l.section === null || !(list && l.section in list.sections));
  sections.push({ key: null, title: list ? "Also" : null, lines: loose });
  return { sections: sections.filter((s) => s.lines.length > 0), notNeeded: on.filter((l) => marks[l.id]?.state === "not-needed") };
}
