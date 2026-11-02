import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parseDay } from "../../../src/content/days";
import type { Item } from "../../../src/content/schema";
import { parseWeek } from "../../../src/content/weeks";

// The week, day by day: the note on its first day, a read each day after, one
// card at a time, the newest showing, the days before it a swipe back; each
// read ends in the entries it opens onto, those you'd see.
vi.mock("../../../src/pillars/library/components/itemLink/ItemLink", () => ({
  ItemLink: ({ children, itemId }: { children: unknown; itemId: string }) => <a href={`#${itemId}`}>{children as string}</a>,
}));
vi.mock("../../../src/api/rpc/people", () => ({ usePeopleQuery: () => ({ data: { me: null, people: [] } }) }));

// Where you are, and the week peeked at (`?at=`), as the page's context reads them.
const where = vi.hoisted(() => ({ position: { week: 20, gestationDays: 143 }, at: undefined as number | undefined }));
vi.mock("@tanstack/react-router", () => ({ getRouteApi: () => ({ useSearch: () => ({ at: where.at }) }) }));
vi.mock("../../../src/api/rpc/settings", () => ({
  useSettingsQuery: () => ({ data: { dueDate: "2027-01-20" } }),
  usePosition: () => where.position,
  useNow: () => where.position.week,
}));
vi.mock("../../../src/pillars/library/hooks/useItems", () => ({ useItems: () => items }));
vi.mock("../../../src/content", () => ({ weekNotes: [note], dayReads: reads }));

const note = parseWeek(
  "weeks/20.md",
  "---\ntitle: Halfway\n---\n## The baby\n\nGrowing.\n\n## Your body\n\nStretching.\n\n## For the partner\n\nBook the scan.\n"
);
const read = (day: number, title: string, ids: string) =>
  parseDay(`days/20/${day}.md`, `---\ntitle: ${title}\nread: [${ids}]\n---\nSomething true about now.\n`);
const reads = [
  read(1, "The scan", "morphology-scan"),
  read(2, "The placenta", "low-lying-placenta, hidden-entry"),
  read(3, "First movements", "baby-movements"),
];
const items = [
  { id: "morphology-scan", title: "The morphology scan" },
  { id: "low-lying-placenta", title: "A low-lying placenta" },
  { id: "baby-movements", title: "Your baby's movements matter" },
] as Item[];

const { ThisWeekPageProvider } = await import("../../../src/pillars/thisWeek/contexts/ThisWeekPageContext");
const { DayByDay } = await import("../../../src/pillars/thisWeek/components/dayByDay/DayByDay");

/** The day by day on week 20, on its day `today` (0–6), or peeked at from week 21. */
function renderOn(today: number | "peek") {
  where.position = today === "peek" ? { week: 21, gestationDays: 147 } : { week: 20, gestationDays: 140 + today };
  where.at = today === "peek" ? 20 : undefined;
  return render(
    <ThisWeekPageProvider>
      <DayByDay />
    </ThisWeekPageProvider>
  );
}

afterEach(cleanup);

describe("DayByDay", () => {
  it("starts with the note, shows today's read, and keeps the days before it out of reach until swiped to", () => {
    renderOn(3);
    expect(screen.getByRole("heading", { name: "Week 20" })).toBeTruthy();
    expect(document.querySelector('[aria-label="20+0, 1 of 4"]')?.getAttribute("aria-hidden")).toBe("true");
    const today = screen.getByRole("region", { name: "20+3 · Today, 4 of 4" });
    expect(today.getAttribute("aria-hidden")).toBe("false");
    expect(screen.getByRole("heading", { name: "First movements" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "The scan" })).toBeNull();
    expect(screen.getByRole("button", { name: "The day after" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "The day before" }).hasAttribute("disabled")).toBe(false);
  });

  it("names yesterday, and links only the entries you'd see", () => {
    renderOn(3);
    const yesterday = screen.getByText("20+2 · Yesterday").closest("section")!;
    expect([...yesterday.querySelectorAll("a")].map((a) => a.textContent)).toEqual(["A low-lying placenta"]);
  });

  it("on the note's own day, the note alone, today's, with no arrows", () => {
    renderOn(0);
    expect(screen.getByText("20+0 · Today")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Halfway" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "The day before" })).toBeNull();
  });

  it("a week peeked at has no today, and opens on its note", () => {
    renderOn("peek");
    expect(screen.getByRole("region", { name: "20+0, 1 of 4" }).getAttribute("aria-hidden")).toBe("false");
    expect(screen.getByRole("heading", { name: "Halfway" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "The day before" }).hasAttribute("disabled")).toBe(true);
  });
});
