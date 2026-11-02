// Search, through everything in the Library, best matches first.

import type { Item } from "../../content/schema";
import { byTitle } from "./doors";

/**
 * What was typed, through everything: every word must be in an entry's title, the question it answers, its other
 * names or its summary. Those matching on their title, question or other names come first, then by title.
 */
export function search(items: readonly Item[], query: string): Item[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const named = (i: Item) => `${i.title} ${i.ask ?? ""} ${i.aliases.join(" ")}`.toLowerCase();
  const all = (text: string) => words.every((w) => text.includes(w));
  const strong = items.filter((i) => all(named(i)));
  const weak = items.filter((i) => !strong.includes(i) && all(`${named(i)} ${i.summary ?? ""}`.toLowerCase()));
  return [...byTitle(strong), ...byTitle(weak)];
}
