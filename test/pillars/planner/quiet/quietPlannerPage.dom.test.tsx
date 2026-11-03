import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Item, Task } from "../../../../src/content/schema";
import type { QuietPlannerPage } from "../../../../src/pillars/planner/quiet/contexts/QuietPlannerPageContext";

// The quiet Planner's context: what has happened, and what was set in motion.
let quiet: { kind: string } | null = null;
let ticks: Record<string, string> = {};
const items = [
  { id: "parental-leave-pay-claim", type: "payment" },
  { id: "antenatal-class", type: "guide" },
] as Item[];
const task = (id: string, itemId: string | null) => ({ id, title: id, itemId }) as Task;
const tasks = [task("claim", "parental-leave-pay-claim"), task("class", "antenatal-class"), task("mine", null), task("not-yet", "antenatal-class")];
vi.mock("../../../../src/api/rpc/quiet", () => ({ useQuietQuery: () => ({ data: quiet }) }));
vi.mock("../../../../src/api/rpc/checklist", () => ({
  useChecklistQuery: ({ select }: { select: (c: { ticks: Record<string, string> }) => unknown }) => ({ data: select({ ticks }) }),
}));
vi.mock("../../../../src/pillars/library/hooks/useItems", () => ({ useItems: () => items }));
vi.mock("../../../../src/pillars/planner/features/tasks/hooks/useTasks", () => ({ useTasks: () => tasks }));

const { QuietPlannerPageProvider, useQuietPlannerPage } = await import("../../../../src/pillars/planner/quiet/contexts/QuietPlannerPageContext");

let seen: QuietPlannerPage;
function Probe() {
  seen = useQuietPlannerPage();
  return null;
}
const page = () =>
  render(
    <QuietPlannerPageProvider>
      <Probe />
    </QuietPlannerPageProvider>
  );

beforeEach(() => {
  quiet = { kind: "loss" };
  ticks = {};
});
afterEach(cleanup);

describe("QuietPlannerPageProvider", () => {
  it("says what has happened", () => {
    page();
    expect(seen.kind).toBe("loss");
  });

  it("what was set in motion: the ticked tasks, claims apart from bookings", () => {
    ticks = { claim: "t", class: "t", mine: "t" };
    page();
    expect(seen.inMotion.claims.map((t) => t.id)).toEqual(["claim"]);
    expect(seen.inMotion.bookings.map((t) => t.id)).toEqual(["class", "mine"]);
  });
});
