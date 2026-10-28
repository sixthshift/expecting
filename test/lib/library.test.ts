import Markdoc from "@markdoc/markdoc";
import { expect, test } from "vitest";
import type { Category, Item } from "../../src/content/schema";
import { arrangeLibrary, type LibraryPlan } from "../../src/lib/library";
import type { Slot } from "../../src/lib/timeline";

function item(id: string, from: Slot, category: Category, surprise = false): Item {
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

const BEFORE: Slot = { phase: "preconception" };
const wk = (week: number): Slot => ({ phase: "pregnancy", week });
const pp = (week: number): Slot => ({ phase: "postpartum", week });

const items = [
  item("cover", BEFORE, "money", true),
  item("folic-acid", BEFORE, "body"),
  item("dating-scan", wk(6), "appointments"),
  item("rsv", wk(28), "appointments", true),
  item("car-seat", wk(30), "baby-gear"),
  item("jaundice", pp(1), "baby"),
  item("register", pp(2), "paperwork", true),
];

// The plans each phase's app gives (src/features/phases/<phase>/index.ts).
const GETTING_READY: LibraryPlan = { lead: "Getting ready", first: [], earlier: "keep" };
const PREGNANCY: LibraryPlan = { first: [], earlier: "keep" };
const NEWBORN: LibraryPlan = { first: ["baby", "after-the-birth", "appointments", "paperwork"], earlier: "leave-behind", behind: "From the pregnancy" };

const shelves = (phase: Parameters<typeof arrangeLibrary>[1], plan: LibraryPlan) =>
  arrangeLibrary(items, phase, plan).map((s) => [s.title, s.items.map((i) => i.id)]);

test("the pregnancy: the things nobody tells you, then every topic in its usual order", () => {
  expect(shelves("pregnancy", PREGNANCY)).toEqual([
    ["Nobody tells you", ["cover", "rsv", "register"]],
    ["Appointments", ["dating-scan", "rsv"]],
    ["Body", ["folic-acid"]],
    ["Baby", ["jaundice"]],
    ["Paperwork", ["register"]],
    ["Money", ["cover"]],
    ["Baby gear", ["car-seat"]],
  ]);
});

test("getting ready: its own items first, and everything ahead still there to read", () => {
  const arranged = shelves("preconception", GETTING_READY);
  expect(arranged[0]).toEqual(["Getting ready", ["cover", "folic-acid"]]);
  expect(arranged.flatMap(([, ids]) => ids)).toEqual(expect.arrayContaining(["dating-scan", "rsv", "car-seat", "jaundice", "register"]));
  // On the lead shelf rather than their topic, though a surprise is still among the surprises.
  expect(arranged.find(([title]) => title === "Money")).toBeUndefined();
  expect(arranged.find(([title]) => title === "Nobody tells you")?.[1]).toContain("cover");
});

test("the newborn: its topics first, and the pregnancy's reading put away, folded, at the end", () => {
  const arranged = arrangeLibrary(items, "postpartum", NEWBORN);
  expect(arranged.map((s) => [s.title, s.items.map((i) => i.id)])).toEqual([
    ["Baby", ["jaundice"]],
    ["Paperwork", ["register"]],
    ["Nobody tells you", ["register"]],
    ["From the pregnancy", ["cover", "folic-acid", "dating-scan", "rsv", "car-seat"]],
  ]);
  expect(arranged.at(-1)!.folded).toBe(true);
});

test("an empty shelf isn't shown", () => {
  expect(arrangeLibrary([items[5]!], "postpartum", NEWBORN).map((s) => s.title)).toEqual(["Baby"]);
});
