import { describe, expect, test } from "vitest";
import type { DatedItem, Item } from "../../../src/content/schema";
import { headsUps, worthKnowing } from "../../../src/lib/library/thisWeek";
import { item } from "./fixtures";

describe("worth knowing", () => {
  const at = (id: string, from: number, to: number, over: Partial<Item> = {}): DatedItem => ({ ...item(id, from, "body"), to, ...over }) as DatedItem;
  const task = (id: string, from: number, to: number) => ({
    id: `${id}-task`,
    title: id,
    opens: from,
    due: to,
    deadline: null,
    deadlineFrom: null,
    who: "together" as const,
    keeps: null,
    itemId: id,
    origin: "built-in" as const,
  });

  test("what starts that week and belongs to it: high stakes first, then what asks something of you, then by title", () => {
    const items = [
      at("b-guide", 36, 40),
      at("a-guide", 36, 42),
      at("contractions", 36, 42, { stakes: "high" }),
      at("pack-the-bag", 36, 40, { tasks: [task("pack-the-bag", 36, 40)] }),
      at("later", 37, 40),
    ];
    expect(worthKnowing(items, 36).map((i) => i.id)).toEqual(["contractions", "pack-the-bag", "a-guide", "b-guide"]);
  });

  test("any time is in the Library, unless it asks something of you", () => {
    const flu = at("flu", 4, 40, { tasks: [task("flu", 4, 40)] });
    expect(worthKnowing([at("folic-acid", 4, 42), flu], 4).map((i) => i.id)).toEqual(["flu"]);
  });

  test("never a card, a hard topic or a private entry", () => {
    const items = [at("card", 10, 12, { type: "card" }), at("loss", 10, 12, { topic: "loss" }), at("safety", 10, 12, { private: true })];
    expect(worthKnowing(items, 10)).toEqual([]);
  });
});

describe("heads-ups", () => {
  const card = (id: string, from: number, to: number, over: Partial<Item> = {}): DatedItem =>
    ({ ...item(id, from, "body"), to, type: "card", surprise: true, ...over }) as DatedItem;

  test("a card a week, the one that started nearest, none twice", () => {
    const ups = headsUps([card("any-time", 1, 42), card("from-twenty", 20, 30), card("also-twenty", 20, 21, { stakes: "high" })]);
    expect([1, 19, 20, 21, 22, 23].map((w) => ups.get(w)?.id)).toEqual(["any-time", undefined, "also-twenty", "from-twenty", undefined, undefined]);
  });

  test("never a hard topic or a private card, nor anything but a card", () => {
    const ups = headsUps([card("loss", 5, 5, { topic: "loss" }), card("safety", 5, 5, { private: true }), { ...card("guide", 5, 5), type: "guide" }]);
    expect(ups.size).toBe(0);
  });
});
