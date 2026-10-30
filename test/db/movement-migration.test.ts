// 018_movement rebuilds journal_entry so a movement can have no words and be
// marked as different. Run against a database built by the migrations before
// it, the way a real one is: the notes already kept come through as they were.

import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { MIGRATIONS_DIR, migrate } from "../../src/db/migrations/migrate";

const sql = Object.fromEntries(
  readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && f < "019")
    .map((f) => [f, readFileSync(join(MIGRATIONS_DIR, f), "utf8")])
);
const before = Object.fromEntries(Object.entries(sql).filter(([f]) => f < "018"));

test("the notes already kept come through as they were, none of them different", () => {
  const db = new Database(":memory:");
  migrate(db, { sources: before });
  db.run("INSERT INTO person (id, name, role, created_at) VALUES ('p', 'Sam', 'carrying', 'x')");
  db.run(
    "INSERT INTO journal_entry (id, kind, day, time, body, by, created_at, edited_by, edited_at) VALUES ('a', 'note', '2026-10-30', '07:30', 'First kick!', 'p', 'x', 'p', 'y')"
  );
  migrate(db, { sources: sql });

  expect(db.query("SELECT * FROM journal_entry").all()).toEqual([
    { id: "a", kind: "note", day: "2026-10-30", time: "07:30", body: "First kick!", different: 0, by: "p", created_at: "x", edited_by: "p", edited_at: "y" },
  ]);
  expect(db.query("SELECT name FROM sqlite_master WHERE name = 'journal_entry_day'").get()).not.toBeNull();
  db.run("INSERT INTO journal_entry (id, kind, day, time, body, different, created_at) VALUES ('b', 'movement', '2026-10-30', '21:00', '', 1, 'x')");
  // Its person still goes as a note's does.
  db.run("PRAGMA foreign_keys = ON");
  db.run("DELETE FROM person WHERE id = 'p'");
  expect(db.query("SELECT by FROM journal_entry WHERE id = 'a'").get()).toEqual({ by: null });
});
