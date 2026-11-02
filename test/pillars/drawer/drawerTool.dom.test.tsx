import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A tool's page in the Drawer: drawn only while one of its extras is on,
// saying what it comes with while none is, and put away while quiet.
let choices: { id: string; on: boolean }[] = [];
let quiet: object | null = null;
vi.mock("../../../src/api/rpc/extras", () => ({
  useExtrasQuery: ({ select }: { select: (c: typeof choices) => unknown }) => ({ data: select(choices) }),
}));
vi.mock("../../../src/api/rpc/quiet", () => ({ useQuietQuery: () => ({ data: quiet }) }));
vi.mock("../../../src/app/components/layout/AppLayout", () => ({ PhoneCorner: () => null }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, search, children }: { to: string; search?: { ask?: string }; children: ReactNode }) => (
    <a href={search?.ask ? `${to}?ask=${search.ask}` : to}>{children}</a>
  ),
}));

const { DrawerTool } = await import("../../../src/pillars/drawer/components/tool/DrawerTool");

beforeEach(() => {
  choices = [];
  quiet = null;
});
afterEach(cleanup);

function tool(extras: ("babymoon" | "baby-budget")[]) {
  return render(
    <DrawerTool title="A tool" putAway={{ subject: "The tool" }} extras={extras}>
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

  it("put away while quiet, on or off", () => {
    quiet = { kind: "loss", setBy: null, setAt: "2026-10-30T00:00:00.000Z" };
    choices = [{ id: "babymoon", on: true }];
    tool(["babymoon"]);
    expect(screen.getByText("The tool is put away while Expecting is quiet. Nothing is deleted.")).toBeTruthy();
    expect(screen.queryByText("The tool itself")).toBeNull();
  });
});
