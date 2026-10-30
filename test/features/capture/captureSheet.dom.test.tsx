import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The capture sheet, with the query cache and the outbox stood in for: what
// it offers whom, what each choice keeps, and where it says it went. A
// movement felt as different keeps the call on screen until put away.
const SAM = { id: "sam", name: "Sam", role: "carrying" as const };
let me: typeof SAM | null = SAM;
let quiet: object | null = null;
let now: number | null = 28;
const saved: { key: string; input: unknown }[] = [];
const toasts: { title: string }[] = [];

vi.mock("../../../src/api/rpc/journal", () => ({
  journalSaves: { addNote: { key: "addNote" }, addMovement: { key: "addMovement" } },
  useJournal: () => ({ data: [] }),
}));
vi.mock("../../../src/api/rpc/feelings", () => ({
  feelingsSaves: { addFeeling: { key: "addFeeling" }, changeFeeling: { key: "changeFeeling" } },
  useFeelings: () => ({ data: [] }),
}));
vi.mock("../../../src/api/rpc/questions", () => ({ questionsSaves: { addQuestion: { key: "addQuestion" } } }));
vi.mock("../../../src/api/rpc/checklist", () => ({ checklistSaves: { addOwnTask: { key: "addOwnTask" } } }));
vi.mock("../../../src/api/rpc/people", () => ({ usePeople: () => ({ data: { me, people: [SAM] } }) }));
vi.mock("../../../src/api/rpc/quiet", () => ({ useQuiet: () => ({ data: quiet }) }));
vi.mock("../../../src/api/rpc/settings", () => ({ useNow: () => now }));
vi.mock("../../../src/app/hooks/useSave", () => ({ useSave: (save: { key: string }) => (input: unknown) => saved.push({ key: save.key, input }) }));
vi.mock("../../../src/app/components/layout/CallBirthSuite", () => ({ CallBirthSuite: () => <a href="tel:0390000000">Call the birth suite</a> }));
vi.mock("../../../src/features/library/components/ItemLink", () => ({ ItemLink: ({ children }: { children: ReactNode }) => children }));
vi.mock("@sixthshift/design-system/overlay", () => ({ toast: (t: { title: string }) => toasts.push(t) }));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => () => undefined,
  Link: ({ children }: { children: ReactNode }) => <a href="/emergency">{children}</a>,
}));

const { CaptureSheet } = await import("../../../src/features/capture/components/CaptureSheet");

beforeEach(() => {
  me = SAM;
  quiet = null;
  now = 28;
  saved.length = 0;
  toasts.length = 0;
});

const offered = () =>
  within(screen.getByRole("dialog"))
    .getAllByRole("listitem")
    .map((li) => li.textContent);

describe("CaptureSheet", () => {
  it("offers all five, in their fixed order", () => {
    render(<CaptureSheet onClose={() => undefined} />);
    expect(offered()).toEqual(["The baby moved", "A note", "How I'm feeling", "A question to ask", "Something to do"]);
  });

  it("offers no feeling to a phone that hasn't said who's holding it, and no movement before week 16", () => {
    me = null;
    now = 12;
    render(<CaptureSheet onClose={() => undefined} />);
    expect(offered()).toEqual(["A note", "A question to ask", "Something to do"]);
  });

  it("while something has happened, never a movement and nothing to do", () => {
    quiet = { kind: "loss", setBy: null, setAt: "2026-10-30T00:00:00.000Z" };
    render(<CaptureSheet onClose={() => undefined} />);
    expect(offered()).toEqual(["A note", "How I'm feeling", "A question to ask"]);
  });

  it("keeps a movement in one tap, closes, and says where it went", () => {
    const onClose = vi.fn();
    render(<CaptureSheet onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "The baby moved" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep it" }));
    expect(saved).toEqual([{ key: "addMovement", input: expect.objectContaining({ body: "", different: false }) }]);
    expect(onClose).toHaveBeenCalled();
    expect(toasts.map((t) => t.title)).toEqual(["In the Journal"]);
  });

  it("a movement felt as slower, weaker or stopped is kept, and the call stays on screen until put away", () => {
    const onClose = vi.fn();
    render(<CaptureSheet onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "The baby moved" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Slower, weaker or stopped?" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep it" }));
    expect(saved).toEqual([{ key: "addMovement", input: expect.objectContaining({ different: true }) }]);
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("Call your midwife or birth unit now.")).toBeTruthy();
    expect(within(alert).getByRole("link", { name: "Call the birth suite" })).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("files a question in the Planner", () => {
    const onClose = vi.fn();
    render(<CaptureSheet onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "A question to ask" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Is the glucose test fasting?" } });
    fireEvent.submit(screen.getByRole("textbox").closest("form")!);
    expect(saved).toEqual([{ key: "addQuestion", input: expect.objectContaining({ text: "Is the glucose test fasting?" }) }]);
    expect(toasts.map((t) => t.title)).toEqual(["In the Planner"]);
    expect(onClose).toHaveBeenCalled();
  });

  it("goes back from a form to what to add", () => {
    render(<CaptureSheet onClose={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "A note" }));
    fireEvent.click(screen.getByRole("button", { name: "Back to what to add" }));
    expect(offered()).toHaveLength(5);
  });
});
