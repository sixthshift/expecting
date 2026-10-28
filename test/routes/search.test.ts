import { expect, test } from "vitest";
import { timelineSearch } from "../../src/routes/search";

test("?at= keeps a week's key, and a key that names no week is dropped", () => {
  expect(timelineSearch.parse({ at: "28" })).toEqual({ at: "28" });
  expect(timelineSearch.parse({ at: "pp3" })).toEqual({ at: "pp3" });
  expect(timelineSearch.parse({ at: "week-99" })).toEqual({ at: undefined });
});

test("?at=28 arrives from the router as a number, and still opens week 28", () => {
  expect(timelineSearch.parse({ at: 28 })).toEqual({ at: "28" });
  expect(timelineSearch.parse({ at: 99 })).toEqual({ at: undefined });
});

test("the old key `before` opens as preconception", () => {
  expect(timelineSearch.parse({ at: "before" })).toEqual({ at: "preconception" });
  expect(timelineSearch.parse({ at: "preconception" })).toEqual({ at: "preconception" });
});
