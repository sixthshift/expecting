import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Feelings } from "../../../src/api/rpc/feelings";
import { todayISO } from "../../../src/lib/dates";

// The check-in's own rule, with the query cache and the outbox stood in for:
// what it asks, what a tap keeps, and when support shows.
const SAM = { id: "sam", name: "Sam", role: "carrying" as const };
const ALEX = { id: "alex", name: "Alex", role: "partner" as const };
let feelings: Feelings = [];
const saved: { key: string; input: unknown }[] = [];

vi.mock("../../../src/api/rpc/feelings", () => ({
  feelingsSaves: { addFeeling: { key: "addFeeling" }, changeFeeling: { key: "changeFeeling" } },
  useFeelings: () => ({ data: feelings }),
}));
vi.mock("../../../src/api/rpc/people", () => ({ usePeople: () => ({ data: { me: SAM, people: [SAM, ALEX] } }) }));
vi.mock("../../../src/app/hooks/useSave", () => ({ useSave: (save: { key: string }) => (input: unknown) => saved.push({ key: save.key, input }) }));
vi.mock("../../../src/features/library/components/ItemLink", () => ({ ItemLink: ({ children }: { children: unknown }) => children }));

const { CheckIn } = await import("../../../src/features/feelings/components/checkIn/CheckIn");
const { HardFortnight, FORTNIGHT_DISMISSED_KEY } = await import("../../../src/features/feelings/components/fortnight/HardFortnight");

const today = todayISO();
const kept = (step: string, extra: object = {}) => ({
  id: "f1",
  by: SAM.id,
  day: today,
  time: "08:00",
  step,
  words: [],
  note: null,
  createdAt: `${today}T00:00:00.000Z`,
  ...extra,
});

beforeEach(() => {
  feelings = [];
  saved.length = 0;
});
afterEach(() => localStorage.clear());

describe("CheckIn", () => {
  it("asks by name, and one tap keeps the step, then offers words", () => {
    const { rerender } = render(<CheckIn />);
    expect(screen.getByRole("heading", { name: "How are you today, Sam?" })).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Okay"));
    expect(saved).toEqual([{ key: "addFeeling", input: expect.objectContaining({ step: "okay", day: today, words: [], note: null }) }]);

    feelings = [kept("okay")] as Feelings;
    rerender(<CheckIn />);
    expect(screen.getByText("Alex sees how you are, not these words.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "tired" }));
    fireEvent.change(screen.getByLabelText("Say more"), { target: { value: "  Long day  " } });
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(saved.at(-1)).toEqual({ key: "changeFeeling", input: expect.objectContaining({ id: "f1", step: "okay", words: ["tired"], note: "Long day" }) });
    expect(screen.getByRole("heading", { name: "Okay today" })).toBeTruthy();
  });

  it("folds today's answer, and changing the step changes today's, its words kept", () => {
    feelings = [kept("good", { words: ["calm"] })] as Feelings;
    render(<CheckIn />);
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    fireEvent.click(screen.getByLabelText("Low"));
    expect(saved).toEqual([{ key: "changeFeeling", input: expect.objectContaining({ id: "f1", step: "low", words: ["calm"] }) }]);
  });

  it("still asks you after the other has checked in: only your own is today's", () => {
    feelings = [{ id: "f2", by: ALEX.id, day: today, time: "08:00", step: "great", createdAt: `${today}T00:00:00.000Z` }];
    render(<CheckIn />);
    expect(screen.getByRole("heading", { name: "How are you today, Sam?" })).toBeTruthy();
  });

  it("on a rough day, someone to talk to, quietly", () => {
    feelings = [kept("rough")] as Feelings;
    render(<CheckIn />);
    expect(screen.getByText("Want to talk to someone?")).toBeTruthy();
    expect(screen.getByRole("link", { name: /PANDA, 1300 726 306/ }).getAttribute("href")).toBe("tel:1300726306");
  });
});

describe("HardFortnight", () => {
  const hard = () =>
    [0, 1, 2, 3].map((i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return kept("low", { id: `h${i}`, day: todayISO(d) });
    }) as Feelings;

  it("shows after most days low, and Not now puts it away for a fortnight", () => {
    feelings = hard();
    const { rerender } = render(<HardFortnight />);
    expect(screen.getByRole("heading", { name: "It's been a hard couple of weeks" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(screen.queryByRole("heading", { name: "It's been a hard couple of weeks" })).toBeNull();
    expect(localStorage.getItem(FORTNIGHT_DISMISSED_KEY)).toBe(today);
    rerender(<HardFortnight />);
    expect(screen.queryByRole("heading", { name: "It's been a hard couple of weeks" })).toBeNull();
  });

  it("says nothing on an ordinary fortnight", () => {
    feelings = hard().map((f) => ({ ...f, step: "good" as const }));
    render(<HardFortnight />);
    expect(screen.queryByRole("heading")).toBeNull();
  });
});
