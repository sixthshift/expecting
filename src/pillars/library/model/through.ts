import type { Item } from "../../../content/schema";

/**
 * The entries either side of `id` in the list it was opened from: only those
 * still in your Library (`items`; one an answer hides is passed over). None
 * either side when it isn't in the list, or there's no list (a reload, or a
 * link from nowhere in particular).
 */
export function neighbours(list: readonly string[] | undefined, items: readonly Item[], id: string): { before: Item | undefined; after: Item | undefined } {
  const byId = new Map(items.map((i) => [i.id, i]));
  const shown = (list ?? []).flatMap((at) => byId.get(at) ?? []);
  const at = shown.findIndex((i) => i.id === id);
  if (at < 0) return { before: undefined, after: undefined };
  return { before: shown[at - 1], after: shown[at + 1] };
}
