// The Planner while something has happened (src/lib/quiet.ts): To do is put
// aside, with what was already set in motion. Pure, tested apart from the screen.

import type { Item, Task } from "../../content/schema";

/**
 * What you'd already set in motion when the to-do list was put aside: the
 * ticked tasks. Claims (an item about money and leave) may still matter;
 * the rest (bookings, classes, orders) you might want to cancel.
 */
export function setInMotion(tasks: readonly Task[], ticks: Readonly<Record<string, string>>, items: readonly Item[]): { claims: Task[]; bookings: Task[] } {
  const payments = new Set(items.filter((i) => i.type === "payment").map((i) => i.id));
  const done = tasks.filter((t) => ticks[t.id]);
  return {
    claims: done.filter((t) => t.itemId !== null && payments.has(t.itemId)),
    bookings: done.filter((t) => t.itemId === null || !payments.has(t.itemId)),
  };
}
