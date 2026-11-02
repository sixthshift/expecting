import { describe, expect, test } from "vitest";
import { search } from "../../../src/lib/library/search";
import { entry } from "./fixtures";

describe("search", () => {
  const brie = entry("brie", { type: "can-i", topic: "food", verdict: "avoid" });
  const sushi = entry("sushi", { type: "can-i", topic: "food", verdict: "avoid", title: "Sushi", aliases: ["raw fish"] });

  test("search wants every word, and puts matches by name before matches in a summary", () => {
    const sauce = entry("sauce", { title: "Aioli", summary: "Made with raw fish sometimes" });
    expect(search([sauce, sushi, brie], "raw fish").map((i) => i.id)).toEqual(["sushi", "sauce"]);
    expect(search([sauce, sushi, brie], "  ")).toEqual([]);
  });
});
