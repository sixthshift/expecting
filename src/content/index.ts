// The built-in items, bundled from content/items/*.md so every week reads
// offline, and this week's notes from content/weeks/<week>.md.
// A malformed file throws as this module loads; test/content/content.test.ts
// loads it, so a bad item fails the gate before it reaches a page.

import type { Week } from "../lib/timeline";
import { parseAll } from "./parse";
import type { Item, Task } from "./schema";
import { parseWeeks, type WeekNote } from "./weeks";

const files = import.meta.glob<string>("../../content/items/*.md", { query: "?raw", eager: true, import: "default" });

export const builtInItems: readonly Item[] = parseAll(files).sort(byTimeline);

const weekFiles = import.meta.glob<string>("../../content/weeks/*.md", { query: "?raw", eager: true, import: "default" });

/** This week's note for each week that has one, from content/weeks/<week>.md. */
export const weekNotes: readonly WeekNote[] = parseWeeks(weekFiles).sort((a, b) => a.week - b.week);

export const builtInTasks: readonly Task[] = builtInItems.flatMap((item) => item.tasks);

const taskIds = new Set(builtInTasks.map((t) => t.id));

export function isBuiltInTaskId(id: string): boolean {
  return taskIds.has(id);
}

export function byTimeline(a: Item, b: Item): number {
  return a.from - b.from || a.to - b.to || a.title.localeCompare(b.title);
}

/** Whether `item` applies in `week`. */
export function covers(item: Item, week: Week): boolean {
  return item.from <= week && week <= item.to;
}
