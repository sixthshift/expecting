// 008_facts moves the household's answers, a JSON object on its row, into the
// answer table, as the household's, and drops the column. Run against a
// database built by the migrations before it, the way a household's real one is.

import { Database } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { MIGRATIONS_DIR, migrate } from "../../src/db/migrations/migrate";

const sql = Object.fromEntries(
  readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && f < "009")
    .map((f) => [f, readFileSync(join(MIGRATIONS_DIR, f), "utf8")])
);
const before = Object.fromEntries(Object.entries(sql).filter(([f]) => f < "008"));

test("each answer becomes the household's, answered when the household was last saved", () => {
  const db = new Database(":memory:");
  migrate(db, { sources: before });
  db.run("INSERT INTO household (id, updated_at, profile) VALUES (1, '2026-10-01T00:00:00.000Z', ?)", [JSON.stringify({ cover: "no", state: "vic" })]);
  migrate(db, { sources: sql });

  const rows = db.query<Record<string, unknown>, []>("SELECT * FROM answer ORDER BY question").all();
  expect(rows.map(({ id: _, ...r }) => r)).toEqual([
    { question: "cover", about: "household", value: "no", answered_by: null, answered_at: "2026-10-01T00:00:00.000Z" },
    { question: "state", about: "household", value: "vic", answered_by: null, answered_at: "2026-10-01T00:00:00.000Z" },
  ]);
  for (const r of rows) expect(r.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  expect(db.query<Record<string, unknown>, []>("SELECT * FROM household").get()).not.toHaveProperty("profile");
});
