// The built-in items, bundled from content/*.md so every week reads offline.
// A malformed file throws as this module loads; test/content/content.test.ts
// loads it, so a bad item fails the gate before it reaches a page.

import { compareSlots, type Slot } from "../lib/timeline";
import { parseAll } from "./parse";
import type { Item, Task } from "./schema";

const files = import.meta.glob<string>("../../content/*.md", { query: "?raw", eager: true, import: "default" });

export const builtInItems: readonly Item[] = parseAll(files).sort(byTimeline);

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
