// What the sheet on an entry offers to ask at the next appointment
// (docs/product/planner.md): nothing on a private entry, which
// leaves no trace; else the entry's own question, on a can-i whose answer is
// to ask first, and those its page suggests (`appointment:`).

import type { Item, ItemPage } from "../../../content/schema";

/** Whether an entry offers to send a question at all: every one but a private one. */
export function canAskFrom(item: Item): boolean {
  return !item.private;
}

/** The questions an entry suggests, in the order offered, each once. */
export function suggestionsFor(item: Item, page: Pick<ItemPage, "appointment">): string[] {
  if (!canAskFrom(item)) return [];
  const own = item.verdict === "ask" && item.ask ? [item.ask] : [];
  return [...new Set([...own, ...page.appointment])];
}
