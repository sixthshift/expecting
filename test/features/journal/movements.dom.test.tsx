import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { todayISO } from "../../../src/lib/dates";
import type { JournalEntry } from "../../../src/lib/journal";

// Movements in the Journal, with the query cache and the outbox stood in for:
// a change to slower, weaker or stopped shows the call as a new one does, and
// while something has happened what was kept is folded away, not shown.
const SAM = { id: "sam", name: "Sam", role: "carrying" as const };
const moved: JournalEntry = {
  id: "m1",
  kind: "movement",
  day: todayISO(),
  time: "21:15",
  body: "Hiccups",
  different: false,
  by: SAM.id,
  createdAt: `${todayISO()}T00:00:00.000Z`,
  editedBy: null,
  editedAt: null,
};
let journal: JournalEntry[] = [];
const saved: { key: string; input: unknown }[] = [];

vi.mock("../../../src/api/rpc/journal", () => ({
  journalSaves: {
    addNote: { key: "addNote" },
    editNote: { key: "editNote" },
    deleteNote: { key: "deleteNote" },
    restoreNote: { key: "restoreNote" },
    addMovement: { key: "addMovement" },
    editMovement: { key: "editMovement" },
    deleteMovement: { key: "deleteMovement" },
    restoreMovement: { key: "restoreMovement" },
  },
  useJournal: () => ({ data: journal }),
}));
vi.mock("../../../src/api/rpc/people", () => ({ usePeople: () => ({ data: { me: SAM, people: [SAM] } }) }));
vi.mock("../../../src/app/hooks/useSave", () => ({ useSave: (save: { key: string }) => (input: unknown) => saved.push({ key: save.key, input }) }));
vi.mock("../../../src/app/components/layout/CallBirthSuite", () => ({ CallBirthSuite: () => <a href="tel:0390000000">Call the birth suite</a> }));
vi.mock("../../../src/features/library/components/ItemLink", () => ({ ItemLink: ({ children }: { children: ReactNode }) => children }));
vi.mock("@sixthshift/design-system/overlay", () => ({ toast: () => undefined }));
vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: ReactNode }) => <a href="/emergency">{children}</a> }));

const { Movement, MovementsSection } = await import("../../../src/features/journal/components/movements/movements");

beforeEach(() => {
  journal = [];
  saved.length = 0;
});

describe("Movement", () => {
  it("changed to slower, weaker or stopped, shows the call until put away", () => {
    render(<Movement entry={moved} />);
    fireEvent.click(screen.getByRole("button", { name: "Change this movement" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Slower, weaker or stopped?" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(saved).toEqual([{ key: "editMovement", input: expect.objectContaining({ id: "m1", different: true }) }]);
    expect(screen.getByRole("alert").textContent).toContain("Call your midwife or birth unit now.");
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("changed in any other way, no call", () => {
    render(<Movement entry={moved} />);
    fireEvent.click(screen.getByRole("button", { name: "Change this movement" }));
    fireEvent.change(screen.getByRole("textbox", { name: "About the movement" }), { target: { value: "Rolling" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("MovementsSection", () => {
  it("while something has happened, folds what was kept behind one quiet line, opened only when asked", () => {
    journal = [moved];
    render(<MovementsSection offered={false} quiet />);
    expect(screen.queryByText("Hiccups")).toBeNull();
    expect(screen.queryByRole("figure")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "The movements you kept" }));
    expect(screen.getByText("Hiccups")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Keep it" })).toBeNull();
  });

  it("otherwise shows the pattern and each movement", () => {
    journal = [moved];
    render(<MovementsSection offered quiet={false} />);
    expect(screen.getByRole("figure")).toBeTruthy();
    expect(screen.getByText("Hiccups")).toBeTruthy();
  });
});
