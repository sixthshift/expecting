// 023_question_source adds where a question came from and who added it. Run
// against a database built by the migrations before it: the questions
// already kept come through, from nowhere and by nobody.

import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { MIGRATIONS_DIR, migrate } from "../../src/db/migrations/migrate";

const sql = Object.fromEntries(
  readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && f < "024")
    .map((f) => [f, readFileSync(join(MIGRATIONS_DIR, f), "utf8")])
);
const before = Object.fromEntries(Object.entries(sql).filter(([f]) => f < "023"));

test("the questions already kept come through, from no entry and by nobody", () => {
  const db = new Database(":memory:");
  migrate(db, { sources: before });
  db.run("INSERT INTO question (id, text, answer, asked_at, created_at) VALUES ('a', 'Is the RSV vaccine free?', 'Yes', 'y', 'x')");
  migrate(db, { sources: sql });
  expect(db.query("SELECT id, text, answer, item_id, by FROM question").all()).toEqual([
    { id: "a", text: "Is the RSV vaccine free?", answer: "Yes", item_id: null, by: null },
  ]);
});
