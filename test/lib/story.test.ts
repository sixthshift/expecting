import { describe, expect, test } from "vitest";
import { foldedWhileQuiet, landmarks, lensesKept, storyGroups, storyItems, storyMatches, trimesterOf, weekTiles } from "../../src/lib/story";
import { appetite, DUE, entry, feeling, first, paper, photo, sources } from "./storyFixtures";

describe("the story", () => {
  test("everything kept and done, newest first; a day's movements on one line, in time order", () => {
    const items = storyItems(
      sources({
        journal: [
          entry("note", "2026-10-27", { body: "Hiccups" }),
          entry("movement", "2026-10-30", { time: "21:40" }),
          entry("movement", "2026-10-30", { time: "09:15" }),
          entry("letter", "2026-10-20", { body: "Dear you" }),
        ],
        appetite: [appetite("craving", "2026-10-29")],
        photos: [photo("bump", "2026-10-28")],
        papers: [paper("2026-10-21")],
        feelings: [feeling("sam", "2026-10-26")],
        firsts: [first("first-kick", "2026-07-14"), first("first-scan", null)],
        ticks: { "pack-hospital-bag": "2026-10-25T03:00:00.000Z", gone: "2026-10-25T03:00:00.000Z" },
        titles: new Map([["pack-hospital-bag", "Pack the hospital bag"]]),
      })
    );
    expect(items.map((i) => i.kind)).toEqual(["movements", "appetite", "photo", "note", "feeling", "done", "paper", "letter", "first"]);
    const moved = items[0]!;
    expect(moved.kind === "movements" && moved.entries.map((e) => e.time)).toEqual(["09:15", "21:40"]);
  });

  test("movements by each of you on one day name no one", () => {
    const [line] = storyItems(
      sources({ journal: [entry("movement", "2026-10-30", { time: "09:00", by: "sam" }), entry("movement", "2026-10-30", { time: "10:00", by: "alex" })] })
    );
    expect(line!.by).toBeNull();
  });

  test("a lens only once its kind has something; All always; the folded kinds not while something has happened", () => {
    expect(lensesKept([], false)).toEqual(["all"]);
    const items = storyItems(sources({ journal: [entry("note", "2026-10-27")], photos: [photo("scan", "2026-10-27")] }));
    expect(lensesKept(items, false)).toEqual(["all", "notes", "photos"]);
    expect(lensesKept(items, true)).toEqual(["all", "notes"]);
    expect(items.filter(foldedWhileQuiet).map((i) => i.kind)).toEqual(["photo"]);
  });

  test("found by its words, any kind, any case", () => {
    const items = storyItems(
      sources({ journal: [entry("note", "2026-10-27", { body: "Painted the nursery" })], appetite: [appetite("craving", "2026-10-28", { what: "Pickles" })] })
    );
    expect(items.filter((i) => storyMatches(i, "PICKLES")).map((i) => i.kind)).toEqual(["appetite"]);
    expect(items.filter((i) => storyMatches(i, "nursery painted"))).toHaveLength(1);
    expect(items.filter((i) => storyMatches(i, ""))).toHaveLength(2);
    expect(items.filter((i) => storyMatches(i, "sam", (id) => (id === null ? null : "Sam")))).toHaveLength(0);
  });

  test("by week, then day, and a run of weeks with nothing folded into one line", () => {
    const items = storyItems(
      sources({
        journal: [entry("note", "2026-10-28"), entry("note", "2026-10-27"), entry("note", "2026-10-27", { body: "two" }), entry("note", "2026-09-01")],
      })
    );
    const groups = storyGroups(items, DUE);
    expect(groups.map((g) => (g.kind === "gap" ? `gap ${g.from}-${g.to}` : `week ${g.place}`))).toEqual(["week 28", "gap 21-27", "week 20"]);
    const week = groups[0]!;
    expect(week.kind === "group" && week.days.map((d) => [d.day, d.items.length])).toEqual([
      ["2026-10-28", 1],
      ["2026-10-27", 2],
    ]);
  });

  test("by month with no due date, and no gaps", () => {
    const groups = storyGroups(storyItems(sources({ journal: [entry("note", "2026-10-28"), entry("note", "2026-07-01")] })), null);
    expect(groups.map((g) => g.kind === "group" && g.month)).toEqual(["2026-10", "2026-07"]);
  });

  test("zoomed out, a tile a week to now, the bump its picture, the quiet ones quiet", () => {
    const items = storyItems(
      sources({
        photos: [photo("scan", "2026-10-27"), photo("bump", "2026-10-28")],
        firsts: [first("first-kick", "2026-10-20")],
        journal: [entry("note", "2026-10-20")],
      })
    );
    const tiles = weekTiles(items, DUE, 28);
    expect(tiles).toHaveLength(28);
    expect(tiles[0]).toMatchObject({ week: 28, lenses: ["photos"], quiet: false });
    expect(tiles[0]!.photo?.kind).toBe("bump");
    expect(tiles[1]).toMatchObject({ week: 27, lenses: ["notes", "firsts"] });
    expect(tiles[2]).toMatchObject({ week: 26, quiet: true, photo: null });
    expect(landmarks([first("first-kick", "2026-10-20"), first("first-scan", null)], DUE).map((l) => l.week)).toEqual([27]);
    expect(trimesterOf(13).key).toBe("first");
    expect(trimesterOf(14).key).toBe("second");
  });
});

test("the spine: every week back to the first, each kept or quiet, this week left out", async () => {
  const { storySpine } = await import("../../src/lib/story");
  const items = storyItems(sources({ journal: [entry("note", "2026-10-28"), entry("note", "2026-10-20")] }));
  const spine = storySpine(items, DUE, 28, 28);
  expect(spine).toHaveLength(27);
  expect(spine[0]).toMatchObject({ kind: "group", place: 27 });
  expect(spine[1]).toEqual({ kind: "quiet", key: "quiet-26", week: 26 });
  expect(spine.at(-1)).toMatchObject({ kind: "quiet", week: 1 });
  expect(storySpine(items, null, null).map((g) => g.kind)).toEqual(["group"]);
});
