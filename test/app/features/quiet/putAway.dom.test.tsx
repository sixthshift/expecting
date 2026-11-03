import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A page put away while something has happened: its top as it is, and in
// place of the page, what's put away, never deleted.
let params: Record<string, string> = {};
vi.mock("../../../../src/app/components/layout/AppLayout", () => ({ PhoneCorner: () => <div data-testid="corner" /> }));
vi.mock("@tanstack/react-router", () => ({
  useParams: () => params,
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

const { putAway } = await import("../../../../src/app/features/quiet/putAway");

beforeEach(() => {
  params = {};
});
afterEach(cleanup);

describe("putAway", () => {
  it("says what's put away, under the page's own top", () => {
    const Page = putAway({ subject: "The lists", are: true, back: { to: "/planner", label: "Planner" }, title: "Lists", lead: "What to get." });
    render(<Page />);
    expect(screen.getByText("The lists are put away while Expecting is quiet. Nothing is deleted.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Planner" }).getAttribute("href")).toBe("/planner");
    expect(screen.getByRole("heading", { level: 1, name: "Lists" })).toBeTruthy();
    expect(screen.getByText("What to get.")).toBeTruthy();
  });

  it("put aside, said as such", () => {
    const Page = putAway({ subject: "The to-do list", aside: true });
    render(<Page />);
    expect(screen.getByText("The to-do list is put aside while Expecting is quiet. Nothing is deleted.")).toBeTruthy();
  });

  it("a pillar's own page keeps its corner", () => {
    const Page = putAway({ subject: "The names and everything else here", are: true, title: "Drawer" });
    render(<Page />);
    expect(screen.getByTestId("corner")).toBeTruthy();
  });

  it("the way back from the route's params", () => {
    params = { listId: "bag" };
    const Page = putAway({ subject: "The lists", are: true, back: ({ listId }) => ({ to: `/lists/${listId}`, label: "Back" }) });
    render(<Page />);
    expect(screen.getByRole("link", { name: "Back" }).getAttribute("href")).toBe("/lists/bag");
  });
});
