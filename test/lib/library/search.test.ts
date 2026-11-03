import { describe, expect, test } from "vitest";
import { rank, search } from "../../../src/lib/library/search";
import { entry } from "./fixtures";

describe("search", () => {
  const brie = entry("brie", { type: "can-i", topic: "food", verdict: "avoid" });
  const sushi = entry("sushi", { type: "can-i", topic: "food", verdict: "avoid", title: "Sushi", aliases: ["raw fish"] });

  test("search wants every word, and puts matches by name before matches in a summary", () => {
    const sauce = entry("sauce", { title: "Aioli", summary: "Made with raw fish sometimes" });
    expect(search([sauce, sushi, brie], "raw fish").map((i) => i.id)).toEqual(["sushi", "sauce"]);
    expect(search([sauce, sushi, brie], "  ")).toEqual([]);
  });

  test("rank takes a sentence: filler dropped, a plural found by its singular, the rarer word and a name match first", () => {
    const cheese = entry("cheese", { title: "Soft cheese", summary: "Brie and camembert, pregnant or not" });
    const hairDye = entry("hair-dye", { title: "Hair dye", summary: "Colouring your hair while pregnant" });
    const cramp = entry("cramp", { title: "Leg cramp", summary: "Common when pregnant" });
    const items = [cheese, hairDye, cramp, brie];
    expect(search(items, "can I eat brie while pregnant")).toEqual([]);
    expect(
      rank(items, "can I eat brie while pregnant")
        .map((i) => i.id)
        .slice(0, 2)
    ).toEqual(["brie", "cheese"]);
    expect(rank(items, "leg cramps at night")[0]!.id).toBe("cramp");
    expect(rank(items, "what can I do")).toEqual([]);
  });
});
