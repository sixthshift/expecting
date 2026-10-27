import { expect, test } from "vitest";
import { homeSearch } from "../../src/routes/search";

test("?at= keeps a week's key, and a key that names no week is dropped", () => {
  expect(homeSearch.parse({ at: "28" })).toEqual({ at: "28" });
  expect(homeSearch.parse({ at: "pp3" })).toEqual({ at: "pp3" });
  expect(homeSearch.parse({ at: "week-99" })).toEqual({ at: undefined });
});

test("the old key `before` opens as preconception", () => {
  expect(homeSearch.parse({ at: "before" })).toEqual({ at: "preconception" });
  expect(homeSearch.parse({ at: "preconception" })).toEqual({ at: "preconception" });
});
