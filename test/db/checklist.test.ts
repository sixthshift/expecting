import { expect, test } from "vitest";
import { ChecklistRepo } from "../../src/db/models/checklist/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();

test("tick, tick again, untick", () => {
  const repo = new ChecklistRepo(db());
  repo.setTicked("book-rsv-vaccine", true, new Date("2026-10-01T00:00:00Z"));
  repo.setTicked("book-rsv-vaccine", true, new Date("2026-10-02T00:00:00Z"));
  expect(repo.ticks()).toEqual({ "book-rsv-vaccine": "2026-10-01T00:00:00.000Z" });
  repo.setTicked("book-rsv-vaccine", false);
  expect(repo.ticks()).toEqual({});
});

test("own tasks are added, found, and deleted with their tick", () => {
  const repo = new ChecklistRepo(db());
  const task = repo.addOwnTask({ title: "Ask Mum about the cot", week: 30 });
  expect(repo.hasOwnTask(task.id)).toBe(true);
  expect(repo.ownTasks()).toEqual([task]);
  repo.setTicked(task.id, true);
  repo.deleteOwnTask(task.id);
  expect(repo.ownTasks()).toEqual([]);
  expect(repo.ticks()).toEqual({});
});

test("an own task keeps the id its phone gave it, and the same save sent twice adds it once", () => {
  const repo = new ChecklistRepo(db());
  const id = "11111111-1111-4111-8111-111111111111";
  repo.addOwnTask({ id, title: "Ask Mum about the cot", week: 30 }, new Date("2026-10-01T00:00:00Z"));
  repo.addOwnTask({ id, title: "Ask Mum about the cot", week: 30 }, new Date("2026-10-02T00:00:00Z"));
  expect(repo.ownTasks()).toEqual([{ id, title: "Ask Mum about the cot", week: 30, createdAt: "2026-10-01T00:00:00.000Z" }]);
});
