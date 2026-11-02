import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addDays, todayISO } from "../../../src/lib/dates";
import type { Appointment } from "../../../src/lib/planner/appointments";
import type { PlannerPage } from "../../../src/pillars/planner/contexts/PlannerPageContext";

// The Planner's context: the appointments split once (today's is the next),
// what has happened, and a task ticked during this visit kept in place.
let appointments: Appointment[] = [];
let quiet: { kind: string } | null = null;
const planned: ReadonlySet<string>[] = [];
vi.mock("../../../src/api/rpc/appointments", () => ({ useAppointmentsQuery: () => ({ data: appointments }) }));
vi.mock("../../../src/api/rpc/quiet", () => ({ useQuietQuery: () => ({ data: quiet }) }));
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

function appointment(id: string, inDays: number, time: string | null = null): Appointment {
  return {
    id,
    title: id,
    day: addDays(todayISO(), inDays),
    time,
    place: null,
    notes: null,
    by: null,
    createdAt: "2026-10-01T00:00:00.000Z",
    editedBy: null,
    editedAt: null,
  };
}

beforeEach(() => {
  appointments = [];
  quiet = null;
  planned.length = 0;
});
afterEach(cleanup);

describe("PlannerPageProvider", () => {
  it("the next appointment is today's, the rest ahead in order, those gone latest first", () => {
    appointments = [appointment("scan", 7), appointment("gone", -10), appointment("midwife", 0, "10:30"), appointment("yesterday", -1), appointment("gp", 3)];
    page();
    expect(seen.appointments.next?.id).toBe("midwife");
    expect(seen.appointments.later.map((a) => a.id)).toEqual(["gp", "scan"]);
    expect(seen.appointments.past.map((a) => a.id)).toEqual(["yesterday", "gone"]);
  });

  it("no next with none ahead", () => {
    appointments = [appointment("gone", -2)];
    page();
    expect(seen.appointments).toMatchObject({ next: null, later: [] });
  });

  it("says what has happened, and this week", () => {
    quiet = { kind: "loss" };
    page();
    expect(seen).toMatchObject({ now: 28, quiet: "loss" });
  });

  it("a task ticked here goes to the plan, to be kept in place", () => {
    page();
    expect(planned.at(-1)?.size).toBe(0);
    act(() => seen.stay("book-scan"));
    expect([...(planned.at(-1) ?? [])]).toEqual(["book-scan"]);
  });
});
