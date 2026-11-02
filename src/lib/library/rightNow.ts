// Right now: the items that ask something of you open this week,
// soonest-closing first, each with where its window stands.

import { asks, type DatedItem, type Item } from "../../content/schema";
import type { Week } from "../timeline";

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
const COUNTDOWN_WEEKS = 4;

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
