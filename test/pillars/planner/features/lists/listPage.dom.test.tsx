import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Line, Task } from "../../../../../src/content/schema";
import type { ListPage } from "../../../../../src/pillars/planner/features/lists/contexts/ListPageContext";

// One list's context: whether it's yours, how it's summed up, and what a
// line's task says under it (done, best by and soon, or nothing).
const OWN = { id: "11111111-1111-4111-8111-111111111111", title: "For the car", by: null, createdAt: "2026-10-01T00:00:00.000Z" };
const line = (id: string, taskId: string | null): Line => ({ id, title: id, listId: OWN.id, section: null, when: {}, taskId, itemId: null, origin: "own" });
let ticks: Record<string, unknown> = {};
let now: number | null = 28;
const lines = [line("seat", "fit-car-seat"), line("mirror", "buy-mirror"), line("shade", null)];
const tasks = [
  { id: "fit-car-seat", due: 30 },
  { id: "buy-mirror", due: 36 },
] as Task[];
vi.mock("../../../../../src/pillars/planner/features/lists/hooks/useLines", () => ({ useLines: () => lines }));
vi.mock("../../../../../src/pillars/planner/features/tasks/hooks/useTasks", () => ({ useTasks: () => tasks }));
vi.mock("../../../../../src/api/rpc/lists", () => ({ useListsQuery: () => ({ data: { ownLists: [OWN], ownLines: [], marks: {} } }) }));
vi.mock("../../../../../src/api/rpc/checklist", () => ({ useChecklistQuery: () => ({ data: ticks }) }));
vi.mock("../../../../../src/api/rpc/settings", () => ({ useNow: () => now }));

const { ListPageProvider, useListPage } = await import("../../../../../src/pillars/planner/features/lists/contexts/ListPageContext");

let seen: ListPage;
function Probe() {
  seen = useListPage();
  return null;
}
const page = (listId: string) =>
  render(
    <ListPageProvider listId={listId}>
      <Probe />
    </ListPageProvider>
  );

beforeEach(() => {
  ticks = {};
  now = 28;
});
afterEach(cleanup);

describe("ListPageProvider", () => {
  it("one of your own: renameable, summed up, nothing got yet", () => {
    page(OWN.id);
    expect(seen.own).toEqual({ id: OWN.id, title: "For the car" });
    expect(seen.summary).toMatchObject({ id: OWN.id, origin: "own", left: 3, got: 0, total: 3 });
    expect(seen.leftOnly).toBe(false);
  });

  it("a list that isn't here has no summary, and isn't yours", () => {
    page("22222222-2222-4222-8222-222222222222");
    expect(seen.summary).toBeUndefined();
    expect(seen.own).toBeNull();
  });

  it("a line's task: best by its week, a warning within two weeks of it", () => {
    page(OWN.id);
    expect(seen.taskOf(lines[0]!)).toEqual({ label: "by week 30", soon: true, done: false });
    expect(seen.taskOf(lines[1]!)).toEqual({ label: "by week 36", soon: false, done: false });
    expect(seen.taskOf(lines[2]!)).toBeNull();
  });

  it("a task ticked in To do says so; without a due date, nothing is soon", () => {
    ticks = { "fit-car-seat": { by: null, at: "2026-10-30T00:00:00.000Z" } };
    now = null;
    page(OWN.id);
    expect(seen.taskOf(lines[0]!)).toEqual({ label: "done in To do", soon: false, done: true });
    expect(seen.taskOf(lines[1]!)?.soon).toBe(false);
  });
});
