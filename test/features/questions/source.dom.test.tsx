import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Question } from "../../../src/lib/questions";

// An open question in the Planner names the entry it was asked from, unless
// that entry is discreet: its title would tell what the question's words don't.
vi.mock("../../../src/api/rpc/people", () => ({ usePeopleQuery: () => ({ data: { me: { id: "p1", name: "Alex" }, people: [{ id: "p1", name: "Alex" }] } }) }));
vi.mock("../../../src/api/rpc/questions", () => ({ questionsSaves: {}, useQuestionsQuery: () => ({ data: [] }) }));
vi.mock("../../../src/app/hooks/useSave", () => ({ useSave: () => () => undefined }));
vi.mock("../../../src/content", () => ({
  builtInItems: [
    { id: "anaemia-in-pregnancy", title: "Anaemia and low iron", private: false, discreet: false },
    { id: "antenatal-anxiety", title: "Anxiety during pregnancy", private: false, discreet: true },
  ],
}));
vi.mock("../../../src/features/library/components/ItemLink", () => ({
  ItemLink: ({ children }: { children: ReactNode }) => <a href="/library">{children}</a>,
}));

const { OpenQuestion } = await import("../../../src/features/questions/components/questions/questions");

function question(itemId: string): Question {
  return {
    id: "q1",
    text: "Can we talk about how I've been feeling lately?",
    answer: null,
    askedAt: null,
    itemId,
    by: "p1",
    createdAt: "2026-10-31T00:00:00Z",
  };
}

afterEach(cleanup);

describe("a question's source", () => {
  it("names the entry it was asked from, and whose it is", () => {
    render(<OpenQuestion question={question("anaemia-in-pregnancy")} />);
    expect(screen.getByRole("link", { name: "Anaemia and low iron" })).toBeTruthy();
    expect(screen.getByText(/Yours/)).toBeTruthy();
  });

  it("doesn't name a discreet entry, only whose it is", () => {
    render(<OpenQuestion question={question("antenatal-anxiety")} />);
    expect(screen.queryByText(/Anxiety during pregnancy/)).toBeNull();
    expect(screen.queryByText(/from/)).toBeNull();
    expect(screen.getByText("Yours")).toBeTruthy();
  });
});
