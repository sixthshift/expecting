import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A tool's page in the Drawer: drawn only while one of its extras is on,
// saying what it comes with while none is. Put away while quiet is its route's (putAway).
let choices: { id: string; on: boolean }[] = [];
vi.mock("../../../src/api/rpc/extras", () => ({
  useExtrasQuery: ({ select }: { select: (c: typeof choices) => unknown }) => ({ data: select(choices) }),
}));
vi.mock("../../../src/app/mobile/components/MobileCorner", () => ({ MobileCorner: () => null }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, search, children }: { to: string; search?: { ask?: string }; children: ReactNode }) => (
    <a href={search?.ask ? `${to}?ask=${search.ask}` : to}>{children}</a>
  ),
}));

const { DrawerTool } = await import("../../../src/pillars/drawer/components/tool/DrawerTool");

beforeEach(() => {
  choices = [];
});
afterEach(cleanup);

function tool(extras: ("babymoon" | "baby-budget")[]) {
  return render(
    <DrawerTool title="A tool" extras={extras}>
      <p>The tool itself</p>
    </DrawerTool>
  );
}

describe("DrawerTool", () => {
  it("the way back to the Drawer, and its name", () => {
    choices = [{ id: "babymoon", on: true }];
    tool(["babymoon"]);
    expect(screen.getByRole("link", { name: "The Drawer" }).getAttribute("href")).toBe("/drawer");
    expect(screen.getByRole("heading", { name: "A tool" })).toBeTruthy();
  });

  it("drawn while one of its extras is on", () => {
    choices = [
      { id: "babymoon", on: false },
      { id: "baby-budget", on: true },
    ];
    tool(["babymoon", "baby-budget"]);
    expect(screen.getByText("The tool itself")).toBeTruthy();
  });

  it("while none is, says which it comes with, and the way to turn it on", () => {
    choices = [{ id: "babymoon", on: false }];
    tool(["babymoon"]);
    expect(screen.queryByText("The tool itself")).toBeNull();
    expect(screen.getByText(/It comes with Babymoon\./)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Turn it on in settings" }).getAttribute("href")).toBe("/settings?ask=extra:babymoon");
  });

  it("of several, names them all, and opens settings at the first", () => {
    tool(["babymoon", "baby-budget"]);
    expect(screen.getByText(/It comes with Babymoon or Baby budget\./)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Turn one on in settings" }).getAttribute("href")).toBe("/settings?ask=extra:babymoon");
  });
});
