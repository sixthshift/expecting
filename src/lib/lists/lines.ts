// A list's lines: the built-in ones from the Library, and your own beside
// them. Each has a state, set by either of you, or none: still to get. Any
// line can hold a few words.

import type { Item, Line } from "../../content/schema";
import { applies, type Facts } from "../../features/settings/model/facts";

/** A line's state once marked; no mark is still to get. */
export const LINE_STATES = ["arranged", "got", "not-needed"] as const;

export type LineState = (typeof LINE_STATES)[number];

/** How a line was got, once it is. */
export const HOWS = { bought: "Bought", borrowed: "Borrowed", hired: "Hired", "second-hand": "Second hand", given: "Given" } as const;

export type How = keyof typeof HOWS;

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
