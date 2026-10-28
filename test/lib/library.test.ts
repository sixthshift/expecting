import Markdoc from "@markdoc/markdoc";
import { expect, test } from "vitest";
import type { Category, Item } from "../../src/content/schema";
import { arrangeLibrary } from "../../src/lib/library";

function item(id: string, from: number, category: Category, surprise = false): Item {
  return {
    id,
    title: id,
    from,
    to: from,
    category,
    surprise,
    draft: true,
    source: null,
    checked: null,
    when: {},
    body: "x",
    doc: Markdoc.parse("x"),
    tasks: [],
    origin: "built-in",
  };
}

const items = [
  item("cover", 4, "money", true),
  item("folic-acid", 4, "body"),
  item("dating-scan", 6, "appointments"),
  item("rsv", 28, "appointments", true),
  item("car-seat", 30, "baby-gear"),
  item("numbers", 36, "after-the-birth"),
];

test("the things nobody tells you, then every topic in its usual order", () => {
  expect(arrangeLibrary(items).map((s) => [s.title, s.items.map((i) => i.id)])).toEqual([
    ["Nobody tells you", ["cover", "rsv"]],
    ["Appointments", ["dating-scan", "rsv"]],
    ["Body", ["folic-acid"]],
    ["Money", ["cover"]],
    ["Baby gear", ["car-seat"]],
    ["After the birth", ["numbers"]],
  ]);
});

test("an empty shelf isn't shown", () => {
  expect(arrangeLibrary([items[4]!]).map((s) => s.title)).toEqual(["Baby gear"]);
});
