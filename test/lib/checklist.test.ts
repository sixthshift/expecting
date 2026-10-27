import { expect, test } from "vitest";
import type { Task } from "../../src/content/schema";
import { buildChecklist, overdue } from "../../src/lib/checklist";

const builtIn: Task[] = [
  { id: "b", title: "B", due: { phase: "pregnancy", week: 32 }, itemId: "x", origin: "built-in" },
  { id: "a", title: "A", due: { phase: "preconception" }, itemId: "y", origin: "built-in" },
];

test("built-in and own tasks are merged in due order", () => {
  const own = [{ id: "o", title: "Own", phase: "pregnancy" as const, week: 20, createdAt: "2026-10-27T00:00:00Z" }];
  expect(buildChecklist(builtIn, own).map((t) => t.id)).toEqual(["a", "o", "b"]);
});

test("overdue is unticked and due before now", () => {
  const tasks = buildChecklist(builtIn, []);
  expect(overdue(tasks, {}, { phase: "pregnancy", week: 33 }).map((t) => t.id)).toEqual(["a", "b"]);
  expect(overdue(tasks, { a: "2026-01-01" }, { phase: "pregnancy", week: 32 }).map((t) => t.id)).toEqual([]);
});
