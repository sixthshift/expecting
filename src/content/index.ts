// The built-in items, bundled from content/<phase>/*.md so every week reads
// offline, and this week's notes from content/weeks/<week>.md. An item's
// folder is its phase: when it matters, not who can read it, since every
// phase's Library has all of them.
// A malformed file throws as this module loads; test/content/content.test.ts
// loads it, so a bad item fails the gate before it reaches a page.

import { compareSlots, type Slot } from "../lib/timeline";
import { parseAll } from "./parse";
import type { Item, Task } from "./schema";
import { parseWeeks, type WeekNote } from "./weeks";

const files = import.meta.glob<string>(["../../content/**/*.md", "!../../content/weeks/**"], { query: "?raw", eager: true, import: "default" });

export const builtInItems: readonly Item[] = parseAll(files).sort(byTimeline);

const weekFiles = import.meta.glob<string>("../../content/weeks/*.md", { query: "?raw", eager: true, import: "default" });

/** This week's note for each week that has one, from content/weeks/<week>.md. */
export const weekNotes: readonly WeekNote[] = parseWeeks(weekFiles).sort((a, b) => compareSlots(a.slot, b.slot));

export const builtInTasks: readonly Task[] = builtInItems.flatMap((item) => item.tasks);

const taskIds = new Set(builtInTasks.map((t) => t.id));

export function isBuiltInTaskId(id: string): boolean {
  return taskIds.has(id);
}

export function byTimeline(a: Item, b: Item): number {
  return compareSlots(a.from, b.from) || compareSlots(a.to, b.to) || a.title.localeCompare(b.title);
}

/** Whether `item` applies at `slot`. */
export function covers(item: Item, slot: Slot): boolean {
  return compareSlots(item.from, slot) <= 0 && compareSlots(slot, item.to) <= 0;
}
