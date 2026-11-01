// The lists: what to get, a list per job (docs/product/planner.md). The built-in
// lists are LISTS, and their lines come from the Library (an item's `lines`);
// your own lists and lines sit beside them. Each line has a state, set by
// either of you, or none: still to get. Any line can hold a few words.

import type { Item, Line } from "../content/schema";
import { applies, type Facts } from "../features/settings/model/facts";

/** A line's state once marked; no mark is still to get. */
export const LINE_STATES = ["arranged", "got", "not-needed"] as const;

export type LineState = (typeof LINE_STATES)[number];

/** How a line was got, once it is. */
export const HOWS = { bought: "Bought", borrowed: "Borrowed", hired: "Hired", "second-hand": "Second hand", given: "Given" } as const;

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

export type ListId = keyof typeof LISTS;

/** A built-in list, by id. */
export function listOf(id: string): ListDef | undefined {
  return Object.hasOwn(LISTS, id) ? LISTS[id as ListId] : undefined;
}

/** A line's mark, as stored: its state (none, still to get, with only words), how it was got, a few words, and who set it last. */
export type Mark = { lineId: string; state: LineState | null; how: How | null; note: string | null; by: string | null; updatedAt: string };

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

/** Still to get: no state, or arranged and not yet here. */
export function isLeft(mark: Mark | undefined): boolean {
  return !mark?.state || mark.state === "arranged";
}

/** A list, as the lists page shows it. */
export type ListSummary = {
  id: string;
  title: string;
  /** What it's for; null for your own. */
  about: string | null;
  origin: "built-in" | "own";
  /** Still to get, the arranged among them. */
  left: number;
  /** Arranged: on their way. */
  arranged: number;
  /** Got. */
  got: number;
  /** Every line but the not-needed. */
  total: number;
  /** The first few still to get, in the list's order, for a glance. */
  next: string[];
};

/** How many of what's left a list names at a glance, before "and N more". */
export const PREVIEW = 2;

/** The lists there are: each built-in list with a line on it, in LISTS' order, then your own, oldest first. */
export function listsOf(lines: readonly Line[], own: readonly OwnList[], marks: Readonly<Record<string, Mark>>): ListSummary[] {
  const count = (id: string) => {
    const { sections } = sectionsOf(id, lines, marks);
    const on = sections.flatMap((s) => s.lines);
    const left = on.filter((l) => isLeft(marks[l.id]));
    return {
      left: left.length,
      arranged: on.filter((l) => marks[l.id]?.state === "arranged").length,
      got: on.filter((l) => marks[l.id]?.state === "got").length,
      total: on.length,
      next: left.slice(0, PREVIEW).map((l) => l.title),
    };
  };
  const builtIn = Object.entries(LISTS)
    .filter(([id]) => lines.some((l) => l.listId === id))
    .map(([id, list]): ListSummary => ({ id, title: list.title, about: list.about, origin: "built-in", ...count(id) }));
  return [...builtIn, ...own.map((l): ListSummary => ({ id: l.id, title: l.title, about: null, origin: "own", ...count(l.id) }))];
}

/** The bag's section packed on the night, ticked off on It's time. */
export const LAST_THING = "last";

/** Whether a list is among the Planner's: not one kept apart (the bag). */
export function inPlanner(list: ListSummary): boolean {
  return !isApart(list.id);
}

/** Whether a built-in list is kept apart from the Planner's lists. */
export function isApart(listId: string): boolean {
  const def: ListDef | undefined = listOf(listId);
  return def?.apart === true;
}

/** What a list calls its states: a built-in list its own words, yours the usual. */
export function wordsFor(listId: string): Words {
  return listOf(listId)?.words ?? GET;
}

/** What's left on a list, in its words: "9 to get", "3 still to do". */
export function leftSaying(listId: string, { left, total }: { left: number; total: number }): string {
  if (total === 0) return "Nothing on it yet";
  if (left === 0) return "All sorted";
  return `${left} ${wordsFor(listId).none.toLowerCase()}`;
}

/** Where a list is up to, in a line: "12 of 27 got · 3 on their way". */
export function upToSaying(listId: string, { got, arranged, total }: { got: number; arranged: number; total: number }): string {
  if (total === 0) return "Nothing on it yet";
  const done = `${got} of ${total} ${wordsFor(listId).got.toLowerCase()}`;
  return arranged === 0 ? done : `${done} · ${arranged} on ${arranged === 1 ? "its" : "their"} way`;
}

/** Part of a list: a section's heading (null for your own list, which has none), its lines, and how many are got. */
export type Section = { key: string | null; title: string | null; lines: Line[]; got: number };

/**
 * A list's lines by its sections, in order, each with something in it; then
 * your own put in none, under its heading for them (none on a list of your own).
 * In each, what's left first and what's got after, each in its order; a line
 * got in `stay` (ticked during this visit) keeps its place until the next.
 * The not-needed are apart, for the foot.
 */
export function sectionsOf(
  listId: string,
  lines: readonly Line[],
  marks: Readonly<Record<string, Mark>>,
  stay: ReadonlySet<string> = new Set()
): { sections: Section[]; notNeeded: Line[] } {
  const on = lines.filter((l) => l.listId === listId);
  const needed = on.filter((l) => marks[l.id]?.state !== "not-needed");
  const list = listOf(listId);
  const sinks = (l: Line) => marks[l.id]?.state === "got" && !stay.has(l.id);
  const section = (key: string | null, title: string | null, its: Line[]): Section => ({
    key,
    title,
    lines: [...its.filter((l) => !sinks(l)), ...its.filter(sinks)],
    got: its.filter((l) => marks[l.id]?.state === "got").length,
  });
  const sections = Object.entries(list?.sections ?? {}).map(([key, title]) =>
    section(
      key,
      title,
      needed.filter((l) => l.section === key)
    )
  );
  sections.push(
    section(
      null,
      list?.yours ?? null,
      needed.filter((l) => l.section === null || !(list && l.section in list.sections))
    )
  );
  return { sections: sections.filter((s) => s.lines.length > 0), notNeeded: on.filter((l) => marks[l.id]?.state === "not-needed") };
}
