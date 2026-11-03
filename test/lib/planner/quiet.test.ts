import { expect, test } from "vitest";
import { builtInItems } from "../../../src/content";
import type { Item, Task } from "../../../src/content/schema";
import { setInMotion } from "../../../src/lib/planner/quiet";

const byId = (id: string) => builtInItems.find((i) => i.id === id) as Item;

function task(id: string, itemId: string | null): Task {
  return { id, title: id, opens: 1, due: 20, deadline: null, deadlineFrom: null, who: "together", itemId, origin: itemId ? "built-in" : "own" } as Task;
}

test("what was set in motion: claims apart from bookings, only what's ticked", () => {
  const items = [byId("parental-leave-pay-claim"), byId("loss-and-work")];
  const tasks = [task("claim", "parental-leave-pay-claim"), task("booked", "loss-and-work"), task("mine", null), task("not-yet", "loss-and-work")];
  const { claims, bookings } = setInMotion(tasks, { claim: "t", booked: "t", mine: "t" }, items);
  expect(claims.map((t) => t.id)).toEqual(["claim"]);
  expect(bookings.map((t) => t.id)).toEqual(["booked", "mine"]);
});
