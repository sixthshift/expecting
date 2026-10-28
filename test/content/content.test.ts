// The real content/ directory. Loading the module parses and validates every
// file, so a malformed item fails here rather than on a page.
import { expect, test } from "vitest";
import { builtInItems, builtInTasks, covers } from "../../src/content";
import { allWeeks } from "../../src/lib/timeline";

test("there is built-in content and every item is valid", () => {
  expect(builtInItems.length).toBeGreaterThan(0);
});

test("every task falls due within its item's range", () => {
  for (const item of builtInItems) {
    for (const task of item.tasks) {
      expect(task.due, `${task.id} is due before ${item.id} starts`).toBeGreaterThanOrEqual(item.from);
      expect(task.due, `${task.id} is due after ${item.id} ends`).toBeLessThanOrEqual(item.to);
    }
  }
});

test("every item shows on at least one week", () => {
  for (const item of builtInItems)
    expect(
      allWeeks().some((w) => covers(item, w)),
      item.id
    ).toBe(true);
});

test("the checklist is every linked task", () => {
  expect(builtInTasks.length).toBe(builtInItems.reduce((n, i) => n + i.tasks.length, 0));
});
