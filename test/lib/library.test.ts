import { describe, expect, test } from "vitest";
import type { DatedItem, Item, Topic } from "../../src/content/schema";
import { arrangeLibrary, rightNow, standingLabel } from "../../src/lib/library";

function item(id: string, from: number, topic: Topic, surprise = false): DatedItem {
  return {
    id,
    title: id,
    summary: null,
    from,
    to: from,
    type: "moment",
    topic,
    ask: null,
    aliases: [],
    who: null,
    stakes: null,
    verdict: null,
    decideBy: null,
    surprise,
    private: false,
    draft: true,
    when: {},
    extra: null,
    variables: [],
    tasks: [],
    origin: "built-in",
  };
}

const items = [
  item("cover", 4, "money", true),
  item("folic-acid", 4, "body"),
  item("dating-scan", 6, "appointments"),
  item("rsv", 28, "appointments", true),
  item("car-seat", 30, "gear"),
  item("numbers", 36, "after-the-birth"),
];

test("the things nobody tells you, then every topic in its usual order", () => {
  expect(arrangeLibrary(items).map((s) => [s.title, s.items.map((i) => i.id)])).toEqual([
    ["Nobody tells you", ["cover", "rsv"]],
    ["Body", ["folic-acid"]],
    ["Appointments", ["dating-scan", "rsv"]],
    ["After the birth", ["numbers"]],
    ["Money", ["cover"]],
    ["Baby gear", ["car-seat"]],
  ]);
});

test("an empty shelf isn't shown", () => {
  expect(arrangeLibrary([items[4]!]).map((s) => s.title)).toEqual(["Baby gear"]);
});

describe("right now", () => {
  const span = (id: string, from: number, to: number): DatedItem => ({
    ...item(id, from, "appointments"),
    to,
    tasks: [{ id: `${id}-task`, title: id, opens: from, due: to, deadline: null, deadlineFrom: null, who: "together", itemId: id, origin: "built-in" }],
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
