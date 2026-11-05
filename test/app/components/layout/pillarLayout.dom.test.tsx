import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Every page inside a pillar: a pillar's own (its title and lead; on a
// phone, the title in a bar that stays at the top, with the corner), a page under one (the way back, then perhaps its
// title), or neither (the page draws its own top). It never asks whether
// something has happened: a page put away then is its route's quiet world.
// On a desktop, a pillar with places of its own has its rail down the left.
vi.mock("../../../../src/app/mobile/components/MobileCorner", () => ({ MobileCorner: () => <div data-testid="corner" /> }));
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
  // happy-dom's own handle on the window, which a resize goes through so matchMedia follows.
  const happyDOM = (window as unknown as { happyDOM: { setWindowSize(size: { width: number; height: number }): void } }).happyDOM;

  it("a pillar's own page on a phone: its title in the bar that stays at the top, the corner beside it, no lead and no way back", () => {
    render(
      <PillarLayout title="The Planner" lead="What to do, and when.">
        <p>The page</p>
      </PillarLayout>
    );
    const heading = screen.getByRole("heading", { level: 1, name: "The Planner" });
    expect(heading.closest("header")?.className).toContain("sticky");
    expect(heading.closest("header")?.contains(screen.getByTestId("corner"))).toBe(true);
    expect(screen.queryByText("What to do, and when.")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("The page")).toBeTruthy();
  });

  it("a pillar's place as a tab on a phone: the pillar's name in the bar, its tabs under it, and no way back", () => {
    render(
      <PillarLayout back={{ to: "/planner", label: "Planner" }} tabs={{ title: "Planner", nav: <nav aria-label="Planner">Up next, Lists</nav> }} title="Lists">
        <p>The page</p>
      </PillarLayout>
    );
    const heading = screen.getByRole("heading", { level: 1, name: "Planner" });
    expect(heading.closest("header")?.contains(screen.getByRole("navigation", { name: "Planner" }))).toBe(true);
    expect(screen.queryByRole("link", { name: "Planner" })).toBeNull();
  });

  it("a pillar's own page on a desktop: its title and lead", () => {
    happyDOM.setWindowSize({ width: 1280, height: 800 });
    try {
      render(
        <PillarLayout title="The Planner" lead="What to do, and when.">
          <p>The page</p>
        </PillarLayout>
      );
      expect(screen.getByRole("heading", { level: 1, name: "The Planner" })).toBeTruthy();
      expect(screen.getByText("What to do, and when.")).toBeTruthy();
    } finally {
      happyDOM.setWindowSize({ width: 390, height: 844 });
    }
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

  describe("the rail", () => {
    const rail = <nav aria-label="Planner">The Planner's places</nav>;

    it("on a phone, never: the way back is how you go", () => {
      render(
        <PillarLayout rail={rail} back={{ to: "/planner", label: "Planner" }} title="Lists">
          <p>The page</p>
        </PillarLayout>
      );
      expect(screen.queryByRole("navigation", { name: "Planner" })).toBeNull();
      expect(screen.getByRole("link", { name: "Planner" }).getAttribute("href")).toBe("/planner");
    });

    it("on a desktop, beside the page and outside its main; the rail says where you are, so no way back", () => {
      happyDOM.setWindowSize({ width: 1280, height: 800 });
      try {
        const { container } = render(
          <PillarLayout rail={rail} back={{ to: "/planner", label: "Planner" }} title="Lists">
            <p>The page</p>
          </PillarLayout>
        );
        const nav = screen.getByRole("navigation", { name: "Planner" });
        expect(container.querySelector("main")?.contains(nav)).toBe(false);
        expect(screen.queryByRole("link", { name: "Planner" })).toBeNull();
        expect(screen.getByRole("heading", { level: 1, name: "Lists" })).toBeTruthy();
      } finally {
        happyDOM.setWindowSize({ width: 390, height: 844 });
      }
    });

    it("on a desktop, a page with no rail keeps its way back", () => {
      happyDOM.setWindowSize({ width: 1280, height: 800 });
      try {
        render(
          <PillarLayout back={{ to: "/drawer", label: "The Drawer" }} title="Baby names">
            <p>The page</p>
          </PillarLayout>
        );
        expect(screen.getByRole("link", { name: "The Drawer" })).toBeTruthy();
      } finally {
        happyDOM.setWindowSize({ width: 390, height: 844 });
      }
    });
  });
});
