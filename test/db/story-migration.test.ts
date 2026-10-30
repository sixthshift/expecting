// 022_journal_story rebuilds journal_entry so a note can be a letter. Run
// against a database built by the migrations before it: the notes and
// movements already kept come through as they were.

import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { MIGRATIONS_DIR, migrate } from "../../src/db/migrations/migrate";

const sql = Object.fromEntries(
  readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && f < "023")
    .map((f) => [f, readFileSync(join(MIGRATIONS_DIR, f), "utf8")])
);
const before = Object.fromEntries(Object.entries(sql).filter(([f]) => f < "022"));

test("the notes and movements already kept come through as they were", () => {
  const db = new Database(":memory:");
  migrate(db, { sources: before });
  db.run("INSERT INTO journal_entry (id, kind, day, time, body, different, created_at) VALUES ('a', 'note', '2026-10-30', '07:30', 'First kick!', 0, 'x')");
  db.run("INSERT INTO journal_entry (id, kind, day, time, body, different, created_at) VALUES ('b', 'movement', '2026-10-30', '21:00', '', 1, 'x')");
  migrate(db, { sources: sql });
  expect(db.query("SELECT id, kind, body, different FROM journal_entry ORDER BY id").all()).toEqual([
    { id: "a", kind: "note", body: "First kick!", different: 0 },
    { id: "b", kind: "movement", body: "", different: 1 },
  ]);
  expect(db.query("SELECT name FROM sqlite_master WHERE name = 'journal_entry_day'").get()).not.toBeNull();
  db.run("INSERT INTO journal_entry (id, kind, day, time, body, created_at) VALUES ('c', 'letter', '2026-10-30', NULL, 'Dear you', 'x')");
});
