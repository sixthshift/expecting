// A list's lines by its sections, what's left first, as its page draws it.

import type { Line } from "../../content/schema";
import { listOf } from "./builtIn";
import type { Mark } from "./lines";

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
