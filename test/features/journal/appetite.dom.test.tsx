import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppetiteEntry } from "../../../src/lib/appetite";
import { addDays, todayISO } from "../../../src/lib/dates";

// Sickness and cravings in the Journal, with the query cache and the outbox
// stood in for: since when and the weeks, a quiet word when she's been sick
// often (with the question to take along), the fun tally, the second craving
// in one tap, a change to can't keep fluids down showing the call, and,
// while something has happened, what was kept folded away.
const SAM = { id: "sam", name: "Sam", role: "carrying" as const };
const today = todayISO();
let n = 0;
function kept(day: string, rest: Partial<AppetiteEntry> = {}): AppetiteEntry {
  n += 1;
  return {
    id: `a${n}`,
    kind: "sick",
    day,
    time: "03:10",
    how: "vomited",
    what: null,
    note: null,
    by: SAM.id,
    createdAt: `${day}T00:00:00.000Z`,
    editedBy: null,
    editedAt: null,
    ...rest,
  };
}
let appetite: AppetiteEntry[] = [];
const saved: { key: string; input: unknown }[] = [];

vi.mock("../../../src/api/rpc/appetite", () => ({
  appetiteSaves: {
    addAppetite: { key: "addAppetite" },
    editAppetite: { key: "editAppetite" },
    deleteAppetite: { key: "deleteAppetite" },
    restoreAppetite: { key: "restoreAppetite" },
  },
  useAppetite: () => ({ data: appetite }),
}));
vi.mock("../../../src/api/rpc/questions", () => ({ questionsSaves: { addQuestion: { key: "addQuestion" } }, useQuestions: () => ({ data: [] }) }));
vi.mock("../../../src/api/rpc/people", () => ({ usePeople: () => ({ data: { me: SAM, people: [SAM] } }) }));
vi.mock("../../../src/api/rpc/settings", () => ({ useSettings: () => ({ data: { dueDate: null } }) }));
vi.mock("../../../src/app/hooks/useSave", () => ({ useSave: (save: { key: string }) => (input: unknown) => saved.push({ key: save.key, input }) }));
vi.mock("../../../src/app/components/layout/CallBirthSuite", () => ({ CallBirthSuite: () => <a href="tel:0390000000">Call the birth suite</a> }));
vi.mock("../../../src/features/library/components/ItemLink", () => ({ ItemLink: ({ children }: { children: ReactNode }) => children }));
vi.mock("@sixthshift/design-system/overlay", () => ({ toast: () => undefined }));
vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: ReactNode }) => <a href="/emergency">{children}</a> }));

const { AddCraving, AppetiteItem, AppetiteLens } = await import("../../../src/features/journal/components/appetite/appetite");

beforeEach(() => {
  appetite = [];
  saved.length = 0;
});

describe("AppetiteLens", () => {
  it("says since when, and draws the weeks as rows of days", () => {
    appetite = [kept(addDays(today, -9), { how: "queasy" }), kept(today)];
    render(<AppetiteLens />);
    expect(screen.getByText(/^Since /)).toBeTruthy();
    expect(screen.getByText(/Last: today, 3:10 am, threw up\./)).toBeTruthy();
    const rows = within(screen.getByRole("figure")).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(rows[0]!.textContent).toContain("1 day");
    expect(screen.queryByText(/Being sick often/)).toBeNull();
  });

  it("when she's been sick often, says so quietly, with the question to take along", () => {
    appetite = [0, 1, 2, 3].map((d) => kept(addDays(today, -d)));
    render(<AppetiteLens />);
    expect(screen.getByText(/Threw up on 4 of the last 7 days\. Being sick often is worth a call/)).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /^Add to your questions: I've been sick on 4 of the last 7 days/ }));
    expect(saved).toEqual([
      {
        key: "addQuestion",
        input: expect.objectContaining({ text: expect.stringMatching(/^I've been sick on 4 of the last 7 days, since .+\. What can help\?$/) }),
      },
    ]);
  });

  it("tallies what was craved, and keeps one again in a tap", () => {
    appetite = [
      kept(today, { kind: "craving", how: null, what: "Pickles" }),
      kept(today, { kind: "craving", how: null, what: "pickles" }),
      kept(today, { kind: "off", how: null, what: "Coffee" }),
    ];
    render(<AppetiteLens />);
    expect(screen.getByText("What you've craved")).toBeTruthy();
    expect(screen.getByText(/2 times/)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Gone off" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Keep Pickles again" })).toBeNull();
    cleanup();
    render(<AddCraving />);
    fireEvent.click(screen.getByRole("button", { name: "Keep Pickles again" }));
    expect(saved).toEqual([{ key: "addAppetite", input: expect.objectContaining({ kind: "craving", what: "Pickles" }) }]);
  });
});

describe("AppetiteItem", () => {
  it("changed to can't keep fluids down, shows the call until put away", () => {
    const entry = kept(today, { how: "queasy" });
    render(<AppetiteItem entry={entry} />);
    fireEvent.click(screen.getByRole("button", { name: "Change this" }));
    fireEvent.click(screen.getByRole("radio", { name: /Can't keep fluids down/ }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(saved).toEqual([{ key: "editAppetite", input: { id: entry.id, kind: "sick", day: today, time: "03:10", how: "fluids", what: null, note: null } }]);
    expect(screen.getByRole("alert").textContent).toContain("Call your doctor, midwife or hospital now.");
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("deleted, can be put back", () => {
    const entry = kept(today, { kind: "craving", how: null, what: "Ice" });
    render(<AppetiteItem entry={entry} />);
    expect(screen.getByText("Craving: Ice")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Delete this" }));
    expect(saved).toEqual([{ key: "deleteAppetite", input: { id: entry.id } }]);
  });
});
