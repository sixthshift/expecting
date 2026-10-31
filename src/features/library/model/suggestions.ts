// What the sheet on an entry offers to ask at the next appointment
// (docs/plan-appointment-questions.md): nothing on a private entry, which
// leaves no trace; else the entry's own question, on a can-i whose answer is
// to ask first.

import type { Item } from "../../../content/schema";

/** Whether an entry offers to send a question at all: every one but a private one. */
export function canAskFrom(item: Item): boolean {
  return !item.private;
}

/** The questions an entry suggests, in the order offered. */
export function suggestionsFor(item: Item): string[] {
  if (!canAskFrom(item)) return [];
  return item.verdict === "ask" && item.ask ? [item.ask] : [];
}
