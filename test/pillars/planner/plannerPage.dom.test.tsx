import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PlannerPage } from "../../../src/pillars/planner/contexts/PlannerPageContext";

// The Planner's context: this week, and a task ticked during this visit kept in place.
const planned: ReadonlySet<string>[] = [];
vi.mock("../../../src/api/rpc/settings", () => ({ useNow: () => 28 }));
vi.mock("../../../src/pillars/planner/hooks/usePlan", () => ({
  usePlan: (tickedHere: ReadonlySet<string>) => {
    planned.push(tickedHere);
    return { plan: {}, stages: [] };
  },
}));

const { PlannerPageProvider, usePlannerPage } = await import("../../../src/pillars/planner/contexts/PlannerPageContext");

let seen: PlannerPage;
function Probe() {
  seen = usePlannerPage();
  return null;
}
const page = () =>
  render(
    <PlannerPageProvider>
      <Probe />
    </PlannerPageProvider>
  );

beforeEach(() => {
  planned.length = 0;
});
afterEach(cleanup);

describe("PlannerPageProvider", () => {
  it("says this week, and nothing of quiet", () => {
    page();
    expect(seen.now).toBe(28);
    expect(seen).not.toHaveProperty("quiet");
  });

  it("a task ticked here goes to the plan, to be kept in place", () => {
    page();
    expect(planned.at(-1)?.size).toBe(0);
    act(() => seen.stay("book-scan"));
    expect([...(planned.at(-1) ?? [])]).toEqual(["book-scan"]);
  });
});
