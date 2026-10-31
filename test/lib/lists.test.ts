import { expect, test } from "vitest";
import type { Item, Line } from "../../src/content/schema";
import { isLeft, listsOf, type Mark, sectionsOf, tailorLines, wordsFor } from "../../src/lib/lists";

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

test("the lists: a built-in one only once it has a line, then your own, each with what's left of what's needed", () => {
  const lines = [line("a", "baby", "sleep"), line("b", "baby", "sleep"), line("c", "baby", "sleep"), line("d", "own-1", null, { origin: "own" })];
  const marks = { a: mark("a", "got"), b: mark("b", "not-needed") };
  const own = [{ id: "own-1", title: "Bunnings run", by: null, createdAt: "2026-11-01T00:00:00.000Z" }];
  expect(listsOf(lines, own, marks)).toEqual([
    { id: "baby", title: "For the baby", about: "Everything to have ready before the birth.", origin: "built-in", left: 1, total: 2 },
    { id: "own-1", title: "Bunnings run", about: null, origin: "own", left: 1, total: 1 },
  ]);
});

test("a list's sections in its order, your loose lines under Also, and the not-needed apart", () => {
  const lines = [
    line("pram", "baby", "out-and-about"),
    line("cot", "baby", "sleep"),
    line("bouncer", "baby", null, { origin: "own" }),
    line("bath", "baby", "bathing"),
    line("other", "freezer-meals", "meals"),
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
  expect(sections).toEqual([{ key: null, title: null, lines: [line("a", "own-1", null), line("b", "own-1", null)] }]);
});

test("each list has its words for the states, yours the usual", () => {
  expect(wordsFor("freezer-meals").got).toBe("Done");
  expect(wordsFor("baby").none).toBe("To get");
  expect(wordsFor("3f1c…").arranged).toBe("Arranged");
});
