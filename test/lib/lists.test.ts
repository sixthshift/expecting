import { expect, test } from "vitest";
import { builtInItems } from "../../src/content";
import type { Item, Line } from "../../src/content/schema";
import { inPlanner, isApart, isLeft, LAST_THING, leftSaying, listsOf, type Mark, sectionsOf, tailorLines, upToSaying, wordsFor } from "../../src/lib/lists";

const line = (id: string, listId: string, section: string | null, fields: Partial<Line> = {}): Line => ({
  id,
  title: id,
  listId,
  section,
  when: {},
  taskId: null,
  itemId: "gear",
  origin: "built-in",
  ...fields,
});

const mark = (lineId: string, state: Mark["state"]): Mark => ({ lineId, state, how: null, note: null, by: null, updatedAt: "2026-11-01T00:00:00.000Z" });

const itemWith = (lines: Line[]) => ({ lines }) as unknown as Item;

test("a line shows while its own when fits, unanswered and unsure hiding nothing", () => {
  const bottles = line("get-bottles", "baby", "feeding", { when: { feeding: ["formula", "both"] } });
  const cot = line("get-cot", "baby", "sleep");
  const items = [itemWith([cot, bottles])];
  expect(tailorLines(items, {}, []).map((l) => l.id)).toEqual(["get-cot", "get-bottles"]);
  expect(tailorLines(items, { feeding: "unsure" }, []).map((l) => l.id)).toEqual(["get-cot", "get-bottles"]);
  expect(tailorLines(items, { feeding: "both" }, []).map((l) => l.id)).toEqual(["get-cot", "get-bottles"]);
  expect(tailorLines(items, { feeding: "breast" }, []).map((l) => l.id)).toEqual(["get-cot"]);
});

test("your own lines come after the built-in ones, as lines of no item", () => {
  const own = { id: "o1", listId: "baby", title: "Bouncer", section: null, by: null, createdAt: "2026-11-01T00:00:00.000Z" };
  const [, mine] = tailorLines([itemWith([line("get-cot", "baby", "sleep")])], {}, [own]);
  expect(mine).toEqual({ id: "o1", title: "Bouncer", listId: "baby", section: null, when: {}, taskId: null, itemId: null, origin: "own" });
});

test("still to get is no mark, or arranged", () => {
  expect(isLeft(undefined)).toBe(true);
  expect(isLeft({ ...mark("a", "got"), state: null, note: "newborn size" })).toBe(true);
  expect(isLeft(mark("a", "arranged"))).toBe(true);
  expect(isLeft(mark("a", "got"))).toBe(false);
  expect(isLeft(mark("a", "not-needed"))).toBe(false);
});

test("the lists: a built-in one only once it has a line, then your own, each with where it's up to and the first few left", () => {
  const lines = [
    line("a", "baby", "sleep"),
    line("b", "baby", "sleep"),
    line("c", "baby", "out-and-about"),
    line("e", "baby", "sleep"),
    line("f", "baby", "clothes"),
    line("g", "baby", "feeding"),
    line("d", "own-1", null, { origin: "own" }),
  ];
  const marks = { a: mark("a", "got"), b: mark("b", "not-needed"), e: mark("e", "arranged") };
  const own = [{ id: "own-1", title: "Bunnings run", by: null, createdAt: "2026-11-01T00:00:00.000Z" }];
  expect(listsOf(lines, own, marks)).toEqual([
    {
      id: "baby",
      title: "Before the birth",
      about: "Everything to have ready for the baby, and for you.",
      origin: "built-in",
      left: 4,
      arranged: 1,
      got: 1,
      total: 5,
      // In the list's order, by section: sleep, out and about, feeding, clothes.
      next: ["e", "c"],
    },
    { id: "own-1", title: "Bunnings run", about: null, origin: "own", left: 1, arranged: 0, got: 0, total: 1, next: ["d"] },
  ]);
});

test("where a list is up to, in a line", () => {
  expect(upToSaying("baby", { got: 12, arranged: 3, total: 27 })).toBe("12 of 27 got · 3 on their way");
  expect(upToSaying("baby", { got: 12, arranged: 1, total: 27 })).toBe("12 of 27 got · 1 on its way");
  expect(upToSaying("freezer-meals", { got: 2, arranged: 0, total: 7 })).toBe("2 of 7 done");
  expect(upToSaying("own-1", { got: 0, arranged: 0, total: 0 })).toBe("Nothing on it yet");
});

test("in a section, what's got sinks below what's left, unless it was ticked during this visit", () => {
  const lines = [line("cot", "baby", "sleep"), line("mattress", "baby", "sleep"), line("sheets", "baby", "sleep")];
  const marks = { cot: mark("cot", "got"), mattress: mark("mattress", "arranged") };
  const [sleep] = sectionsOf("baby", lines, marks).sections;
  expect(sleep!.lines.map((l) => l.id)).toEqual(["mattress", "sheets", "cot"]);
  expect(sleep!.got).toBe(1);
  expect(sectionsOf("baby", lines, marks, new Set(["cot"])).sections[0]!.lines.map((l) => l.id)).toEqual(["cot", "mattress", "sheets"]);
});

test("a list's sections in its order, your loose lines under Also, and the not-needed apart", () => {
  const lines = [
    line("pram", "baby", "out-and-about"),
    line("cot", "baby", "sleep"),
    line("bouncer", "baby", null, { origin: "own" }),
    line("bath", "baby", "bathing"),
    line("other", "freezer-meals", "pantry"),
  ];
  const { sections, notNeeded } = sectionsOf("baby", lines, { bath: mark("bath", "not-needed") });
  expect(sections.map((s) => [s.title, s.lines.map((l) => l.id)])).toEqual([
    ["Sleep", ["cot"]],
    ["Out and about", ["pram"]],
    ["Also", ["bouncer"]],
  ]);
  expect(notNeeded.map((l) => l.id)).toEqual(["bath"]);
});

test("a list of your own has one part, with no heading", () => {
  const { sections } = sectionsOf("own-1", [line("a", "own-1", null), line("b", "own-1", null)], {});
  expect(sections).toEqual([{ key: null, title: null, lines: [line("a", "own-1", null), line("b", "own-1", null)], got: 0 }]);
});

test("what's left, in the list's words", () => {
  expect(leftSaying("baby", { left: 9, total: 12 })).toBe("9 to get");
  expect(leftSaying("freezer-meals", { left: 3, total: 5 })).toBe("3 still to do");
  expect(leftSaying("baby", { left: 0, total: 12 })).toBe("All sorted");
  expect(leftSaying("own-1", { left: 0, total: 0 })).toBe("Nothing on it yet");
});

test("each list has its words for the states, yours the usual", () => {
  expect(wordsFor("freezer-meals").got).toBe("Done");
  expect(wordsFor("baby").none).toBe("To get");
  expect(wordsFor("3f1c…").arranged).toBe("Arranged");
});

test("the bag is It's time's: a list of its own, with its last things, kept out of the Planner's", () => {
  const bag = builtInItems.find((i) => i.id === "hospital-bag")!;
  const lines = tailorLines([bag], {}, []);
  expect(lines.length).toBeGreaterThan(0);
  expect(lines.every((l) => l.listId === "bag")).toBe(true);
  expect(lines.filter((l) => l.section === LAST_THING).map((l) => l.id)).toEqual(["bag-pillows", "bag-chargers", "bag-snacks", "bag-cash"]);
  expect(isApart("bag")).toBe(true);
  expect(isApart("baby")).toBe(false);
  expect(listsOf(lines, [], {}).filter(inPlanner)).toEqual([]);
});
