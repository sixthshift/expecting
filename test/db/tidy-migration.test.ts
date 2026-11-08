// 040_tidy clears what later changes left behind. Run against a database built
// by the migrations before it, with foreign keys on as the store opens it: a
// first put aside goes, a marked one keeps its words, and a day is required.

import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { MIGRATIONS_DIR, migrate } from "../../src/db/migrations/migrate";

const sql = Object.fromEntries(
  readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && f < "041")
    .map((f) => [f, readFileSync(join(MIGRATIONS_DIR, f), "utf8")])
);
const before = Object.fromEntries(Object.entries(sql).filter(([f]) => f < "040"));

test("a first put aside goes, a marked one keeps its words, and the rest left behind is dropped", () => {
  const db = new Database(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  migrate(db, { sources: before });
  db.run("INSERT INTO person (id, name, role, created_at, password_hash, password_set_at) VALUES ('1', 'Sam', 'carrying', 'x', 'h', 'x')");
  db.run("INSERT INTO first_mark (key, day, by, created_at) VALUES ('first-kick', '2026-07-14', '1', 'x'), ('showing', NULL, '1', 'x')");
  db.run("INSERT INTO first_words (key, by, body, edited_at) VALUES ('first-kick', '1', 'On the couch', 'x')");
  db.run("INSERT INTO journal_seen (person_id, seen_at) VALUES ('1', 'x')");
  migrate(db, { sources: sql });

  expect(db.query("SELECT key, day FROM first_mark").all()).toEqual([{ key: "first-kick", day: "2026-07-14" }]);
  expect(db.query("SELECT key, body FROM first_words").all()).toEqual([{ key: "first-kick", body: "On the couch" }]);
  expect(() => db.run("INSERT INTO first_mark (key, day, created_at) VALUES ('heartbeat', NULL, 'x')")).toThrow(/NOT NULL/);
  // The words still follow their first.
  db.run("DELETE FROM first_mark WHERE key = 'first-kick'");
  expect(db.query("SELECT count(*) AS n FROM first_words").get()).toEqual({ n: 0 });
  expect(db.query("SELECT name FROM sqlite_master WHERE name = 'journal_seen'").get()).toBeNull();
  expect(db.query("SELECT password_hash AS hash FROM person").get()).toEqual({ hash: "h" });
  expect(db.query("PRAGMA foreign_key_check").all()).toEqual([]);
});
