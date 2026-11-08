import { describe, expect, it } from "vitest";
import type { Item } from "../../../../src/content/schema";
import { onShelf } from "../../../../src/pillars/library/model/narrowing";

const item = (id: string, more: Partial<Item>) => ({ id, title: id, type: "can-i", topic: "food", who: undefined, ...more }) as Item;
const items = [
  item("brie", { verdict: "limit" }),
  item("sushi", { verdict: "avoid" }),
  item("partner-food", { verdict: "yes", who: "partner" }),
  item("leave", { type: "payment", topic: "money" }),
];
const ids = (narrowing: Parameters<typeof onShelf>[0]) => onShelf(narrowing, items).map((i) => i.id);

describe("onShelf", () => {
  it("keeps what's behind the door", () => {
    expect(ids({ door: "can-i" })).toEqual(["brie", "sushi", "partner-food"]);
  });

  it("narrows by topic and verdict", () => {
    expect(ids({ topic: "money" })).toEqual(["leave"]);
    expect(ids({ door: "can-i", verdict: "avoid" })).toEqual(["sushi"]);
  });

  it("keeps only what's for the partner when asked", () => {
    expect(ids({ door: "can-i", for: "partner" })).toEqual(["partner-food"]);
  });
});
