import { expect, test } from "vitest";
import { timelineSearch } from "../../src/routes/search";

test("?at= keeps a week, and a key that names no week is dropped", () => {
  expect(timelineSearch.parse({ at: "28" })).toEqual({ at: 28 });
  expect(timelineSearch.parse({ at: "pp3" })).toEqual({ at: undefined });
  expect(timelineSearch.parse({ at: "preconception" })).toEqual({ at: undefined });
  expect(timelineSearch.parse({ at: "week-99" })).toEqual({ at: undefined });
});

test("?at=28 arrives from the router as a number, and still opens week 28", () => {
  expect(timelineSearch.parse({ at: 28 })).toEqual({ at: 28 });
  expect(timelineSearch.parse({ at: 99 })).toEqual({ at: undefined });
});
