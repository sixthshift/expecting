// What the Library offers on Home: what's worth knowing as a week starts
// (what asks something of you, and what's short enough to belong to that
// week), and the week's heads-up, one card nobody tells you about.

import { asks, type DatedItem, type Item, isDated } from "../../content/schema";
import { allWeeks, type Week } from "../timeline";
import { HARD_TOPICS } from "./doors";

/** A window longer than this many weeks is any time: it's in the Library, not on a week. */
const ON_A_WEEK = 12;

const STAKES_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

/** Whether `item` may come to you unasked: the hard topics and private entries wait to be looked for. */
export function unasked(item: Item): boolean {
  return !item.private && !HARD_TOPICS.includes(item.topic);
}

/**
 * Worth knowing in `week`: what starts that week, either asking something of you or
 * with a window short enough to belong to it (ON_A_WEEK). Never a card (one is the
 * week's heads-up) and never what waits to be looked for. Highest stakes first, then
 * what asks something of you, then by title.
 */
export function worthKnowing(items: readonly Item[], week: Week): DatedItem[] {
  return items
    .filter((i): i is DatedItem => i.from === week)
    .filter((i) => i.tasks.length > 0 || (i.type !== "card" && unasked(i) && i.to - i.from <= ON_A_WEEK))
    .sort(
      (a, b) => (STAKES_ORDER[a.stakes ?? ""] ?? 3) - (STAKES_ORDER[b.stakes ?? ""] ?? 3) || Number(asks(b)) - Number(asks(a)) || a.title.localeCompare(b.title)
    );
}

/**
 * One of the things nobody tells you for each week, the same on both phones: walking
 * the weeks in order, each takes, of the cards covering it not yet taken, the one that
 * started nearest (then higher stakes, then by id). So none repeats, and a card tends
 * to come up in the week it starts. A week with none left has none.
 */
export function headsUps(items: readonly Item[]): Map<Week, DatedItem> {
  const cards = items.filter((i): i is DatedItem => i.type === "card" && isDated(i) && unasked(i));
  const taken = new Set<string>();
  const byWeek = new Map<Week, DatedItem>();
  for (const week of allWeeks()) {
    const card = cards
      .filter((c) => !taken.has(c.id) && c.from <= week && week <= c.to)
      .sort((a, b) => b.from - a.from || (STAKES_ORDER[a.stakes ?? ""] ?? 3) - (STAKES_ORDER[b.stakes ?? ""] ?? 3) || a.id.localeCompare(b.id))[0];
    if (!card) continue;
    taken.add(card.id);
    byWeek.set(week, card);
  }
  return byWeek;
}
