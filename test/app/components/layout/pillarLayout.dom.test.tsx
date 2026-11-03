import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Every page inside a pillar: a pillar's own (its title, lead and, on a
// phone, the corner), a page under one (the way back, then perhaps its
// title), or neither (the page draws its own top). It never asks whether
// something has happened: a page put away then is its route's quiet world.
vi.mock("../../../../src/app/components/layout/AppLayout", () => ({ PhoneCorner: () => <div data-testid="corner" /> }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const { PillarLayout } = await import("../../../../src/app/components/layout/PillarLayout");

afterEach(cleanup);

describe("PillarLayout", () => {
  it("a pillar's own page: its title and lead, and the phone's corner, with no way back", () => {
    render(
      <PillarLayout title="The Planner" lead="What to do, and when.">
        <p>The page</p>
      </PillarLayout>
    );
    expect(screen.getByRole("heading", { level: 1, name: "The Planner" })).toBeTruthy();
    expect(screen.getByText("What to do, and when.")).toBeTruthy();
    expect(screen.getByTestId("corner")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("The page")).toBeTruthy();
  });

  it("a page under one: the way back to where it goes, then its title; no corner", () => {
    render(
      <PillarLayout back={{ to: "/drawer", label: "The Drawer" }} title="Baby names">
        <p>The page</p>
      </PillarLayout>
    );
    const back = screen.getByRole("link", { name: "The Drawer" });
    expect(back.getAttribute("href")).toBe("/drawer");
    const heading = screen.getByRole("heading", { level: 1, name: "Baby names" });
    expect(back.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByTestId("corner")).toBeNull();
  });

  it("a page under one that draws its own title: the way back alone", () => {
    render(
      <PillarLayout back={{ to: "/library", label: "The Library" }}>
        <p>The page</p>
      </PillarLayout>
    );
    expect(screen.getByRole("link", { name: "The Library" }).getAttribute("href")).toBe("/library");
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByText("The page")).toBeTruthy();
  });

  it("neither: no header, only the page", () => {
    const { container } = render(
      <PillarLayout>
        <p>The page</p>
      </PillarLayout>
    );
    expect(container.querySelector("header")).toBeNull();
    expect(screen.queryByTestId("corner")).toBeNull();
    expect(screen.getByText("The page")).toBeTruthy();
  });

  it("its column at the page's width, the widest by default", () => {
    const { container, rerender } = render(
      <PillarLayout>
        <p>The page</p>
      </PillarLayout>
    );
    expect(container.querySelector("main")?.classList.contains("max-w-6xl")).toBe(true);
    rerender(
      <PillarLayout width="2xl">
        <p>The page</p>
      </PillarLayout>
    );
    const main = container.querySelector("main")!;
    expect(main.classList.contains("max-w-2xl")).toBe(true);
    expect(main.classList.contains("max-w-6xl")).toBe(false);
  });
});
