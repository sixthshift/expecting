// The built-in items, from content/items/*.md, so every week reads offline:
// every item's index up front (src/content/vite.ts), and each one's page
// when it opens. This week's notes come whole from content/weeks/<week>.md.
// A malformed index throws as this module loads; test/content/content.test.ts
// parses every file whole, pages too, so a bad item fails the gate before it
// reaches a page.

import halves from "virtual:expecting/items";
import type { PageHalf } from "./file";
import { indexAll, parsePage } from "./parse";
import type { Item, ItemPage, Task } from "./schema";
import { parseWeeks, type WeekNote } from "./weeks";

export const builtInItems: readonly Item[] = indexAll(halves).sort(byTimeline);

const pages = import.meta.glob<PageHalf>("../../content/items/*.md", { query: "?page", import: "default" });

/** An item's page: its body, sources and related, fetched with the item's own chunk. */
export async function loadPage(item: Item): Promise<ItemPage> {
  const file = `items/${item.id}.md`;
  const load = pages[`../../content/${file}`];
  if (!load) throw new Error(`No page for ${item.id}`);
  return parsePage(file, await load(), item);
}

const weekFiles = import.meta.glob<string>("../../content/weeks/*.md", { query: "?raw", eager: true, import: "default" });

/** This week's note for each week that has one, from content/weeks/<week>.md. */
export const weekNotes: readonly WeekNote[] = parseWeeks(weekFiles).sort((a, b) => a.week - b.week);

export const builtInTasks: readonly Task[] = builtInItems.flatMap((item) => item.tasks);

const taskIds = new Set(builtInTasks.map((t) => t.id));

export function isBuiltInTaskId(id: string): boolean {
  return taskIds.has(id);
}

const lineIds = new Set(builtInItems.flatMap((item) => item.lines.map((l) => l.id)));

export function isBuiltInLineId(id: string): boolean {
  return lineIds.has(id);
}

const itemIds = new Set(builtInItems.map((i) => i.id));

export function isBuiltInItemId(id: string): boolean {
  return itemIds.has(id);
}

const privateIds = new Set(builtInItems.filter((i) => i.private).map((i) => i.id));

/** Whether the entry `id` is private: read, but leaves no trace in the space you share. */
export function isPrivateItem(id: string): boolean {
  return privateIds.has(id);
}

/** By their weeks, then title; those without weeks last. */
function byTimeline(a: Item, b: Item): number {
  if (a.from === null || b.from === null) return (a.from === null ? 1 : 0) - (b.from === null ? 1 : 0) || a.title.localeCompare(b.title);
  return a.from - b.from || a.to - b.to || a.title.localeCompare(b.title);
}
