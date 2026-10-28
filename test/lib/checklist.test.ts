import { expect, test } from "vitest";
import type { Task } from "../../src/content/schema";
import { buildChecklist, overdue } from "../../src/lib/checklist";

const builtIn: Task[] = [
  { id: "b", title: "B", opens: 1, due: 32, deadline: null, deadlineFrom: null, who: "together", itemId: "x", origin: "built-in" },
  { id: "a", title: "A", opens: 1, due: 6, deadline: null, deadlineFrom: null, who: "together", itemId: "y", origin: "built-in" },
];

test("built-in and own tasks are merged in due order", () => {
  const own = [{ id: "o", title: "Own", week: 20, createdAt: "2026-10-27T00:00:00Z" }];
  expect(buildChecklist(builtIn, own).map((t) => t.id)).toEqual(["a", "o", "b"]);
});

test("overdue is unticked and due before now", () => {
  const tasks = buildChecklist(builtIn, []);
  expect(overdue(tasks, {}, 33).map((t) => t.id)).toEqual(["a", "b"]);
  expect(overdue(tasks, { a: "2026-01-01" }, 32).map((t) => t.id)).toEqual([]);
});
