import { expect, test } from "vitest";
import type { ISODate } from "../../../src/lib/dates";
import { newsLine, otherNews } from "../../../src/lib/home/otherNews";
import type { StoryItem } from "../../../src/lib/journal/story/items";

const at = (day: string, by: string | null, rest: Record<string, unknown>) =>
  ({ key: `${day}-${rest.kind}`, day: day as ISODate, time: null, by, createdAt: `${day}T00:00:00Z`, ...rest }) as StoryItem;

const items: StoryItem[] = [
  at("2026-11-05", "cindy", { kind: "movements", entries: [] }),
  at("2026-11-05", "jason", { kind: "note" }),
  at("2026-11-04", "cindy", { kind: "feeling", feeling: { step: "good" } }),
  at("2026-11-04", "cindy", { kind: "movements", entries: [] }),
  at("2026-11-04", null, { kind: "done", taskId: "t", title: "Book the RSV vaccine" }),
  at("2026-11-04", "cindy", { kind: "appetite" }),
  at("2026-11-03", "cindy", { kind: "photo" }),
];

test("what the other kept today and yesterday, newest first, each kind once; not yours, not what she ate, not the day before", () => {
  expect(otherNews(items, "cindy", "2026-11-05" as ISODate)).toEqual(["felt the baby move", "felt good"]);
  expect(otherNews(items, "cindy", "2026-11-08" as ISODate)).toEqual([]);
});

test("said as one line", () => {
  expect(newsLine(["felt the baby move"])).toBe("felt the baby move");
  expect(newsLine(["felt the baby move", "felt good", "added a photo"])).toBe("felt the baby move, felt good and added a photo");
});
