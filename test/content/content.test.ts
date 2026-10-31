// The real content/ directory. Loading src/content checks every item's index;
// here every file is parsed whole, its page too, so a malformed body, a
// section its type needs or a related id that isn't there fails here rather
// than on a page.
import { describe, expect, test } from "vitest";
import { builtInItems, builtInTasks, isPrivateItem, loadPage } from "../../src/content";
import { parseAll } from "../../src/content/parse";
import { isDated } from "../../src/content/schema";

const files = import.meta.glob<string>("../../content/items/*.md", { query: "?raw", eager: true, import: "default" });

describe("content/items", () => {
  const whole = parseAll(files);

  test("there is built-in content and every file is valid, page and all", () => {
    expect(builtInItems.length).toBeGreaterThan(0);
  });

  test("the index the app reads is every file's", () => {
    const index = whole.map(({ sources, related, checked, appointment, body, doc, ...item }) => item);
    expect([...builtInItems].sort((a, b) => a.id.localeCompare(b.id))).toEqual(index.sort((a, b) => a.id.localeCompare(b.id)));
  });

  test("a page loads as its file reads", async () => {
    const item = builtInItems.find((i) => i.id === "rsv-vaccine")!;
    const page = await loadPage(item);
    expect(page.body).toBe(whole.find((i) => i.id === "rsv-vaccine")!.body);
    expect(page.sources.length).toBeGreaterThan(0);
  });
});

test("every task falls due within its item's range", () => {
  for (const item of builtInItems.filter(isDated)) {
    for (const task of item.tasks) {
      expect(task.due, `${task.id} is due before ${item.id} starts`).toBeGreaterThanOrEqual(item.from);
      expect(task.due, `${task.id} is due after ${item.id} ends`).toBeLessThanOrEqual(item.to);
    }
  }
});

test("the checklist is every linked task", () => {
  expect(builtInTasks.length).toBe(builtInItems.reduce((n, i) => n + i.tasks.length, 0));
});

test("family violence and reproductive coercion are private", () => {
  const ids = builtInItems.filter((i) => i.private).map((i) => i.id);
  expect(ids).toEqual(expect.arrayContaining(["domestic-violence-in-pregnancy", "reproductive-coercion", "card-asked-about-safety"]));
  for (const id of ids) expect(isPrivateItem(id)).toBe(true);
  expect(isPrivateItem("rsv-vaccine")).toBe(false);
});
