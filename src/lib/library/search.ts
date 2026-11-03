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

/** Words too common to tell entries apart, dropped from a question asked in a sentence. */
const FILLER = new Set(
  "a an and are be can could did do does for from get go had has have he her him his how i if in is it its just me my of on or our should she so that the their them they this to was we what when where which while who why will with you your".split(
    " "
  )
);

/** A word as matched: lower case, and a plural's -s off, so "cramps" finds "cramp". */
function stem(word: string): string {
  return word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word;
}

/**
 * What was asked, in a sentence, best matches first: for an assistant, which asks "can I eat brie while pregnant"
 * where a person types "brie". Filler words are dropped; each other word counts by how rare it is among the
 * entries, three times over in a title, question or other name. An entry matching none is left out.
 */
export function rank(items: readonly Item[], query: string): Item[] {
  const words = [...new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? [])].filter((w) => !FILLER.has(w)).map(stem);
  if (words.length === 0) return [];
  const texts = items.map((i) => ({
    item: i,
    named: `${i.title} ${i.ask ?? ""} ${i.aliases.join(" ")}`.toLowerCase(),
    rest: (i.summary ?? "").toLowerCase(),
  }));
  const weight = new Map(words.map((w) => [w, Math.log((items.length + 1) / (1 + texts.filter((t) => t.named.includes(w) || t.rest.includes(w)).length))]));
  return texts
    .map((t) => ({ item: t.item, score: words.reduce((sum, w) => sum + (t.named.includes(w) ? 3 : t.rest.includes(w) ? 1 : 0) * weight.get(w)!, 0) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .map((s) => s.item);
}
