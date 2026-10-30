import { describe, expect, test } from "vitest";
import type { ISODate } from "../../src/lib/dates";
import {
  bumpToTake,
  bumpWeeks,
  kindsOffered,
  newestFirst,
  type Photo,
  photoGroups,
  sideBySide,
  takenOn,
  tidyCaption,
  weekPhotos,
  weekPhotoWords,
} from "../../src/lib/photos";

// Due 19 Jan 2027: week 28 runs 27 Oct – 2 Nov 2026, week 12 from 7 Jul.
const DUE = "2027-01-19" as ISODate;

const shot = (id: string, day: string, kind: Photo["kind"], time: string | null = "09:00"): Photo => ({
  id,
  fileId: `f-${id}`,
  kind,
  day,
  time,
  caption: null,
  by: null,
  createdAt: `${day}T00:00:00.000Z`,
  editedBy: null,
  editedAt: null,
});

test("words trimmed, and none rather than blank", () => {
  expect(tidyCaption("  12-week scan ")).toBe("12-week scan");
  expect(tidyCaption("   ")).toBeNull();
  expect(tidyCaption(null)).toBeNull();
});

test("newest first: by day, then time, then when kept", () => {
  const photos = [shot("a", "2026-10-28", "bump", "08:00"), shot("b", "2026-10-29", "scan", null), shot("c", "2026-10-28", "bump", "18:00")];
  expect(newestFirst(photos).map((p) => p.id)).toEqual(["b", "c", "a"]);
});

describe("by week", () => {
  test("under their weeks, newest first; by month without a due date", () => {
    const photos = [shot("a", "2026-07-08", "scan"), shot("b", "2026-10-28", "bump"), shot("c", "2026-10-30", "other"), shot("d", "2026-03-01", "other")];
    expect(photoGroups(photos, DUE).map((g) => [g.place, g.photos.map((p) => p.id)])).toEqual([
      [28, ["c", "b"]],
      [12, ["a"]],
      ["before", ["d"]],
    ]);
    expect(photoGroups(photos, null).map((g) => [g.month, g.photos.length])).toEqual([
      ["2026-10", 2],
      ["2026-07", 1],
      ["2026-03", 1],
    ]);
  });
});

describe("the bump, week by week", () => {
  const photos = [
    shot("early", "2026-07-07", "bump", "08:00"),
    shot("later", "2026-07-09", "bump", "08:00"),
    shot("scan", "2026-09-02", "scan"),
    shot("twenty", "2026-09-02", "bump"),
    shot("before", "2026-03-01", "bump"),
  ];

  test("one a week, its latest, first week first; only the pregnancy's weeks; none without a due date", () => {
    expect(bumpWeeks(photos, DUE).map((b) => [b.week, b.photo.id])).toEqual([
      [12, "later"],
      [20, "twenty"],
    ]);
    expect(bumpWeeks(photos, null)).toEqual([]);
  });

  test("this week's is still to take until one is kept in it; never while something has happened", () => {
    expect(bumpToTake(photos, { now: 28, dueDate: DUE, quiet: false })).toBe(28);
    expect(bumpToTake([...photos, shot("now", "2026-10-30", "bump")], { now: 28, dueDate: DUE, quiet: false })).toBeNull();
    expect(bumpToTake(photos, { now: 28, dueDate: DUE, quiet: true })).toBeNull();
    expect(bumpToTake(photos, { now: null, dueDate: null, quiet: false })).toBeNull();
  });

  test("side by side opens on the first and the latest", () => {
    const weeks = bumpWeeks(photos, DUE);
    expect(sideBySide(weeks)?.map((b) => b.week)).toEqual([12, 20]);
    expect(sideBySide(weeks.slice(0, 1))).toBeNull();
  });
});

test("never a bump after a loss; with hard news, anything", () => {
  expect(kindsOffered("loss")).toEqual(["scan", "other"]);
  expect(kindsOffered("news")).toEqual(["bump", "scan", "other"]);
  expect(kindsOffered(null)).toEqual(["bump", "scan", "other"]);
});

test("a week's pictures in words, for the timeline", () => {
  const photos = [shot("a", "2026-10-28", "bump"), shot("b", "2026-10-29", "scan"), shot("c", "2026-10-29", "scan"), shot("d", "2026-10-30", "other")];
  const week = weekPhotos(photos, 28, DUE);
  expect(week).toEqual({ bump: true, scans: 2, others: 1 });
  expect(weekPhotoWords(week)).toEqual(["bump photo", "2 scans", "1 photo"]);
  expect(weekPhotoWords({ bump: false, scans: 1, others: 0 })).toEqual(["scan"]);
  expect(weekPhotos(photos, 28, null)).toEqual({ bump: false, scans: 0, others: 0 });
});

test("taken on the day its camera says, unless that's after today", () => {
  const now = new Date(2026, 9, 30, 14, 5);
  expect(takenOn({ day: "2026-10-20" as ISODate, time: "09:40" }, now)).toEqual({ day: "2026-10-20", time: "09:40", fromPhoto: true });
  expect(takenOn({ day: "2027-01-01" as ISODate, time: "09:40" }, now)).toEqual({ day: "2026-10-30", time: "14:05", fromPhoto: false });
  expect(takenOn(null, now)).toEqual({ day: "2026-10-30", time: "14:05", fromPhoto: false });
});
