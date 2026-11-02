// Entries named, or meant: whether words saved to the shared space name a
// private entry, and what an address that leads nowhere was probably after.

import type { Item } from "../../content/schema";

/** Text as `namesPrivate` compares it: lower case, its spaces single, trimmed. */
function plain(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Whether `text`, saved to the space both phones share, would name a private
 * entry: its id anywhere in it, or its title, its question, or the question a
 * page would add for it ("About …") as the whole of it. What someone types in
 * their own words is theirs to save; what the app would write for them from a
 * private entry, it never does.
 */
export function namesPrivate(text: string, items: readonly Item[]): boolean {
  const said = plain(text);
  if (said === "") return false;
  return items.some(
    (item) => item.private && (said.includes(item.id) || [item.title, item.ask, `About ${item.title}`].some((name) => name !== null && plain(name) === said))
  );
}

/** Words that say nothing about what was being looked for: the pillars' own paths, and the glue. */
const NOT_A_CLUE = new Set(["library", "timeline", "planner", "journal", "drawer", "settings", "and", "the", "for", "www", "html"]);

/**
 * What an address that leads nowhere was probably after, as words to search:
 * `/library/iron-tablet` is "iron tablet". The pillars' own paths and short
 * glue are dropped, so `/weeks` is "weeks" and `/library/` is nothing.
 */
export function cluesIn(pathname: string): string {
  let path = pathname;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    // Badly escaped: read it as it is.
  }
  return path
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !NOT_A_CLUE.has(w))
    .join(" ");
}

/**
 * The few entries most likely meant by `words`: those named by the most of
 * them (title, question, other names), then those whose title holds the most,
 * then by title. Never a private entry: a guess is the app's suggestion, not
 * something asked for.
 */
export function closest(items: readonly Item[], words: string, limit = 3): Item[] {
  const wanted = words.toLowerCase().split(/\s+/).filter(Boolean);
  if (wanted.length === 0) return [];
  const count = (text: string) => wanted.filter((w) => text.toLowerCase().includes(w)).length;
  return items
    .filter((i) => !i.private)
    .map((item) => ({ item, named: count(`${item.title} ${item.ask ?? ""} ${item.aliases.join(" ")}`), titled: count(item.title) }))
    .filter((s) => s.named > 0)
    .sort((a, b) => b.named - a.named || b.titled - a.titled || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map((s) => s.item);
}
