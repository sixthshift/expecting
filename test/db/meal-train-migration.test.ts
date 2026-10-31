// 028_meal_train_into_help folds the Meal train extra into Lining up help. Run
// against a database built by the migrations before it: a choice made for the
// meal train carries over, on if either was on, and its row goes.

import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { MIGRATIONS_DIR, migrate } from "../../src/db/migrations/migrate";

const sql = Object.fromEntries(
  readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && f < "029")
    .map((f) => [f, readFileSync(join(MIGRATIONS_DIR, f), "utf8")])
);
const before = Object.fromEntries(Object.entries(sql).filter(([f]) => f < "028"));

function after(rows: [string, 0 | 1, string][]) {
  const db = new Database(":memory:");
  migrate(db, { sources: before });
  for (const [id, on, at] of rows) db.run('INSERT INTO extra (id, "on", changed_at) VALUES (?, ?, ?)', [id, on, at]);
  migrate(db, { sources: sql });
  return db.query('SELECT id, "on" AS "on", changed_at FROM extra ORDER BY id').all();
}

test("the meal train turned on turns Lining up help on", () => {
  expect(after([["meal-train", 1, "b"]])).toEqual([{ id: "help-network", on: 1, changed_at: "b" }]);
  expect(
    after([
      ["meal-train", 1, "b"],
      ["help-network", 0, "a"],
    ])
  ).toEqual([{ id: "help-network", on: 1, changed_at: "b" }]);
});

test("Lining up help's own choice stands otherwise", () => {
  expect(
    after([
      ["meal-train", 0, "b"],
      ["help-network", 1, "a"],
    ])
  ).toEqual([{ id: "help-network", on: 1, changed_at: "a" }]);
  expect(after([["meal-train", 0, "b"]])).toEqual([{ id: "help-network", on: 0, changed_at: "b" }]);
  expect(
    after([
      ["help-network", 0, "a"],
      ["nursery", 1, "a"],
    ])
  ).toEqual([
    { id: "help-network", on: 0, changed_at: "a" },
    { id: "nursery", on: 1, changed_at: "a" },
  ]);
});
