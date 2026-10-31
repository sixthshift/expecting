import { describe, expect, it } from "vitest";
import { transitionBetween } from "../../src/app/model/transitions";

describe("transitionBetween", () => {
  it("slides in to a page under this one, and back out", () => {
    expect(transitionBetween("/library", "/library/glucose-tolerance-test", true)).toEqual(["in"]);
    expect(transitionBetween("/planner", "/planner/lists", true)).toEqual(["in"]);
    expect(transitionBetween("/planner/lists", "/planner/lists/before-birth", true)).toEqual(["in"]);
    expect(transitionBetween("/library/glucose-tolerance-test", "/library", true)).toEqual(["out"]);
  });

  it("fades across pillars, and between pages side by side", () => {
    expect(transitionBetween("/", "/planner", true)).toEqual(["across"]);
    expect(transitionBetween("/planner", "/", true)).toEqual(["across"]);
    expect(transitionBetween("/library/a", "/library/b", true)).toEqual(["across"]);
    expect(transitionBetween("/library/a", "/journal", true)).toEqual(["across"]);
    expect(transitionBetween("/onboarding/due", "/onboarding/baby", true)).toEqual(["across"]);
  });

  it("has none when only the search changes, or on the first page", () => {
    expect(transitionBetween("/timeline", "/timeline", false)).toBe(false);
    expect(transitionBetween(undefined, "/", true)).toBe(false);
  });
});
