import { describe, expect, it } from "vitest";
import type { Item } from "../../../../src/content/schema";
import { neighbours } from "../../../../src/pillars/library/model/through";

const item = (id: string) => ({ id, title: id }) as Item;
const items = ["a", "b", "c", "d"].map(item);

describe("neighbours", () => {
  it("gives the entries either side in the list", () => {
    expect(neighbours(["a", "b", "c"], items, "b")).toEqual({ before: items[0], after: items[2] });
  });

  it("gives none past either end", () => {
    expect(neighbours(["a", "b"], items, "a")).toEqual({ before: undefined, after: items[1] });
    expect(neighbours(["a", "b"], items, "b")).toEqual({ before: items[0], after: undefined });
  });

  it("passes over what's no longer in your Library", () => {
    expect(neighbours(["a", "gone", "c"], items, "a").after).toBe(items[2]);
  });

  it("gives none without a list, or when it isn't in it", () => {
    expect(neighbours(undefined, items, "a")).toEqual({ before: undefined, after: undefined });
    expect(neighbours(["b", "c"], items, "a")).toEqual({ before: undefined, after: undefined });
  });
});
