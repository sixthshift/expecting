import { describe, expect, test } from "vitest";
import type { DatedItem, Item } from "../../../src/content/schema";
import { rightNow, standingLabel } from "../../../src/lib/library/rightNow";
import { item } from "./fixtures";

describe("right now", () => {
  const span = (id: string, from: number, to: number): DatedItem => ({
    ...item(id, from, "appointments"),
    to,
    tasks: [
      { id: `${id}-task`, title: id, opens: from, due: to, deadline: null, deadlineFrom: null, who: "together", keeps: null, itemId: id, origin: "built-in" },
    ],
  });
  const windows = [span("flu", 4, 40), span("gtt", 24, 28), span("rsv", 28, 36), span("whooping", 20, 32), span("car-seat", 30, 37)];

  test("the items open this week, soonest-closing first, with where each stands", () => {
    expect(rightNow(windows, 28).map(({ item, standing }) => [item.id, standingLabel(standing, 28)])).toEqual([
      ["gtt", "Closes this week"],
      ["whooping", "4 weeks left"],
      ["rsv", "Opened this week"],
      ["flu", "Open since week 4"],
    ]);
  });

  test("a window counts down once it closes within a month", () => {
    expect(rightNow(windows, 33).map(({ item, standing }) => [item.id, standing])).toEqual([
      ["rsv", { kind: "left", weeks: 3 }],
      ["car-seat", { kind: "left", weeks: 4 }],
      ["flu", { kind: "open", since: 4 }],
    ]);
    expect(standingLabel({ kind: "left", weeks: 1 }, 35)).toBe("1 week left");
  });

  test("windows closing the same week: the one open longest first", () => {
    expect(rightNow([span("a", 10, 20), span("b", 5, 20)], 12).map(({ item }) => item.id)).toEqual(["b", "a"]);
  });

  test("nothing open, nothing shown", () => {
    expect(rightNow(windows, 2)).toEqual([]);
  });

  test("only what asks something of you: an item without tasks, or without weeks, is on its shelf instead", () => {
    const reading = { ...span("reading", 20, 32), tasks: [] };
    const weekless: Item = { ...item("vernix", 1, "baby"), from: null, to: null };
    expect(rightNow([reading, weekless, ...windows], 28).map(({ item }) => item.id)).not.toContain("reading");
    expect(rightNow([reading, weekless, ...windows], 28).map(({ item }) => item.id)).not.toContain("vernix");
  });
});
