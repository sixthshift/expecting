import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JournalEntry } from "../../../src/lib/journal";

// Notes and letters, with the query cache and the outbox stood in for: a
// letter can be from both of you once there are two, and is signed so.
const SAM = { id: "sam", name: "Sam", role: "carrying" as const };
const ALEX = { id: "alex", name: "Alex", role: "partner" as const };
let people = { me: SAM, people: [SAM, ALEX] };
const saved: { key: string; input: unknown }[] = [];

vi.mock("../../../src/api/rpc/journal", () => ({
  journalSaves: {
    addNote: { key: "addNote" },
    editNote: { key: "editNote" },
    deleteNote: { key: "deleteNote" },
    restoreNote: { key: "restoreNote" },
  },
}));
vi.mock("../../../src/api/rpc/people", () => ({ usePeople: () => ({ data: people }) }));
vi.mock("../../../src/app/hooks/useSave", () => ({ useSave: (save: { key: string }) => (input: unknown) => saved.push({ key: save.key, input }) }));
vi.mock("@sixthshift/design-system/overlay", () => ({ toast: () => undefined }));

const { AddNote } = await import("../../../src/features/journal/components/entries/notes/AddNote");
const { Note } = await import("../../../src/features/journal/components/entries/notes/Note");

const letter: JournalEntry = {
  id: "l1",
  kind: "letter",
  day: "2026-10-30",
  time: null,
  body: "Dear you",
  different: false,
  fromBoth: true,
  by: ALEX.id,
  createdAt: "2026-10-30T00:00:00.000Z",
  editedBy: null,
  editedAt: null,
};

beforeEach(() => {
  people = { me: SAM, people: [SAM, ALEX] };
  saved.length = 0;
});

describe("AddNote", () => {
  it("a letter can be from both of you, and is kept so", () => {
    render(<AddNote />);
    expect(screen.queryByRole("checkbox", { name: "From both of us" })).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "New note" }), { target: { value: "Dear you" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "A letter to the baby" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "From both of us" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep it" }));
    expect(saved).toEqual([{ key: "addNote", input: expect.objectContaining({ kind: "letter", fromBoth: true }) }]);
  });

  it("with one of you, no 'from both'", () => {
    people = { me: SAM, people: [SAM] };
    render(<AddNote />);
    fireEvent.click(screen.getByRole("checkbox", { name: "A letter to the baby" }));
    expect(screen.queryByRole("checkbox", { name: "From both of us" })).toBeNull();
  });
});

describe("Note", () => {
  it("a letter from both is signed by both, whoever kept it", () => {
    render(<Note entry={letter} />);
    expect(screen.getByText(/From both of you/)).toBeTruthy();
    expect(screen.queryByText(/Alex/)).toBeNull();
  });
});
