import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parseWeek } from "../../../src/content/weeks";
import type { HomePage } from "../../../src/pillars/home/contexts/HomePageContext";

// This week's context: the week shown (this one, or `?at=`), whether that's a
// peek, and the note: now, the one in force; a peek, only that week's own.
const where = vi.hoisted(() => ({ now: 21 as number | null, at: undefined as number | undefined }));
vi.mock("@tanstack/react-router", () => ({ getRouteApi: () => ({ useSearch: () => ({ at: where.at }) }) }));
vi.mock("../../../src/api/rpc/settings", () => ({
  useSettingsQuery: () => ({ data: { dueDate: where.now === null ? null : "2027-01-20" } }),
  usePosition: () => (where.now === null ? null : { week: where.now, gestationDays: where.now * 7 }),
  useNow: () => where.now,
}));
vi.mock("../../../src/content", () => ({ weekNotes: [note] }));

const note = parseWeek(
  "weeks/20.md",
  "---\ntitle: Halfway\n---\n## The baby\n\nGrowing.\n\n## Your body\n\nStretching.\n\n## For the partner\n\nBook the scan.\n"
);

const { HomePageProvider, useHomePage } = await import("../../../src/pillars/home/contexts/HomePageContext");

let seen: HomePage;
function Probe() {
  seen = useHomePage();
  return null;
}
function pageAt(now: number | null, at?: number) {
  where.now = now;
  where.at = at;
  render(
    <HomePageProvider>
      <Probe />
    </HomePageProvider>
  );
  return seen;
}

afterEach(cleanup);

describe("HomePageProvider", () => {
  it("shows this week, not a peek, with the note still in force from the week before", () => {
    const page = pageAt(21);
    expect(page).toMatchObject({ week: 21, now: 21, peeking: false, dueDate: "2027-01-20" });
    expect(page.note?.title).toBe("Halfway");
  });

  it("?at= is a peek at that week, and a peek shows only that week's own note", () => {
    const at20 = pageAt(21, 20);
    expect(at20).toMatchObject({ week: 20, now: 21, peeking: true });
    expect(at20.note?.title).toBe("Halfway");
    cleanup();
    const at22 = pageAt(21, 22);
    expect(at22).toMatchObject({ week: 22, peeking: true, note: null });
  });

  it("?at= this very week is no peek", () => {
    expect(pageAt(20, 20)).toMatchObject({ week: 20, peeking: false });
  });

  it("without a due date, no week at all, ?at= or not", () => {
    expect(pageAt(null, 20)).toMatchObject({ week: null, now: null, peeking: false, position: null, note: null });
  });

  it("is only for the page's parts", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow(/inside HomePageProvider/);
  });
});
