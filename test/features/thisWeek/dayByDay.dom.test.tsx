import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parseDay } from "../../../src/content/days";
import type { Item } from "../../../src/content/schema";

// Day by day: one card at a time, the newest showing, the days before it a
// swipe back; each card ends in the entries it opens onto, those you'd see.
vi.mock("../../../src/features/library/components/ItemLink", () => ({
  ItemLink: ({ children, itemId }: { children: unknown; itemId: string }) => <a href={`#${itemId}`}>{children as string}</a>,
}));

const { DayByDay } = await import("../../../src/features/thisWeek/components/dayByDay/DayByDay");

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
  it("shows today's read, and keeps the days before it out of reach until swiped to", () => {
    render(<DayByDay reads={reads} items={items} today={3} peeking={false} />);
    const today = screen.getByRole("region", { name: "20+3 · Today, 3 of 3" });
    expect(today.getAttribute("aria-hidden")).toBe("false");
    expect(screen.getByRole("heading", { name: "First movements" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "The scan" })).toBeNull();
    expect(screen.getByRole("button", { name: "The day after" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "The day before" }).hasAttribute("disabled")).toBe(false);
  });

  it("names yesterday, and links only the entries you'd see", () => {
    render(<DayByDay reads={reads} items={items} today={3} peeking={false} />);
    const yesterday = screen.getByText("20+2 · Yesterday").closest("section")!;
    expect([...yesterday.querySelectorAll("a")].map((a) => a.textContent)).toEqual(["A low-lying placenta"]);
  });

  it("a week peeked at has no today, and one read needs no arrows", () => {
    render(<DayByDay reads={reads.slice(0, 1)} items={items} today={null} peeking />);
    expect(screen.getByRole("heading", { name: "Day by day that week" })).toBeTruthy();
    expect(screen.getByText("20+1")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "The day before" })).toBeNull();
  });
});
