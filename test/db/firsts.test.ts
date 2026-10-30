import { expect, test } from "vitest";
import { FirstsRepo } from "../../src/db/models/firsts/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();

test("a first is marked on its day, moved, and each of you keeps your own words for it", () => {
  const people = new PeopleRepo(db());
  const sam = people.add("Sam", "carrying");
  const alex = people.add("Alex", "partner");
  const repo = new FirstsRepo(db());
  repo.mark("first-kick", "2026-07-14", sam.id, new Date("2026-07-14T10:00:00Z"));
  repo.mark("first-kick", "2026-07-12", alex.id, new Date("2026-07-15T10:00:00Z"));
  repo.setWords("first-kick", sam.id, "  On the couch  ", new Date("2026-07-15T11:00:00Z"));
  repo.setWords("first-kick", alex.id, "At work, missed it", new Date("2026-07-15T12:00:00Z"));
  repo.setWords("first-kick", sam.id, "On the couch, 9pm", new Date("2026-07-16T11:00:00Z"));
  const [kick] = repo.list();
  expect(kick).toMatchObject({ key: "first-kick", day: "2026-07-12", by: sam.id, createdAt: "2026-07-14T10:00:00.000Z" });
  expect(kick!.words).toEqual(
    expect.arrayContaining([
      { by: sam.id, body: "On the couch, 9pm", editedAt: "2026-07-16T11:00:00.000Z" },
      { by: alex.id, body: "At work, missed it", editedAt: "2026-07-15T12:00:00.000Z" },
    ])
  );
  repo.setWords("first-kick", alex.id, "  ");
  expect(repo.list()[0]!.words).toHaveLength(1);

  // Taken off, its words go with it.
  repo.unmark("first-kick");
  expect(repo.list()).toEqual([]);
  expect(db().query("SELECT * FROM first_words").all()).toEqual([]);
});

test("a suggestion put aside stays aside, takes no words, and is marked after all if you do", () => {
  const repo = new FirstsRepo(db());
  repo.setAside("first-scan", null);
  repo.setAside("first-scan", null);
  expect(repo.list()).toMatchObject([{ key: "first-scan", day: null }]);
  expect(() => repo.setWords("first-scan", "x", "Lovely")).toThrow();
  repo.mark("first-scan", "2026-05-01", null);
  expect(repo.list()).toMatchObject([{ key: "first-scan", day: "2026-05-01" }]);
  // Marked, it isn't put aside again.
  repo.setAside("first-scan", null);
  expect(repo.list()).toMatchObject([{ key: "first-scan", day: "2026-05-01" }]);
});
