import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parseDay } from "../../../src/content/days";
import type { Item } from "../../../src/content/schema";
import { parseWeek } from "../../../src/content/weeks";

// The week, day by day: the note on its first day, a read each day after, one
// card at a time, the newest showing, the days before it a swipe back; each
// read ends in the entries it opens onto, those you'd see.
vi.mock("../../../src/features/library/components/ItemLink", () => ({
  ItemLink: ({ children, itemId }: { children: unknown; itemId: string }) => <a href={`#${itemId}`}>{children as string}</a>,
}));
vi.mock("../../../src/api/rpc/people", () => ({ usePeopleQuery: () => ({ data: { me: null, people: [] } }) }));

const { DayByDay } = await import("../../../src/features/thisWeek/components/dayByDay/DayByDay");

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

afterEach(cleanup);

describe("DayByDay", () => {
  it("starts with the note, shows today's read, and keeps the days before it out of reach until swiped to", () => {
    render(<DayByDay week={20} note={note} reads={reads} items={items} today={3} />);
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
    render(<DayByDay week={20} note={note} reads={reads} items={items} today={3} />);
    const yesterday = screen.getByText("20+2 · Yesterday").closest("section")!;
    expect([...yesterday.querySelectorAll("a")].map((a) => a.textContent)).toEqual(["A low-lying placenta"]);
  });

  it("on the note's own day, the note alone, today's, with no arrows", () => {
    render(<DayByDay week={20} note={note} reads={[]} items={items} today={0} />);
    expect(screen.getByText("20+0 · Today")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Halfway" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "The day before" })).toBeNull();
  });

  it("a week peeked at has no today, and opens on its note", () => {
    render(<DayByDay week={20} note={note} reads={reads} items={items} today={null} />);
    expect(screen.getByRole("region", { name: "20+0, 1 of 4" }).getAttribute("aria-hidden")).toBe("false");
    expect(screen.getByRole("heading", { name: "Halfway" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "The day before" }).hasAttribute("disabled")).toBe(true);
  });
});
