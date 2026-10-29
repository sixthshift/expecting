import { describe, expect, test } from "vitest";
import { tailorItems } from "../../../src/features/library/useItems";
import { tailorTasks } from "../../../src/features/tasks/useTasks";
import type { ISODate } from "../../../src/lib/dates";

const ids = (facts: Record<string, string>, on: string[] = []) => new Set(tailorItems(facts, new Set(on)).map((i) => i.id));

describe("tailorItems", () => {
  test("an answer hides what it doesn't fit, and an unknown one hides nothing", () => {
    expect(ids({}).has("anti-d")).toBe(true);
    expect(ids({ rhd: "negative" }).has("anti-d")).toBe(true);
    expect(ids({ rhd: "positive" }).has("anti-d")).toBe(false);
  });

  test("an extra's items appear only once it's on", () => {
    expect(ids({}).has("baby-shower")).toBe(false);
    expect(ids({}, ["baby-shower"]).has("baby-shower")).toBe(true);
  });
});

describe("tailorTasks", () => {
  const due = "2027-04-01" as ISODate;

  test("only the tasks of the items shown", () => {
    const items = tailorItems({ rhd: "positive" }, new Set());
    expect(tailorTasks(items, {}, due, []).some((t) => t.itemId === "anti-d")).toBe(false);
  });

  test("own tasks join the checklist", () => {
    const tasks = tailorTasks([], {}, due, [{ id: "x", title: "Buy a pram", week: 30, createdAt: "2026-10-01" }]);
    expect(tasks.find((t) => t.id === "x")?.origin).toBe("own");
  });
});
