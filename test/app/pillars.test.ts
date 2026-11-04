import { describe, expect, it } from "vitest";
import { PILLARS } from "../../src/app/components/layout/pillars";

describe("the pillars", () => {
  it("are five, each once", () => {
    expect(new Set(PILLARS.map((p) => p.to)).size).toBe(5);
  });

  it("put home in the middle of the row, the Journal behind it and the Planner ahead", () => {
    const middle = Math.floor(PILLARS.length / 2);
    expect(PILLARS.map((p) => p.to).slice(middle - 1, middle + 2)).toEqual(["/journal", "/", "/planner"]);
  });
});
