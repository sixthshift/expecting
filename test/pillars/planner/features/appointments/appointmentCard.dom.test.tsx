import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { appointment, question, reset, state } from "../questions/planner-mocks";

// An appointment's card: one gone by keeps what was asked there; deleted, its
// questions are for none, and undoing the delete gives them back to it.

const { AppointmentCard } = await import("../../../../../src/pillars/planner/features/appointments/components/AppointmentCard");

beforeEach(reset);
afterEach(cleanup);

describe("an appointment's card", () => {
  it("gone by, keeps what was asked there and says what wasn't", () => {
    const been = appointment("a-been", "Bloods", -5);
    state.appointments = [been];
    state.questions = [
      question("q1", "Is my iron OK?", been.id, { askedAt: "2026-10-01T00:00:00Z", answer: "Ferritin 18." }),
      question("q2", "Can I fly?", been.id),
      question("q3", "Elsewhere?", "a-other", { askedAt: "2026-10-01T00:00:00Z" }),
    ];
    render(<AppointmentCard appointment={been} />);
    const record = screen.getByRole("region", { name: "What you asked" });
    expect(record.textContent).toContain("Is my iron OK?");
    expect(record.textContent).toContain("Ferritin 18.");
    expect(record.textContent).toContain("1 question not asked");
    expect(record.textContent).not.toContain("Elsewhere?");
  });

  it("still ahead, has no record yet", () => {
    const next = appointment("a-next", "Midwife", 2);
    state.appointments = [next];
    state.questions = [question("q1", "Can I fly?", next.id)];
    render(<AppointmentCard appointment={next} />);
    expect(screen.queryByRole("region", { name: "What you asked" })).toBeNull();
  });

  it("deleted, then undone, comes back with its questions", () => {
    const next = appointment("a-next", "Midwife", 2);
    state.appointments = [next];
    state.questions = [question("q1", "Can I fly?", next.id), question("q2", "Was it fine?", next.id, { askedAt: "x" }), question("q3", "Other", "a-x")];
    render(<AppointmentCard appointment={next} />);
    fireEvent.click(screen.getByRole("button", { name: 'Delete "Midwife"' }));
    expect(state.saved).toEqual([{ key: "deleteAppointment", input: { id: next.id } }]);
    expect(state.toasts[0]).toMatchObject({ title: "Appointment deleted", action: "Undo" });
    state.toasts[0]!.onAction!();
    // The appointment first, then each of its questions back to it, in that order.
    expect(state.saved.slice(1)).toEqual([
      { key: "addAppointment", input: expect.objectContaining({ id: next.id, title: "Midwife" }) },
      { key: "moveQuestion", input: { id: "q1", appointmentId: next.id } },
      { key: "moveQuestion", input: { id: "q2", appointmentId: next.id } },
    ]);
  });
});
