import { expect, test } from "vitest";
import { photosSummary } from "../../../../src/lib/journal/summaries/photos";
import { DUE, photo } from "../storyFixtures";
import { on, today } from "./days";

test("photos: how many, the bump week by week, the scans and the last", () => {
  expect(photosSummary([photo("bump", on(12, 0)), photo("bump", on(20, 0)), photo("scan", on(12, 2)), photo("other", on(22, 0))], today, DUE)).toEqual({
    headline: "4 photos",
    lines: ["The bump in 2 weeks, from week 12 to week 20.", "A scan: week 12.", expect.stringMatching(/^Last kept /)],
    lately: false,
  });
});
