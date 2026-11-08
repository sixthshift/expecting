import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addDays, todayISO } from "../../../../src/lib/dates";
import type { Appointment } from "../../../../src/lib/planner/appointments";

// The appointments split for both of the Planner's worlds: today's is the next.
let appointments: Appointment[] = [];
vi.mock("../../../../src/api/rpc/appointments", () => ({ useAppointmentsQuery: () => ({ data: appointments }) }));

const { useAppointmentsAhead } = await import("../../../../src/pillars/planner/hooks/useAppointmentsAhead");

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

afterEach(cleanup);

describe("useAppointmentsAhead", () => {
  it("the next appointment is today's, the rest ahead in order, those gone latest first", () => {
    appointments = [appointment("scan", 7), appointment("gone", -10), appointment("midwife", 0, "10:30"), appointment("yesterday", -1), appointment("gp", 3)];
    const { result } = renderHook(() => useAppointmentsAhead());
    expect(result.current.next?.id).toBe("midwife");
    expect(result.current.ahead.map((a) => a.id)).toEqual(["midwife", "gp", "scan"]);
    expect(result.current.later.map((a) => a.id)).toEqual(["gp", "scan"]);
    expect(result.current.past.map((a) => a.id)).toEqual(["yesterday", "gone"]);
  });

  it("no next with none ahead", () => {
    appointments = [appointment("gone", -2)];
    const { result } = renderHook(() => useAppointmentsAhead());
    expect(result.current).toMatchObject({ ahead: [], next: null, later: [] });
  });
});
