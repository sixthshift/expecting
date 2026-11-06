import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { appointment, question, reset, state } from "./planner-mocks";

// The questions, each for an appointment: grouped on the Questions page, moved
// to another, marked asked (and undone), and asked again, keeping the record.

const { QuestionsSection } = await import("../../../../../src/pillars/planner/components/questions/Questions");
const { OpenQuestion } = await import("../../../../../src/pillars/planner/features/questions/components/OpenQuestion");
const { AskedQuestion } = await import("../../../../../src/pillars/planner/features/questions/components/AskedQuestion");

const MIDWIFE = appointment("a-next", "Midwife", 2);
const SCAN = appointment("a-scan", "20-week scan", 14);
const GP = appointment("a-gp", "GP", 30);
const BEEN = appointment("a-been", "Bloods", -5);

beforeEach(reset);
afterEach(cleanup);

const group = (name: RegExp) => screen.getByRole("region", { name });

describe("the Questions page", () => {
  it("groups them by appointment: the next always, later ones with a question, then what's left over", () => {
    state.appointments = [MIDWIFE, SCAN, GP, BEEN];
    state.questions = [
      question("q1", "Can we see the face?", SCAN.id),
      question("q2", "Was my iron OK?", BEEN.id),
      question("q3", "Can I fly?", null),
      question("q4", "Is the bump measuring right?", BEEN.id, { askedAt: "2026-10-01T00:00:00Z", answer: "Spot on." }),
    ];
    render(<QuestionsSection />);
    // The next with nothing yet, and the scan with its question; the GP has none, so isn't there.
    expect(within(group(/^Midwife, /)).getByText(/Nothing to ask yet/)).toBeTruthy();
    expect(within(group(/^20-week scan, /)).getByText("Can we see the face?")).toBeTruthy();
    expect(screen.queryByRole("region", { name: /^GP, / })).toBeNull();
    // Left open at one gone by: it stays there.
    expect(within(group(/^Not asked at Bloods, /)).getByText("Was my iron OK?")).toBeTruthy();
    // Its appointment deleted: only a move, no "Asked it".
    const none = group(/^Its appointment deleted/);
    expect(within(none).getByText("Can I fly?")).toBeTruthy();
    expect(within(none).queryByRole("button", { name: "Asked it" })).toBeNull();
    expect(within(none).getByRole("button", { name: "Move to another" })).toBeTruthy();
    // What was asked is folded away, by where.
    expect(screen.queryByText("Spot on.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /^Asked ?1$/, expanded: false }));
    expect(screen.getAllByRole("region", { name: /^Bloods, / }).some((r) => within(r).queryByText("Spot on."))).toBe(true);
  });

  it("with nothing booked, asks for the appointment before the question", () => {
    state.questions = [question("q3", "Can I fly?", null)];
    render(<QuestionsSection />);
    expect(screen.queryByRole("textbox", { name: "New question" })).toBeNull();
    expect(screen.getAllByText(/none is booked/).length).toBeGreaterThan(0);
  });

  it("adds a question for the next appointment, or the one chosen", () => {
    state.appointments = [MIDWIFE, SCAN];
    render(<QuestionsSection />);
    const box = screen.getByRole("textbox", { name: "New question" });
    fireEvent.change(box, { target: { value: "Can we bring our own pillows?" } });
    fireEvent.click(screen.getByRole("button", { name: "Add question" }));
    fireEvent.change(box, { target: { value: "Can we see the face?" } });
    fireEvent.change(screen.getByRole("combobox", { name: "For which appointment" }), { target: { value: SCAN.id } });
    fireEvent.click(screen.getByRole("button", { name: "Add question" }));
    expect(state.saved.map((s) => s.input)).toEqual([
      expect.objectContaining({ text: "Can we bring our own pillows?", appointmentId: MIDWIFE.id }),
      expect.objectContaining({ text: "Can we see the face?", appointmentId: SCAN.id }),
    ]);
  });
});

describe("an open question", () => {
  it("moves to another appointment still ahead, never to its own", () => {
    state.appointments = [MIDWIFE, SCAN, BEEN];
    const q = question("q1", "Can we see the face?", MIDWIFE.id);
    render(<OpenQuestion question={q} />);
    fireEvent.click(screen.getByRole("button", { name: "Move to another" }));
    const choice = screen.getByRole("combobox", { name: /^Move "Can we see the face\?" to/ });
    const offered = within(choice)
      .getAllByRole("option")
      .map((o) => o.textContent)
      .slice(1);
    expect(offered).toEqual([expect.stringMatching(/^20-week scan, /)]);
    fireEvent.change(choice, { target: { value: SCAN.id } });
    expect(state.saved).toEqual([{ key: "moveQuestion", input: { id: "q1", appointmentId: SCAN.id } }]);
    expect(state.toasts[0]!.title).toMatch(/^Moved to 20-week scan, /);
  });

  it("with nowhere else to go, offers no move", () => {
    state.appointments = [MIDWIFE];
    render(<OpenQuestion question={question("q1", "Can I fly?", MIDWIFE.id)} />);
    expect(screen.queryByRole("button", { name: "Move to another" })).toBeNull();
  });

  it("is marked asked with what you were told, and the toast undoes it", () => {
    state.appointments = [MIDWIFE];
    render(<OpenQuestion question={question("q1", "Is my iron OK?", MIDWIFE.id)} />);
    fireEvent.click(screen.getByRole("button", { name: "Asked it" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Answer" }), { target: { value: "Ferritin 18." } });
    fireEvent.click(screen.getByRole("button", { name: "Save as asked" }));
    expect(state.saved).toEqual([{ key: "markAsked", input: { id: "q1", answer: "Ferritin 18." } }]);
    expect(state.toasts[0]).toMatchObject({ title: "Marked asked", action: "Undo" });
    state.toasts[0]!.onAction!();
    expect(state.saved[1]).toEqual({ key: "reopenQuestion", input: { id: "q1" } });
  });
});

describe("an asked question", () => {
  const asked = question("q1", "Is my iron OK?", BEEN.id, { askedAt: "2026-10-01T00:00:00Z", answer: "Fine.", itemId: "anaemia" });

  it("says where it was asked, when that isn't the group it's under", () => {
    state.appointments = [BEEN];
    state.questions = [asked];
    render(<AskedQuestion question={asked} where />);
    expect(screen.getByText(/^Asked at Bloods, /)).toBeTruthy();
  });

  it("asked again, is added afresh for the one appointment ahead, keeping this one", () => {
    state.appointments = [BEEN, MIDWIFE];
    state.questions = [asked];
    render(<AskedQuestion question={asked} />);
    fireEvent.click(screen.getByRole("button", { name: "Ask again" }));
    expect(state.saved).toEqual([
      { key: "addQuestion", input: { id: expect.any(String), text: "Is my iron OK?", itemId: "anaemia", appointmentId: MIDWIFE.id } },
    ]);
    expect(state.saved.some((s) => s.key === "reopenQuestion")).toBe(false);
  });

  it("with several ahead, asks which; with it already waiting there, says so", () => {
    state.appointments = [BEEN, MIDWIFE, SCAN];
    state.questions = [asked];
    const { unmount } = render(<AskedQuestion question={asked} />);
    fireEvent.click(screen.getByRole("button", { name: "Ask again" }));
    fireEvent.change(screen.getByRole("combobox", { name: /^Ask "Is my iron OK\?" again at/ }), { target: { value: SCAN.id } });
    expect(state.saved[0]!.input).toMatchObject({ appointmentId: SCAN.id });
    unmount();

    state.questions = [asked, question("q2", "is my iron ok", SCAN.id)];
    render(<AskedQuestion question={asked} />);
    expect(screen.queryByRole("button", { name: "Ask again" })).toBeNull();
    expect(screen.getByText(/^Asking again, 20-week scan, /)).toBeTruthy();
  });

  it("with nothing booked, asks for the appointment first", () => {
    state.appointments = [BEEN];
    state.questions = [asked];
    render(<AskedQuestion question={asked} />);
    fireEvent.click(screen.getByRole("button", { name: "Ask again" }));
    expect(screen.getByRole("heading", { name: "Which appointment is it for?" })).toBeTruthy();
    expect(state.saved).toEqual([]);
  });
});
