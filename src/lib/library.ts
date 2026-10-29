// The Library's shelves, in order. Pure, so the order is tested apart from
// the screen:
//
//   surprise   the things nobody tells you
//   topics     a shelf per topic, in their usual order
//
// An item sits on its topic's shelf; a surprise is on both. Search, on the
// page, looks through everything.
//
// Above the shelves, right now: the items that ask something of you open this
// week, soonest-closing first, each with where its window stands. The rest of
// what's worth reading this week is on the shelves.

import { asks, type DatedItem, type Item, TOPICS, type Topic } from "../content/schema";
import type { Week } from "./timeline";

export type Shelf = {
  key: string;
  title: string;
  items: Item[];
  /** Drawn as cards, the things nobody tells you. */
  surprise: boolean;
};

export function arrangeLibrary(items: readonly Item[]): Shelf[] {
  const topics = (Object.keys(TOPICS) as Topic[]).map((t): Shelf => ({ key: t, title: TOPICS[t], items: items.filter((i) => i.topic === t), surprise: false }));
  return [{ key: "surprise", title: "Nobody tells you", items: items.filter((i) => i.surprise), surprise: true }, ...topics].filter((s) => s.items.length > 0);
}

/** Where an item's window stands this week. */
export type Standing =
  /** Its last week is this one. */
  | { kind: "closing" }
  /** It closes within a month: worth counting down. */
  | { kind: "left"; weeks: number }
  /** It has a while yet: say how long it has been open instead. */
  | { kind: "open"; since: Week };

export type RightNow = { item: DatedItem; standing: Standing };

/** A window closing within this many weeks counts down; a longer one says when it opened. */
export const COUNTDOWN_WEEKS = 4;

/**
 * Right now, at week `now`: the items that ask something of you whose weeks cover it, soonest-closing
 * first (then the one open longest, then by title), each with where its window
 * stands.
 */
export function rightNow(items: readonly Item[], now: Week): RightNow[] {
  return items
    .filter(asks)
    .filter((i) => i.from <= now && now <= i.to)
    .sort((a, b) => a.to - b.to || a.from - b.from || a.title.localeCompare(b.title))
    .map((item) => ({ item, standing: standingAt(item, now) }));
}

function standingAt(item: DatedItem, now: Week): Standing {
  const left = item.to - now;
  if (left === 0) return { kind: "closing" };
  if (left <= COUNTDOWN_WEEKS) return { kind: "left", weeks: left };
  return { kind: "open", since: item.from };
}

/** "Closes this week", "3 weeks left", "Open since week 24", "Opened this week". */
export function standingLabel(standing: Standing, now: Week): string {
  switch (standing.kind) {
    case "closing":
      return "Closes this week";
    case "left":
      return standing.weeks === 1 ? "1 week left" : `${standing.weeks} weeks left`;
    case "open":
      return standing.since === now ? "Opened this week" : `Open since week ${standing.since}`;
  }
}
