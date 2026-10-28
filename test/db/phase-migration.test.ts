// 006_phase renames stored words: own tasks' "before" phase, and the
// "stage" answer. Run against a database built by the migrations before it,
// with the old words in it, the way a household's real one is.

import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { MIGRATIONS_DIR, migrate } from "../../src/db/migrations/migrate";

// Up to and including 006: later migrations reshape what it wrote.
const sql = Object.fromEntries(
  readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && f < "007")
    .map((f) => [f, readFileSync(join(MIGRATIONS_DIR, f), "utf8")])
);
const before = Object.fromEntries(Object.entries(sql).filter(([f]) => f < "006"));

function oldDatabase(profile: object): Database {
  const db = new Database(":memory:");
  migrate(db, { sources: before });
  db.run("INSERT INTO household (id, updated_at, profile) VALUES (1, 'x', ?)", [JSON.stringify(profile)]);
  db.run("INSERT INTO own_task (id, title, phase, week, created_at) VALUES ('a', 'Get cover', 'before', NULL, 'x'), ('b', 'Pack', 'pregnancy', 36, 'x')");
  return db;
}

const profileOf = (db: Database) => JSON.parse(db.query<{ profile: string }, []>("SELECT profile FROM household").get()!.profile);

test("an own task due before a pregnancy is due in preconception", () => {
  const db = oldDatabase({});
  migrate(db, { sources: sql });
  expect(db.query("SELECT id, phase, week FROM own_task ORDER BY id").all()).toEqual([
    { id: "a", phase: "preconception", week: null },
    { id: "b", phase: "pregnancy", week: 36 },
  ]);
});

test.each([
  ["trying", "not-yet"],
  ["pregnant", "yes"],
])("the stage answer %s becomes expecting: %s, and the other answers stay", (old, answer) => {
  const db = oldDatabase({ stage: old, cover: "no" });
  migrate(db, { sources: sql });
  expect(profileOf(db)).toEqual({ expecting: answer, cover: "no" });
});

test("a household that never answered keeps no answer", () => {
  const db = oldDatabase({ cover: "yes" });
  migrate(db, { sources: sql });
  expect(profileOf(db)).toEqual({ cover: "yes" });
});
